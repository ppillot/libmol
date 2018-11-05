import Vue from 'vue'
import Vuex from 'vuex'
import VueI18n from 'vue-i18n'

// import * as actions from './actions'
// import * as getters from './getters'
import {Stage, Selection, ColormakerRegistry, download, Vector3, Vector2, setDebug, MouseActions, Shape} from 'ngl'
/* eslint-disable-next-line */
// let NGL = () => import('ngl') /* eslint-disable-line */
import debounce from 'throttle-debounce/debounce'
import Screenfull from 'screenfull'
import {getHelp} from 'utils/help.ts'
import {hover} from 'utils/hover'
import {measure} from 'utils/measures'
import {loadFile} from 'utils/loadfile'
import {byres} from 'utils/colors'
import surface from 'utils/surface'
import {contact} from 'utils/contacts'
import {ssBridges} from 'utils/ssbridges'
import {Notification} from 'element-ui'
import getStartingParameters from 'utils/startup.ts'
import {mouseFocus} from 'utils/mouse-focus'

let NGL = {Stage, Selection, ColormakerRegistry, download, Vector2, Vector3, setDebug, MouseActions, Shape}
Vue.use(Vuex)
Vue.use(VueI18n)
/** @description local module variable to hold the NGL stage object
 * @typedef {NGL.stage}
 */
let stage = {
  setParameters: function () {}
}
let structure = {}
let representationsList = []
// let contactsReprList = []
let highlight
let loadNewFile
let measurement
let surf
let contacts
let ssbridges
let currentSelectionAtomSet
let currentlyDisplayedAtomSet
let tempDisplayedAtomSet
let wholeAtomSet
let tabColorScheme = [['element', 'all']]
let tabColorAtomSet
let globalColorScheme = ''
let predefined
let latestHelp = {}
let startParams = getStartingParameters()

// console.log(startParams)

/**
 * @description removes atoms from their current representation so that they are set only in the latest
 *
 * @param {NGL atomSet} atomSet
 * @param {number} skipReprIndex index of the latest representation : must be skipped !
 */
function removeSelectionFromRepresentations (newAtomSet, skipRepr, overlay = false) {
  for (let i = 0; i < representationsList.length; i++) {
    if ((representationsList[i].repr.uuid === skipRepr.uuid) || (i > 0 && representationsList[i - 1].repr.uuid === skipRepr.uuid && representationsList[i].display === 'base')) {
      continue
    } else if (overlay && ['cartoon', 'ribbon', 'backbone'].includes(representationsList[i].display)) {
      continue
    } else if (representationsList[i].display === 'contact') {
      continue
    }
    const repr = representationsList[i]
    if (repr.atomSet.intersects(newAtomSet)) {
      repr.atomSet.difference(newAtomSet)
      repr.displayedAtomSet.difference(newAtomSet)
      let sele = repr.displayedAtomSet.toSeleString()
      sele += (repr.overlay && sele !== 'NONE') ? ' and sidechainAttached' : ''

      repr.repr.setSelection(sele)
    }
  }
  // debugger
  ssbridges.update()
}

/**
 * @description update a representation based on its name, with a parameter object
 *
 * @param {array} reprNames name of the representation to update (e.g. 'spacefill')
 * @param {object} parameters object with new parameters (e.g. {multipleBond: symmetric})
 */
function updateRepresentationParameters (reprNames, parameters) {
  representationsList.forEach(repr => {
    if (reprNames.includes(repr.display)) {
      repr.repr.setParameters(parameters)
    }
  })
}

function removeSelectionFromColorSchemes (atomSet, skipColorSchemeIndex) {
  let clearableColorSchemes = []

  tabColorScheme.forEach((colorScheme, i) => {
    if (i === skipColorSchemeIndex) return
    if (tabColorAtomSet[i].intersects(atomSet)) {
      let selAtomSet = tabColorAtomSet[i].difference(atomSet)
      if (selAtomSet.count === 0) {
        clearableColorSchemes.push(i)
      } else {
        colorScheme[1] = selAtomSet.toSeleString()
      }
    }
  })

  // this colorSchemes are empty, we can dispose them
  clearableColorSchemes.reverse().forEach(i => {
    tabColorAtomSet.splice(i, 1)
    tabColorScheme.splice(i, 1)
  })
}

function getRepresentationFromSelection (as = currentSelectionAtomSet) {
  // edge case atom set is empty
  if (as.isAllClear()) return ''

  const currentSelectionRepresentation = representationsList.find(repr => {
    return (!repr.atomSet.isAllClear() && repr.atomSet.getIntersectionSize(as) === as.getSize())
  })
  return (currentSelectionRepresentation === undefined) ? 'mix' : currentSelectionRepresentation.display
}

function getColorFromSelection (as = currentSelectionAtomSet) {
  // edge case atom set is empty
  if (as.isAllClear()) return 'none'
  let color = 'mix'
  tabColorAtomSet.forEach((colorAS, index) => {
    if (!colorAS.isAllClear() && colorAS.getIntersectionSize(as) === as.getSize()) {
      color = tabColorScheme[index][0]
    }
  })
  return color
}

function updateGlobalColorScheme () {
  NGL.ColormakerRegistry.removeScheme(globalColorScheme)
  globalColorScheme = NGL.ColormakerRegistry.addSelectionScheme(tabColorScheme.map(
    (val) => {
      if (val[0] === 'resname') {
        return [byres, val[1]]
      } else {
        return val
      }
    }
  ), 'default')
}

function updateRepresentationColor () {
  stage.compList[0].eachRepresentation(repr => {
    if (repr.name === 'highlight' ||
      repr.name === 'distance' ||
      repr.name === 'angle' ||
      repr.name === 'label' ||
      repr.name === 'contact' ||
      repr.name === 'ssbridge' ||
      repr.name.indexOf('molsurf') > -1) return
    repr.setColor(globalColorScheme)
  })
}

function updateRepresentationDisplay () {
  representationsList.forEach(repr => {
    if (repr.name === 'highlight') return
    repr.displayedAtomSet = repr.atomSet.clone().intersection(currentlyDisplayedAtomSet)
    // console.log('update repr:', repr.name, repr.index, repr.displayedAtomSet)
    repr.repr.setSelection(repr.displayedAtomSet.toSeleString())
  })
}

function updateStageCenter () {
  const sele = currentlyDisplayedAtomSet.toSeleString()
  stage.compList[0].autoView(sele, 1000)
}

/* function triggerContextMenu (context) {
  return function (stage) {
    console.log(stage.mouseObserver.canvasPosition)
  }
} */

function resizeStage (stage) {
  return function () {
    stage.handleResize()
  }
}

function getDescriptionFromRes (res) {
  var description = ''
  switch (res.moleculeType) {
    case 3:
      description = 'biochem.amino_acid_short'
      break
    case 4:
      description = 'biochem.nucleotide'
      break
    case 5:
      description = 'biochem.nucleotide'
      break
    default:
      description = (res.entity) ? res.entity.description : 'unknown'
      break
  }
  return description
}

function highlightRes (component) {
  let reprHighlight = component.addRepresentation('spacefill',
    {
      sele: 'none',
      color: 'limegreen',
      opacity: 0.2,
      radiusType: 'vdw',
      radiusScale: 1.2,
      name: 'highlight'
    })
  return function (sel) {
    reprHighlight.setSelection(sel)
  }
}

function getPredefined (str, chains) {
  const getAtomSet = function (sele) {
    return str.getAtomSet(new NGL.Selection(sele))
  }

  let predefinedSets = [
    ['all', structure.getAtomSet()],
    ['protein', getAtomSet('protein')],
    ['saccharide', getAtomSet('saccharide')],
    ['nucleic', getAtomSet('nucleic')],
    ['water', getAtomSet('water')],
    ['hetero', getAtomSet('hetero and not water and not saccharide')],
    ['user', getAtomSet('none')]
  ]

  const chainSet = new Map()
  chains.forEach(chain => {
    chainSet.set(chain.name, getAtomSet(':' + chain.name))
  })

  const findSet = function (selector) {
    let ret = {
      selection: 'none',
      chains: []
    }
    let as = currentSelectionAtomSet

    // Special case : check for empty atomset
    if (as.isAllClear()) return ret

    // Special case #2 : selector has been provided
    if (selector !== undefined) {
      for (let i = 0; i < predefinedSets.length; i++) {
        if (predefinedSets[i][0] === selector) {
          ret.selection = selector
          break
        }
      }
    }

    // check if currently selected atoms are equal to any predefined atom sets
    if (ret.selection === 'none') {
      let preset = predefinedSets.find(pds => {
        return (pds[1].isEqualTo(as))
      })
      ret.selection = (preset !== undefined) ? preset[0] : ''
    }

    // check which chains are currently entirely selected
    chainSet.forEach((chainAtomSet, chainName) => {
      if (chainAtomSet.getIntersectionSize(as) === chainAtomSet.getSize()) {
        ret.chains.push(chainName)
      }
    })

    return ret
  }

  function findVisibleSets () {
    let molSets = {}
    const das = currentlyDisplayedAtomSet

    predefinedSets.forEach(as => {
      molSets[as[0]] = as[1].intersects(das)
    })

    chainSet.forEach((as, name) => {
      molSets[name] = as.intersects(das)
    })

    return molSets
  }

  function updateUserSet (as) {
    predefinedSets.forEach(set => {
      if (set[0] === 'user') {
        set[1] = as
      }
    })
  }

  function getPreset (presetName) {
    return predefinedSets.find(val => { return val[0] === presetName })[1]
  }

  return {
    findSelected: findSet,
    findVisible: findVisibleSets,
    userSelection: updateUserSet,
    getAtomSet: getPreset
  }
}

const debug = process.env.NODE_ENV !== 'production'

if (debug) {
  window.NGL = NGL
  window.stage = stage
  window.structure = structure
  window.repr = representationsList
}

var vuex = new Vuex.Store({
  state: {
    fileName: '',
    name: 'LibMol',
    source: 'libmol',
    molCode: '',
    dbId: '',
    fullscreen: false,
    embedded: startParams.embedded,
    isMeasuringDistances: false,
    isMeasuringAngles: false,
    mol: {
      chains: [],
      atoms: [],
      elements: new Set(),
      hetero: [],
      residues: new Set(),
      molTypes: {
        protein: true,
        nucleic: false,
        water: false,
        saccharide: false,
        hetero: false,
        dna: false,
        rna: false,
        ion: false
      },
      sstruc: new Set(),
      noSequence: false,
      nbSSBridges: 0
    },
    selected: [],
    selectedChains: [],
    selectedPercentage: 100,
    hiddenPercentage: 0,
    visible: {},
    selection: 'all',
    display: 'licorice',
    color: 'element',
    multipleBond: false,
    ssBridgeDisplayed: false,
    fog: [50, 100],
    atomHovered: {
      symbol: '',
      atomname: '',
      resname: '',
      resno: '',
      chainname: '',
      entity: '',
      pos: {
        x: 0,
        y: 0
      }
    },
    activeContact: null,
    contactHovered: {
    },
    contactsReprList: [],
    isAtomHovered: false,
    isContactHovered: false,
    isContextMenuCalled: false,
    isHidden: false,
    itemHovered: {
      name: '',
      num: -1,
      chain: '',
      description: ''
    },
    anchor: {},
    contextMenuPos: {},
    stage: {
      clipNear: 30
    },
    distances: [],
    angles: [],
    surfaces: [],
    contacts: [],
    wholeMoleculeContacts: [],
    help: {
      'commands': '',
      'contacts': ''
    },
    helpHistory: {
      'commands': [],
      'contacts': []
    },
    helpHistoryForward: {
      'commands': [],
      'contacts': []
    },
    alert: {
      type: '',
      token: {}
    },
    isUserSelectionValid: false,
    userSelectionSize: 0,
    userSelectionText: null,
    activeTab: 'files'
  },
  mutations: {
    setActiveTab (state, value) {
      state.activeTab = value
    },
    alert (state, {type, token}) {
      state.alert.type = type
      state.alert.token = token
    },
    loadNewFile (state, newFile) {
      state.fileName = newFile.file
      state.name = newFile.value
      state.source = newFile.source
      state.molCode = newFile.molCode
      state.dbId = newFile.molId
    },
    setMolTypes (state, {molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence, hetero}) {
      state.mol.molTypes.protein = molTypes.has(3)
      state.mol.molTypes.dna = molTypes.has(5)
      state.mol.molTypes.rna = molTypes.has(4)
      state.mol.molTypes.nucleic = state.mol.molTypes.dna || state.mol.molTypes.rna
      state.mol.molTypes.water = molTypes.has(1)
      state.mol.molTypes.saccharide = molTypes.has(6)
      state.mol.molTypes.hetero = molTypes.has(0) || molTypes.has(2) // 0: Unknown; 2: Ions
      state.mol.molTypes.ion = molTypes.has(2)

      state.mol.chains = chains
      state.mol.elements = elements
      state.mol.residues = residues
      state.mol.sstruc = sstruc
      state.mol.noSequence = noSequence
      state.mol.atoms = atoms
      state.mol.hetero = hetero

      state.selected = selected
    },
    setSSBridges (state, count) {
      state.mol.nbSSBridges = count
    },
    selection (state, selector) {
      state.selection = selector
    },
    display (state, displayType) {
      state.display = displayType
    },
    color (state, colorScheme) {
      state.color = colorScheme
    },
    atomHovered (state, atom) {
      let a = {}
      Object.assign(a, atom)
      state.atomHovered = a
    },
    contactHovered (state, contact) {
      let a = {}
      Object.assign(a, contact)
      state.contactHovered = a
    },
    itemHovered (state, res) {
      state.itemHovered = res
    },
    contextMenuAnchor (state, anchor) {
      state.anchor = anchor
    },
    selectedChains (state) {
      state.selectedChains = state.mol.chains.reduce((acc, val) => {
        return acc.concat([val.name])
      }, [])
    },
    setClipNear (state, percentage) {
      state.stage.clipNear = percentage
    },
    setFullscreen (state, isFullscreenOn) {
      state.fullscreen = isFullscreenOn
    },
    setMultipleBond (state, val) {
      state.multipleBond = val
    },
    setFog (state, fogParams) {
      state.fog = fogParams
    },
    setSSBridgesDisplayed (state, displayed) {
      state.ssBridgeDisplayed = displayed
    },
    isAtomHovered (state, isDisplayed) {
      state.isAtomHovered = isDisplayed
    },
    isContactHovered (state, isDisplayed) {
      state.isContactHovered = isDisplayed
    },
    isMeasuringDistances (state, isMeasuring) {
      state.isMeasuringDistances = isMeasuring
    },
    isMeasuringAngles (state, isMeasuring) {
      state.isMeasuringAngles = isMeasuring
    },
    isContextMenuCalled (state, {show = true, pos = {top: 0, left: 0}}) {
      state.isContextMenuCalled = show
      state.contextMenuPos = pos
    },
    updateColor (state) {
      state.color = getColorFromSelection()
    },
    updateDisplay (state) {
      state.display = getRepresentationFromSelection()
    },
    updateSelected (state, atomSet) {
      let selected = []
      for (let i = 0; i < structure.residueStore.length; i++) {
        selected.push(atomSet.isSet(structure.residueStore.atomOffset[i]))
      }
      state.selected = selected
    },
    updateSelectedFromTab (state, {tabSelectedResidues, isToBeSelected}) {
      tabSelectedResidues.forEach(val => {
        state.selected[val] = isToBeSelected
      })
    },
    updateSelection (state, selector) {
      let sel = predefined.findSelected(selector)
      state.selectedChains = sel.chains
      state.selection = sel.selection
    },
    updateSelectedPercentage (state) {
      state.selectedPercentage = ((currentSelectionAtomSet.getSize() / currentSelectionAtomSet.length) * 100)
    },
    updateHiddenPercentage (state) {
      state.hiddenPercentage = 100 - ((currentlyDisplayedAtomSet.getSize() / currentlyDisplayedAtomSet.length) * 100)
    },
    hide (state) {
      const sets = predefined.findVisible()
      state.visible = sets
      state.isHidden = currentlyDisplayedAtomSet.isEqualTo(wholeAtomSet)
    },
    distance (state, tabDistances) {
      state.distances = tabDistances
    },
    angle (state, tabAngles) {
      state.angles = tabAngles
    },
    surface (state, tabSurfaces) {
      state.surfaces = tabSurfaces
    },
    setContacts (state, contactsList) {
      state.contacts = contactsList
    },
    setWholeMoleculeContacts (state, contactsList) {
      state.wholeMoleculeContacts = contactsList
    },
    help (state, {subject, resetHistory, namespace}) {
      if (subject) {
        state.help[namespace] = subject
        if (resetHistory) {
          state.helpHistory[namespace] = []
          state.helpHistoryForward[namespace] = []
        }
      }
    },
    helpHistoryStart (state, {subject, resetHistory, namespace}) {
      if (resetHistory) {
        state.helpHistory[namespace] = [state.help[namespace]]
        state.helpHistoryForward[namespace] = []
      }
      state.help[namespace] = subject
    },
    helpHistoryStep (state, {step, namespace}) {
      if (step === -1 && state.helpHistory[namespace].length > 0) { // step back
        state.helpHistoryForward[namespace].push(state.help[namespace])
        state.help[namespace] = state.helpHistory[namespace].pop()
      } else if (step === 1 && state.helpHistoryForward[namespace].length > 0) { // step forward
        state.helpHistory[namespace].push(state.help[namespace])
        state.help[namespace] = state.helpHistoryForward[namespace].pop()
      }
    },
    isUserSelectionValid (state, value) {
      state.isUserSelectionValid = value
    },
    userSelectionSize (state, value) {
      state.userSelectionSize = value
    },
    setUserSelectionText (state, value) {
      state.userSelectionText = value
    },
    setActiveContact (state, value) {
      state.activeContact = value
    }
  },
  actions: {
    setDistances ({commit}, tabDistances) {
      commit('distance', tabDistances)
    },
    setAngles ({commit}, tabAngles) {
      commit('angle', tabAngles)
    },
    deleteMeasure (context, {type, index}) {
      if (typeof (index) !== 'number') {
        measurement.delete(type)
      } else {
        measurement.delete(type, index)
      }
    },
    toggleFullscreen (context) {
      context.commit('setFullscreen', Screenfull.isFullscreen)
    },
    resize () {
      stage.handleResize()
    },
    screenCapture (context) {
      // from NGL example gui
      stage.makeImage({
        factor: 2,
        antialias: true,
        trim: false,
        transparent: true
      }).then(function (blob) {
        NGL.download(blob, context.state.name + '.png')
      })
    },
    hover (context, sceneObject) {
      if (sceneObject) {
        if (sceneObject.type !== undefined) {
          switch (sceneObject.type) {
            case 'atom':
              context.dispatch('atomHovered', sceneObject)
              break
            case 'contact':
              context.dispatch('contactHovered', sceneObject)
              break
          }
        } else {
          context.dispatch('hideTooltip')
        }
      } else {
        context.dispatch('hideTooltip')
      }
    },
    createNewStage (context, options) {
      stage = new NGL.Stage(options.id, { backgroundColor: 'white' })
      loadNewFile = loadFile(stage, context)
      stage.mouseControls.remove('hoverPick')
      stage.mouseControls.remove('clickPick-right')
      stage.mouseControls.remove('clickPick-left')
      stage.mouseControls.add('clickPick-right', (stageInstance, pickingProxy) => {
        return context.dispatch('stageContextMenu', {stageInstance, pickingProxy})
      })
      stage.mouseControls.add('doubleClick-left', mouseFocus(updateStageCenter))
      stage.signals.hovered.add(hover(context))
      context.dispatch('loadNewFile', startParams)

      let resize = resizeStage(stage)
      window.onresize = debounce(100, resize)
      if (debug) { window.stage = stage }
    },
    loadNewFile (context, fileObject) {
      let newFile = {
        file: fileObject.file,
        value: fileObject.value,
        molId: fileObject.molId,
        molCode: '',
        source: fileObject.source,
        ext: fileObject.ext
      }
      loadNewFile(newFile).then(
        ({molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence, component, hetero}) => {
          structure = component.structure
          if (debug) window.structure = structure

          context.commit('setMolTypes', {molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence, hetero})

          tabColorScheme = [['element', 'all']]
          updateGlobalColorScheme()
          representationsList = [{
            display: 'ball+stick',
            color: 'element',
            sele: 'all',
            atomSet: structure.getAtomSet().clone(),
            displayedAtomSet: structure.getAtomSet(new NGL.Selection('not water')).clone(),
            index: component.reprList.length - 1,
            repr: component.reprList[0],
            overlay: false
          }]
          currentSelectionAtomSet = structure.getAtomSet().clone()
          currentlyDisplayedAtomSet = representationsList[0].displayedAtomSet.clone()
          wholeAtomSet = structure.getAtomSet().clone()
          tabColorAtomSet = [structure.getAtomSet().clone()]

          predefined = getPredefined(structure, chains)
          highlight = highlightRes(component)
          if (context.state.isMeasuringDistances || context.state.isMeasuringAngles) context.dispatch('setMouseMode', 'default')
          measurement = measure(component, context)
          surf = surface(component, context)
          contacts = contact(component, context)
          ssbridges = ssBridges(component, representationsList)

          context.commit('loadNewFile', newFile)
          context.dispatch('init')
        }
      ).catch(error => {
        if (error.err === 'old') {
          context.commit('alert', {
            type: 'old_file',
            token: {
              molId: error.molId
            }
          })
        }
        console.log(error)
      })
    },
    init ({commit, state}) {
      commit('selectedChains')
      commit('selection', 'all')
      commit('display', 'ball+stick')
      commit('color', 'element')
      commit('updateSelectedPercentage')
      commit('updateHiddenPercentage')
      commit('hide', false)
      commit('isMeasuringDistances', false)
      commit('isMeasuringAngles', false)
      commit('setUserSelectionText', null)
      commit('setContacts', [])
      commit('setSSBridges', ssbridges.count())
      if (state.ssBridgeDisplayed && ssbridges.count() > 0) {
        ssbridges.enable(true)
      }
      commit('setActiveContact', null)
    },
    selection (context, selector) {
      if (selector === 'invert') {
        currentSelectionAtomSet.flipAll()
      } else {
        const sel = new NGL.Selection(selector)
        currentSelectionAtomSet = structure.getAtomSet(sel).clone()
      }
      context.commit('updateSelection', selector)
      context.commit('updateSelected', currentSelectionAtomSet)
      context.commit('updateSelectedPercentage')
      context.commit('color', getColorFromSelection())
      context.commit('display', getRepresentationFromSelection())
    },

    display (context, {display, atomSet = currentSelectionAtomSet.clone(), overlay = false}) {
      const displayType = display

      // if selection is of mixed type (not just polymer) and display is either
      // cartoon or backbone, we need to limit it to the polymer selection
      if (displayType === 'backbone' || displayType === 'cartoon') {
        atomSet.intersection(predefined.getAtomSet('protein').clone().union(predefined.getAtomSet('nucleic')))
      }

      // We concern only about the representations of actually displayed atoms
      let dAtomSet = atomSet.clone().intersection(currentlyDisplayedAtomSet)

      // does this representation already exist?
      const num = representationsList.findIndex(val => {
        return (val.display === displayType && val.overlay === overlay)
      })

      if (num === -1) {
        // new representation
        const seleString = (overlay && displayType !== 'spacefill') ? dAtomSet.toSeleString() + ' and sidechainAttached' : dAtomSet.toSeleString()

        let reprParam = {
          color: globalColorScheme,
          sele: seleString
        }

        switch (displayType) {
          case 'ball+stick':
            reprParam.aspectRatio = 2.1
            reprParam.multipleBond = (context.state.mol.noSequence || context.state.multipleBond) ? 'symmetric' : 'off'
            break
          case 'spacefill':
            reprParam.radiusType = 'vdw'
            break
          case 'licorice':
            reprParam.multipleBond = (context.state.mol.noSequence || context.state.multipleBond) ? 'symmetric' : 'off'
            break
        }

        const r = stage.compList[0].addRepresentation(displayType, reprParam)

        representationsList.push({
          display: displayType,
          index: stage.compList[0].reprList.length - 1,
          atomSet: atomSet.clone(),
          displayedAtomSet: dAtomSet,
          sele: context.state.selection,
          overlay: overlay,
          repr: r
        })
        removeSelectionFromRepresentations(atomSet, r, overlay)

        // Add base representation if cartoon
        if (displayType === 'cartoon') {
          let rbase = stage.compList[0].addRepresentation('base',
            {
              sele: dAtomSet.toSeleString(),
              color: globalColorScheme
            })
          representationsList.push({
            display: 'base',
            index: stage.compList[0].reprList.length - 1,
            atomSet: atomSet.clone(),
            displayedAtomSet: dAtomSet.clone(),
            sele: context.state.selection,
            repr: rbase
          })
        }
      } else {
        const repr = representationsList[num]
        repr.atomSet.union(atomSet)
        repr.displayedAtomSet = repr.atomSet.clone().intersection(currentlyDisplayedAtomSet)

        // need to update the representation
        const seleString = (overlay && displayType !== 'spacefill') ? repr.displayedAtomSet.toSeleString() + ' and sidechainAttached' : repr.displayedAtomSet.toSeleString()
        repr.repr.setSelection(seleString)

        // and to update the remaining representations
        removeSelectionFromRepresentations(atomSet, repr.repr, overlay)

        // update base representation if cartoon
        if (displayType === 'cartoon') {
          representationsList[num + 1].repr.setSelection(repr.displayedAtomSet.toSeleString())
          representationsList[num + 1].atomSet = repr.atomSet.clone()
          representationsList[num + 1].displayedAtomSet = repr.displayedAtomSet.clone()
        }
      }
      context.commit('display', displayType)
    },

    overlay (context, displayType) {
      // when in sequence mode, and using ribbon/backbone representations
      // these representations should remain and sidechains be surimposed
      // if display spacefill, the whole residue is displayed instead of
      // its sidechain only

      // is there a ribbon or a backbone representation that includes some
      // of the residues of the current selection ?
      let atomsToDisplay = representationsList.reduce((acc, representation, index) => {
        if (['cartoon', 'backbone'].includes(representation.display) && representation.atomSet.intersects(currentSelectionAtomSet)) {
          return acc.difference(representation.atomSet)
        } else {
          return acc
        }
      }, currentSelectionAtomSet.clone())

      // if there is none, overlay is an easy display
      if (atomsToDisplay.isEqualTo(currentSelectionAtomSet)) {
        context.dispatch('display', {display: displayType})
        return
      }

      // there is at least one schematic representation that includes some atoms to be displayed as overlays
      // first let's display the atoms not belonging to the overlay if there are some
      if (atomsToDisplay.getSize() > 0) {
        context.dispatch('display', {display: displayType, atomSet: atomsToDisplay})
      }

      // then display the overlaying atoms
      const atomsToOverlay = currentSelectionAtomSet.clone().difference(atomsToDisplay)
      context.dispatch('display', {display: displayType, atomSet: atomsToOverlay, overlay: true})
    },

    hide (context, token) {
      if (token === undefined) {
        // decide if we should hide or show depending on wether selected atoms are displayed
        const isToBeHidden = currentlyDisplayedAtomSet.intersects(currentSelectionAtomSet)

        if (isToBeHidden) {
          currentlyDisplayedAtomSet.difference(currentSelectionAtomSet)
        } else {
          currentlyDisplayedAtomSet.union(currentSelectionAtomSet)
        }
      } else {
        const atomSet = structure.getAtomSet(new NGL.Selection(token.sele))

        // decide if we should hide or show depending on the token received
        if (token.action === 'hide') {
          currentlyDisplayedAtomSet.difference(atomSet)
        } else {
          currentlyDisplayedAtomSet.union(atomSet)
        }
      }

      updateRepresentationDisplay()
      if (!currentlyDisplayedAtomSet.isAllClear()) updateStageCenter()
      context.commit('hide', currentlyDisplayedAtomSet.isEqualTo(wholeAtomSet))
      context.commit('updateHiddenPercentage')

      // if hide has been called from an eye button, we call a context menu
      if (token !== undefined) {
        let payload = {
          type: token.type,
          chainName: (token.chainName) ? token.chainName : null,
          resnum: (token.resnum) ? token.resnum : null,
          resname: (token.resname) ? token.resname : null
        }

        context.dispatch('contextMenuCalled', payload)
      }
    },

    displayContacts (context, contactsList) {
      // check if contact representation already exists
      let contactRepr = stage.getRepresentationsByName('wholeMoleculeContacts').first

      let param = {
        hydrogenBond: false,
        weakHydrogenBond: false,
        backboneHydrogenBond: false,
        waterHydrogenBond: false,
        hydrophobic: false,
        ionicInteraction: false,
        metalCoordination: false,
        cationPi: false,
        piStacking: false,
        name: 'wholeMoleculeContacts'
      }

      contactsList.forEach((contact) => {
        param[contact] = true
      })

      if (contactRepr !== undefined) {
        // it does exist, we need to update it accordingly with contactsList
        if (contactsList.length === 0) {
          // edge case: no contact to display
          contactRepr.setVisibility(false)
        } else {
          contactRepr.setVisibility(true)
          contactRepr.setParameters(param)
        }
      } else {
        // it does not exist yet, we need to create it
        Object.assign(param, {
          sele: currentlyDisplayedAtomSet.toSeleString()
        })
        let repr = stage.compList[0].addRepresentation('contact', param)
        representationsList.push({
          display: 'contact',
          index: stage.compList[0].reprList.length - 1,
          atomSet: structure.getAtomSet().clone(),
          displayedAtomSet: currentlyDisplayedAtomSet,
          overlay: false,
          repr
        })
      }
      context.commit('setWholeMoleculeContacts', contactsList)
    },

    focusContact ({commit}, {target, filter}) {
      const contact = contacts.addContact({target, filter})
      contacts.focus(contact.index)
      contacts.showOnly(contact.index)
    },

    updateDisplayContact (context, contactParam) {
      contacts.setProperties(contactParam)
    },

    deleteContact (context, contactId) {
      contacts.delete(contactId)
    },

    togglePresetVisibility (context, selector) {
      const atomSetToHide = structure.getAtomSet(new NGL.Selection(selector))

      // hetero set has been fixed for not including water or saccharide
      if (selector.indexOf('hetero') > -1) selector = 'hetero'

      if (context.state.visible[selector]) { // preset is visible
        currentlyDisplayedAtomSet.difference(atomSetToHide)
      } else {
        currentlyDisplayedAtomSet.union(atomSetToHide)
      }

      updateRepresentationDisplay()
      if (!currentlyDisplayedAtomSet.isAllClear()) updateStageCenter()
      context.commit('hide', currentlyDisplayedAtomSet.isEqualTo(wholeAtomSet))
      context.commit('updateHiddenPercentage')
    },

    show (context) {
      // decide if we should extract or flatten depending on wether selected atoms are displayed
      let isToBeFlatten = currentlyDisplayedAtomSet.isEqualTo(currentSelectionAtomSet)

      if (isToBeFlatten) {
        currentlyDisplayedAtomSet = tempDisplayedAtomSet
      } else {
        tempDisplayedAtomSet = currentlyDisplayedAtomSet.clone()
        currentlyDisplayedAtomSet = currentSelectionAtomSet.clone()
      }

      updateRepresentationDisplay()
      if (!currentlyDisplayedAtomSet.isAllClear()) updateStageCenter()
      context.commit('hide', currentlyDisplayedAtomSet.isEqualTo(wholeAtomSet))
      context.commit('updateHiddenPercentage')
    },

    color (context, colorScheme) {
      const colorAtomSet = currentSelectionAtomSet.clone()
      // is this a new color scheme?
      let colorIndex = tabColorScheme.findIndex(cs => {
        return colorScheme === cs[0]
      })

      // new color scheme!
      if (colorIndex === -1) {
        tabColorAtomSet.push(colorAtomSet)
        tabColorScheme.push([colorScheme, colorAtomSet.toSeleString()])
        colorIndex = tabColorScheme.length - 1
      } else {
        // previous color scheme
        tabColorAtomSet[colorIndex].union(colorAtomSet)
        tabColorScheme[colorIndex][1] = tabColorAtomSet[colorIndex].toSeleString()
      }

      // remove color atom set from other color schemes
      removeSelectionFromColorSchemes(colorAtomSet, colorIndex)

      // update representations colors
      updateGlobalColorScheme()
      updateRepresentationColor()

      context.commit('color', colorScheme)
    },
    atomHovered (context, atom) {
      context.commit('atomHovered', atom)
      context.commit('isAtomHovered', true)
      context.commit('isContactHovered', false)
    },
    contactHovered (context, contact) {
      context.commit('contactHovered', contact)
      context.commit('isContactHovered', true)
      context.commit('isAtomHovered', false)
    },
    hideTooltip (context) {
      context.commit('isAtomHovered', false)
      context.commit('isContactHovered', false)
    },
    stageContextMenu (context, {stageInstance, pickingProxy}) {
      if (pickingProxy === undefined) return
      const containerPos = stageInstance.viewer.container.getBoundingClientRect()
      const mousePos = stageInstance.mouseObserver.canvasPosition
      const absolutePosition = {
        top: containerPos.bottom - mousePos.y,
        left: containerPos.left + mousePos.x,
        right: containerPos.left + mousePos.x
      }
      const atom = pickingProxy.atom || pickingProxy.closestAtom
      if (atom !== undefined) {
        context.dispatch('contextMenuCalled', {
          type: 'res',
          resnum: atom.resno,
          chainName: atom.chainname,
          resname: atom.resname
        })
        context.commit('isContextMenuCalled', {show: true, pos: absolutePosition})
      }
    },
    contextMenuCalled (context, item) {
      let anchor = {}
      switch (item.type) {
        case 'chain':
          const chain = (item.chainName === undefined) ? context.state.mol.chains.find(ch => ch.id === parseInt(item.index)) : { name: item.chainName }
          const chainAtomSet = structure.getAtomSet(new NGL.Selection(':' + chain.name))
          const restAtomSet = chainAtomSet.clone().flipAll()
          const isRestPresent = !restAtomSet.isAllClear() // some models only include one chain
          anchor = {
            type: 'chain',
            chain: chain.name,
            isMaskable: currentlyDisplayedAtomSet.intersects(chainAtomSet),
            isUnMaskable: currentlyDisplayedAtomSet.getIntersectionSize(chainAtomSet) < chainAtomSet.getSize(),
            isRestPresent: isRestPresent,
            isRestMaskable: (isRestPresent) ? currentlyDisplayedAtomSet.intersects(restAtomSet) : false,
            isRestUnMaskable: (isRestPresent) ? currentlyDisplayedAtomSet.getIntersectionSize(restAtomSet) < restAtomSet.getSize() : false
          }
          break
        case 'res':
          const res = (item.chainName === undefined) ? structure.getResidueProxy(item.index) : {resno: item.resnum, chainname: item.chainName, resname: item.resname} // call to NGL structure object
          const residueAtomSet = structure.getAtomSet(new NGL.Selection(res.resno + ':' + res.chainname))
          const restResAtomSet = residueAtomSet.clone().flipAll()
          const notSelectedAtomSet = currentSelectionAtomSet.clone().flipAll()
          anchor = {
            type: 'res',
            name: res.resname,
            num: res.resno,
            chain: res.chainname,
            isMaskable: currentlyDisplayedAtomSet.intersects(residueAtomSet),
            isUnMaskable: currentlyDisplayedAtomSet.getIntersectionSize(residueAtomSet) < residueAtomSet.getSize(),
            isRestPresent: !restResAtomSet.isAllClear(),
            isRestMaskable: currentlyDisplayedAtomSet.intersects(restResAtomSet),
            isRestUnMaskable: currentlyDisplayedAtomSet.getIntersectionSize(restResAtomSet) < restResAtomSet.getSize(),
            isSelected: currentSelectionAtomSet.intersects(residueAtomSet),
            isSelectionMaskable: currentSelectionAtomSet.intersects(currentlyDisplayedAtomSet),
            isSelectionUnMaskable: currentlyDisplayedAtomSet.getIntersectionSize(currentSelectionAtomSet) < currentSelectionAtomSet.getSize(),
            isNotSelectedMaskable: currentlyDisplayedAtomSet.intersects(notSelectedAtomSet),
            isNotSelectedUnMaskable: currentlyDisplayedAtomSet.getIntersectionSize(notSelectedAtomSet) < notSelectedAtomSet.getSize()
          }
          break
        case 'user':
          const userAtomSet = structure.getAtomSet(new NGL.Selection(context.state.userSelectionText))
          const restUserAtomSet = userAtomSet.clone().flipAll()
          anchor = {
            type: 'user',
            isMaskable: currentlyDisplayedAtomSet.intersects(userAtomSet),
            isUnMaskable: currentlyDisplayedAtomSet.getIntersectionSize(userAtomSet) < userAtomSet.getSize(),
            isRestPresent: !restUserAtomSet.isAllClear(),
            isRestMaskable: currentlyDisplayedAtomSet.intersects(restUserAtomSet),
            isRestUnMaskable: currentlyDisplayedAtomSet.getIntersectionSize(restUserAtomSet) < restUserAtomSet.getSize()
          }
      }

      context.commit('contextMenuAnchor', anchor)
      // highlightRes(item)
    },
    sequenceHovered (context, item) {
      let itemHovered = {}
      switch (item.type) {
        case 'none':
          highlight('none')
          break
        case 'chain':
          let chain = context.state.mol.chains.find(ch => ch.id === parseInt(item.index))
          itemHovered = {
            name: '',
            num: -1,
            chain: chain.name,
            description: chain.entity || 'unknown'
          }
          highlight(':' + chain.name)
          break
        default:
          let res = structure.getResidueProxy(item.index) // call to NGL structure object
          itemHovered = {
            name: res.resname,
            num: res.resno,
            chain: res.chainname,
            description: getDescriptionFromRes.call(this, res)
          }
          highlight(res.resno + ':' + res.chainname)
      }

      context.commit('itemHovered', itemHovered)
      // highlightRes(item)
    },

    highlightSelectHovered (context, selector) {
      if (selector === 'invert') {
        selector = currentSelectionAtomSet.clone().flipAll().toSeleString()
      } else if (selector === 'selected') {
        selector = currentSelectionAtomSet.toSeleString()
      } else if (selector === 'hidden') {
        selector = currentlyDisplayedAtomSet.clone().flipAll().toSeleString()
      }
      highlight(selector)
    },

    setClipNear ({commit}, percentage) {
      stage.setParameters({clipNear: percentage})
    },

    setStageParameters ({commit}, params) {
      stage.setParameters(params)
      if (params.backgroundColor) {
        measurement.switchColor(params.backgroundColor)
      } else if (params.fogNear) {
        commit('setFog', [params.fogNear, params.fogFar])
      }
    },
    setRepresentationParameters (context, params) {
      if (params.multipleBond !== undefined) {
        updateRepresentationParameters(['licorice', 'ball+stick'], {multipleBond: params.multipleBond})
        context.commit('setMultipleBond', params.multipleBond === 'symmetric')
      }
    },
    setSSBridges ({commit}, enableSSBridges) {
      ssbridges.enable(enableSSBridges)
      commit('setSSBridgesDisplayed', enableSSBridges)
    },
    sequenceSelected (context, tabSelectedResidues) {
      // has the selection started by a selected residue ?
      let isToBeSelected = (context.state.selected[tabSelectedResidues[0]] === false)
      context.dispatch('residuesSelected', {tabSelectedResidues, isToBeSelected})
    },
    chainSelected (context, chainId) {
      // if the chain is entirely selected, we then deselect it
      let isToBeSelected = false
      let tabSelectedResidues = []
      context.state.mol.chains[chainId].sequence.forEach(res => {
        if (!context.state.selected[res.index]) {
          isToBeSelected = true
        }
        tabSelectedResidues.push(res.index)
      })
      context.dispatch('residuesSelected', {tabSelectedResidues, isToBeSelected})
      context.commit('updateSelectedPercentage')
    },
    residuesSelected (context, {tabSelectedResidues, isToBeSelected}) {
      // modify current selection atomSet
      tabSelectedResidues.forEach(val => {
        let atomId = structure.residueStore.atomOffset[val]
        let nbAtoms = structure.residueStore.atomCount[val]
        if (isToBeSelected) {
          for (let i = atomId; i < atomId + nbAtoms; i++) {
            currentSelectionAtomSet.set(i)
          }
        } else {
          for (let i = atomId; i < atomId + nbAtoms; i++) {
            currentSelectionAtomSet.clear(i)
          }
        }
      })
      // context.commit('updateSelectedFromTab', {tabSelectedResidues, isToBeSelected})
      context.commit('updateSelected', currentSelectionAtomSet)
      context.commit('updateSelection', 'user')
      context.commit('updateSelectedPercentage')
      context.commit('color', getColorFromSelection())
      context.commit('display', getRepresentationFromSelection())
    },
    setMouseMode (context, mouseMode) {
      if (context.state.isMeasuringAngles) {
        stage.signals.clicked.remove(measurement.clickAngle)
        context.commit('isMeasuringAngles', false)
        measurement.disable()
      }
      if (context.state.isMeasuringDistances) {
        stage.signals.clicked.remove(measurement.clickDistance)
        context.commit('isMeasuringDistances', false)
        measurement.disable()
      }
      switch (mouseMode) {
        case 'distance' :
          // set cursor style
          stage.viewer.container.style.cursor = 'crosshair'
          // set signal picking atom
          stage.signals.clicked.add(measurement.clickDistance)
          stage.signals.hovered.add(measurement.hoverMeasure)
          // set state to measuring distances
          context.commit('isMeasuringDistances', true)
          break
        case 'angle' :
          // set cursor style
          stage.viewer.container.style.cursor = 'crosshair'
          // set signal picking atom
          stage.signals.clicked.add(measurement.clickAngle)
          stage.signals.hovered.add(measurement.hoverMeasure)
          // set state to measuring angles
          context.commit('isMeasuringAngles', true)
          break
        default :
          // set cursor style
          stage.viewer.container.style.cursor = 'default'
          // set signal picking atom
          stage.signals.hovered.remove(measurement.hoverMeasure)
      }
    },
    help ({commit}, subject) {
      let newSubject = true
      if (subject === undefined || subject === null ||
       (subject.attribute === undefined && subject.token === undefined)) {
        subject = latestHelp
        newSubject = false
      } else if (subject.active) {
        latestHelp = subject
      } else { // item hovered but not clicked
        newSubject = false
      }
      if (subject.attribute) {
        commit('help', {
          subject: getHelp(subject.action, subject.attribute),
          resetHistory: newSubject,
          namespace: subject.namespace
        })
      } else if (subject.token) { // help system internal link
        commit('helpHistoryStart', {
          subject: subject.token,
          resetHistory: newSubject,
          namespace: subject.namespace
        })
      }
    },
    helpNavigate ({commit}, {step, namespace}) {
      if (step === 'backward') {
        commit('helpHistoryStep', {
          step: -1,
          namespace: namespace
        })
      } else {
        commit('helpHistoryStep', {
          step: 1,
          namespace: namespace
        })
      }
    },
    userSelection (context, value) {
      const sel = new NGL.Selection(`(${value}) and /0`)
      const as = structure.getAtomSet(sel)
      context.commit('userSelectionSize', as.getSize())
      highlight(value)
      predefined.userSelection(as)
    },
    highlightUserSelection (context, value) {
      highlight(value)
    },
    createSurface (context) {
      if (surf.checkSurfaceExists(currentSelectionAtomSet)) {
        Notification.error({
          title: Vue.t('messages.error'),
          message: Vue.t('ui.surface.create_warning'),
          offset: 100
        })
      } else {
        surf.addSurface(currentSelectionAtomSet, context.state.selection)
      }
    },
    setSurfaces ({ commit }, tabSurfaces) {
      commit('surface', tabSurfaces)
    },
    deleteSurface (context, surfaceIndex) {
      if (surfaceIndex === -1) {
        surf.deleteAll()
      } else {
        surf.delete(surfaceIndex)
      }
    },
    setSurfaceProperty (context, {id, props}) {
      surf.setProperties(id, props)
    },
    downloadSurface (context, surfaceIndex) {
      surf.downloadSTL(surfaceIndex)
    }
  },
  getters: {
    getResidue: state => {
      return { name: state.name, structure }
    }
  }
})

export default vuex
