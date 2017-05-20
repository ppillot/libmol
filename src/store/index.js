import Vue from 'vue'
import Vuex from 'vuex'
// import * as actions from './actions'
// import * as getters from './getters'
import {Stage, Selection, ColormakerRegistry, download, Vector3, Vector2, setDebug} from 'ngl'
/* eslint-disable-next-line */
// let NGL = () => import('ngl') /* eslint-disable-line */
import debounce from 'throttle-debounce/debounce'
import Screenfull from 'screenfull'
import help from 'utils/help'
import {hover} from 'utils/hover'
import {measureDistance} from 'utils/distance'
import {loadFile} from 'utils/loadfile'

let NGL = {Stage, Selection, ColormakerRegistry, download, Vector2, Vector3, setDebug}
Vue.use(Vuex)

/** @description local module variable to hold the NGL stage object
 * @typedef {NGL.stage}
 */
var stage = {
  setParameters: function () {}
}
var structure = {}
var representationsList = []
var highlight
var loadNewFile
var distance
var currentSelectionAtomSet
var currentlyDisplayedAtomSet
var tempDisplayedAtomSet
var wholeAtomSet
var tabColorScheme = [['element', 'all']]
var tabColorAtomSet
var globalColorScheme
var predefined
var latestHelp = {}

/**
 * @description removes residues form their current representation so that they are set only in the latest
 *
 * @param {NGL atomSet} atomSet
 * @param {number} skipReprIndex index of the latest representation : must be skipped !
 */
function removeSelectionFromRepresentations (newAtomSet, skipReprIndex, overlay = false) {
  for (let i = 0; i < representationsList.length; i++) {
    if (i === skipReprIndex || (i === skipReprIndex + 1 && representationsList[i].display === 'base')) {
      continue
    } else if (overlay && ['cartoon', 'ribbon', 'backbone'].includes(representationsList[i].display)) {
      continue
    }
    const repr = representationsList[i]
    if (repr.atomSet.intersects(newAtomSet)) {
      repr.atomSet.difference(newAtomSet)
      let sele = repr.displayedAtomSet.difference(newAtomSet)
      // console.log(i, sele)
      stage.compList[0].reprList[repr.index].setSelection(sele.toSeleString())
    }
  }
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
  if (as.isEmpty()) return ''

  const currentSelectionRepresentation = representationsList.find(repr => {
    return (!repr.atomSet.isEmpty() && repr.atomSet.intersection_size(as) === as.size())
  })
  return (currentSelectionRepresentation === undefined) ? 'mix' : currentSelectionRepresentation.display
}

function getColorFromSelection (as = currentSelectionAtomSet) {
  // edge case atom set is empty
  if (as.isEmpty()) return 'none'
  let color = 'mix'
  for (let i = 0; i < tabColorAtomSet.length; i++) {
    if (!tabColorAtomSet[i].isEmpty() && tabColorAtomSet[i].intersection_size(as) === as.size()) {
      color = tabColorScheme[i][0]
    }
  }
  return color
}

function updateGlobalColorScheme () {
  globalColorScheme = NGL.ColormakerRegistry.addSelectionScheme(tabColorScheme)
}

function updateRepresentationColor () {
  stage.compList[0].eachRepresentation(repr => {
    if (repr.name === 'highlight' || repr.name === 'distance') return
    repr.setColor(globalColorScheme)
  })
}

function updateRepresentationDisplay () {
  representationsList.forEach(repr => {
    if (repr.name === 'highlight') return
    repr.displayedAtomSet = repr.atomSet.clone().intersection(currentlyDisplayedAtomSet)
    // console.log('update repr:', repr.name, repr.index, repr.displayedAtomSet)
    stage.compList[0].reprList[repr.index].setSelection(repr.displayedAtomSet.toSeleString())
  })
}

function updateStageCenter () {
  const sele = currentlyDisplayedAtomSet.toSeleString()
  stage.compList[0].autoView(sele, 1000)
}

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
    if (as.isEmpty()) return ret

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
        return (pds[1].equals(as))
      })
      ret.selection = (preset !== undefined) ? preset[0] : ''
    }

    // check which chains are currently entirely selected
    chainSet.forEach((chainAtomSet, chainName) => {
      if (chainAtomSet.intersection_size(as) === chainAtomSet.size()) {
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
}

var vuex = new Vuex.Store({
  state: {
    fileName: '',
    name: 'LibMol',
    fullscreen: false,
    isMeasuringDistances: false,
    mol: {
      chains: [],
      atoms: [],
      elements: new Set(),
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
      noSequence: false
    },
    selected: [],
    selectedChains: [],
    selectedPercentage: 100,
    hiddenPercentage: 0,
    visible: {},
    selection: 'all',
    display: 'licorice',
    color: 'element',
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
    isAtomHovered: false,
    isHidden: false,
    itemHovered: {
      name: '',
      num: -1,
      chain: '',
      description: ''
    },
    anchor: {},
    stage: {
      clipNear: 30
    },
    distances: [],
    help: '',
    helpHistory: [],
    helpHistoryForward: [],
    alert: {
      type: '',
      token: {}
    },
    isUserSelectionValid: false,
    userSelectionSize: 0,
    userSelectionText: ''
  },
  mutations: {
    alert (state, {type, token}) {
      state.alert.type = type
      state.alert.token = token
    },
    loadNewFile (state, newFile) {
      state.fileName = newFile.file
      state.name = newFile.value
    },
    setMolTypes (state, {molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence}) {
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

      state.selected = selected
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
    isAtomHovered (state, isDisplayed) {
      state.isAtomHovered = isDisplayed
    },
    isMeasuringDistances (state, isMeasuring) {
      state.isMeasuringDistances = isMeasuring
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
        selected.push(atomSet.has(structure.residueStore.atomOffset[i]))
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
      state.selectedPercentage = ((currentSelectionAtomSet.size() / currentSelectionAtomSet.length) * 100)
    },
    updateHiddenPercentage (state) {
      state.hiddenPercentage = 100 - ((currentlyDisplayedAtomSet.size() / currentlyDisplayedAtomSet.length) * 100)
    },
    hide (state) {
      const sets = predefined.findVisible()
      state.visible = sets
      state.isHidden = currentlyDisplayedAtomSet.equals(wholeAtomSet)
    },
    distance (state, tabDistances) {
      state.distances = tabDistances
    },
    help (state, {subject, resetHistory}) {
      if (subject) {
        state.help = subject
        if (resetHistory) {
          state.helpHistory = []
          state.helpHistoryForward = []
        }
      }
    },
    helpHistoryStart (state, {subject, resetHistory}) {
      if (resetHistory) {
        state.helpHistory = [state.help]
        state.helpHistoryForward = []
      }
      state.help = subject
    },
    helpHistoryStep (state, step) {
      if (step === -1 && state.helpHistory.length > 0) { // step back
        state.helpHistoryForward.push(state.help)
        state.help = state.helpHistory.pop()
      } else if (step === 1 && state.helpHistoryForward.length > 0) { // step forward
        state.helpHistory.push(state.help)
        state.help = state.helpHistoryForward.pop()
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
    }
  },
  actions: {
    setDistances ({commit}, tabDistances) {
      commit('distance', tabDistances)
    },
    deleteDistance (context, val) {
      if (typeof (val) !== 'number') {
        distance.deleteAll()
      } else {
        distance.delete(val)
      }
    },
    toggleFullscreen (context) {
      context.commit('setFullscreen', !Screenfull.isFullscreen)
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
        if (sceneObject.index !== undefined) {
          context.dispatch('atomHovered', sceneObject)
        } else {
          context.dispatch('displayAtomTooltip', false)
        }
      } else {
        context.dispatch('displayAtomTooltip', false)
      }
    },
    createNewStage (context, options) {
      stage = new NGL.Stage(options.id, { backgroundColor: 'white' })
      loadNewFile = loadFile(stage)
      stage.signals.hovered.add(hover(context))
      context.dispatch('loadNewFile', { file: 'rcsb://1crn', value: 'Crambin - 1CRN' })

      let resize = resizeStage(stage)
      window.onresize = debounce(100, resize)
      if (debug) { window.stage = stage }
    },
    loadNewFile (context, newFile) {
      loadNewFile(newFile).then(
        ({molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence, component}) => {
          structure = component.structure
          if (debug) window.structure = structure

          context.commit('setMolTypes', {molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence})

          tabColorScheme = [['element', 'all']]
          updateGlobalColorScheme()
          representationsList = [{
            display: 'ball+stick',
            color: 'element',
            sele: 'all',
            atomSet: structure.getAtomSet().clone(),
            displayedAtomSet: structure.getAtomSet().clone(),
            index: component.reprList.length - 1
          }]
          currentSelectionAtomSet = structure.getAtomSet().clone()
          currentlyDisplayedAtomSet = structure.getAtomSet().clone()
          wholeAtomSet = structure.getAtomSet().clone()
          tabColorAtomSet = [structure.getAtomSet().clone()]

          predefined = getPredefined(structure, chains)
          highlight = highlightRes(component)
          if (context.state.isMeasuringDistances) context.dispatch('setMouseMode', 'default')
          distance = measureDistance(component, context)

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
          // console.log('old file', error.molId)
        }
      })
    },
    init ({commit}) {
      commit('selectedChains')
      commit('selection', 'all')
      commit('display', 'ball+stick')
      commit('color', 'element')
      commit('updateSelectedPercentage')
      commit('updateHiddenPercentage')
      commit('hide', false)
      commit('isMeasuringDistances', false)
    },
    selection (context, selector) {
      if (selector === 'invert') {
        currentSelectionAtomSet.flip_all()
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
      // does this representation already exist?
      const num = representationsList.findIndex(val => {
        return (val.display === displayType && val.overlay === overlay)
      })

      // if selection is of mixed type (not just polymer) and display is either
      // cartoon or backbone, we need to limit it to the polymer selection
      if (displayType === 'backbone' || displayType === 'cartoon') {
        atomSet.intersection(predefined.getAtomSet('protein')) // .intersection(predefined.getAtomSet('nucleic'))
      }

      let dAtomSet = atomSet.intersection(currentlyDisplayedAtomSet)

      if (num === -1) {
        // new representation
        const seleString = (overlay && displayType !== 'spacefill') ? dAtomSet.toSeleString() + ' and sidechainAttached' : dAtomSet.toSeleString()
        stage.compList[0].addRepresentation(displayType,
          {
            sele: seleString,
            color: globalColorScheme,
            multipleBond: (context.state.mol.noSequence) ? 'symmetric' : 'off'
          })
        representationsList.push({
          display: displayType,
          index: stage.compList[0].reprList.length - 1,
          atomSet: atomSet.clone(),
          displayedAtomSet: dAtomSet,
          sele: context.state.selection,
          overlay: overlay
        })
        removeSelectionFromRepresentations(atomSet, representationsList.length - 1, overlay)

        // Add base representation if cartoon
        if (displayType === 'cartoon') {
          stage.compList[0].addRepresentation('base',
            {
              sele: dAtomSet.toSeleString(),
              color: globalColorScheme
            })
          representationsList.push(
            {display: 'base',
              index: stage.compList[0].reprList.length - 1,
              atomSet: atomSet.clone(),
              displayedAtomSet: dAtomSet.clone(),
              sele: context.state.selection})
        }
      } else {
        const repr = representationsList[num]

        repr.atomSet.union(atomSet)
        repr.displayedAtomSet = repr.atomSet.clone().intersection(currentlyDisplayedAtomSet)

          // need to update the representation
        const seleString = (overlay && displayType !== 'spacefill') ? repr.displayedAtomSet.toSeleString() + ' and sidechainAttached' : repr.displayedAtomSet.toSeleString()
        stage.compList[0].reprList[repr.index].setSelection(seleString)

          // and to update the remaining representations
        removeSelectionFromRepresentations(atomSet, num, overlay)

        // update base representation if cartoon
        if (displayType === 'cartoon') {
          stage.compList[0].reprList[repr.index + 1].setSelection(repr.displayedAtomSet.toSeleString())
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
      // of the residues of the current selection
      let atomsToDisplay = representationsList.reduce((acc, representation, index) => {
        if (['cartoon', 'backbone'].includes(representation.display) && representation.atomSet.intersects(currentSelectionAtomSet)) {
          return acc.difference(representation.atomSet)
        } else {
          return acc
        }
      }, currentSelectionAtomSet.clone())

      // if there is none, overlay is an easy display
      if (atomsToDisplay.equals(currentSelectionAtomSet)) {
        context.dispatch('display', {display: displayType})
        return
      }

      // there is at least one schematic representation that includes some atoms to be displayed as overlays
      // first let's display the atoms not belonging to the overlay if there are some
      if (atomsToDisplay.size() > 0) {
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
      // debugger
      updateRepresentationDisplay()
      if (!currentlyDisplayedAtomSet.isEmpty()) updateStageCenter()
      context.commit('hide', currentlyDisplayedAtomSet.equals(wholeAtomSet))
      context.commit('updateHiddenPercentage')
      let payload = {
        type: token.type,
        chainName: (token.chainName) ? token.chainName : null,
        resnum: (token.resnum) ? token.resnum : null,
        resname: (token.resname) ? token.resname : null
      }

      context.dispatch('contextMenuCalled', payload)
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
      if (!currentlyDisplayedAtomSet.isEmpty()) updateStageCenter()
      context.commit('hide', currentlyDisplayedAtomSet.equals(wholeAtomSet))
      context.commit('updateHiddenPercentage')
    },

    show (context) {
      // decide if we should extract or flatten depending on wether selected atoms are displayed
      let isToBeFlatten = currentlyDisplayedAtomSet.equals(currentSelectionAtomSet)

      if (isToBeFlatten) {
        currentlyDisplayedAtomSet = tempDisplayedAtomSet
      } else {
        tempDisplayedAtomSet = currentlyDisplayedAtomSet.clone()
        currentlyDisplayedAtomSet = currentSelectionAtomSet.clone()
      }

      updateRepresentationDisplay()
      if (!currentlyDisplayedAtomSet.isEmpty()) updateStageCenter()
      context.commit('hide', currentlyDisplayedAtomSet.equals(wholeAtomSet))
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
    },
    displayAtomTooltip (context, isDisplayed) {
      context.commit('isAtomHovered', isDisplayed)
    },

    contextMenuCalled (context, item) {
      let anchor = {}
      switch (item.type) {
        case 'chain':
          const chain = (item.chainName === undefined) ? context.state.mol.chains.find(ch => ch.id === parseInt(item.index)) : { name: item.chainName }
          const chainAtomSet = structure.getAtomSet(new NGL.Selection(':' + chain.name))
          const restAtomSet = chainAtomSet.clone().flip_all()
          const isRestPresent = !restAtomSet.isEmpty() // some models only include one chain
          anchor = {
            type: 'chain',
            chain: chain.name,
            isMaskable: currentlyDisplayedAtomSet.intersects(chainAtomSet),
            isUnMaskable: currentlyDisplayedAtomSet.intersection_size(chainAtomSet) < chainAtomSet.size(),
            isRestPresent: isRestPresent,
            isRestMaskable: (isRestPresent) ? currentlyDisplayedAtomSet.intersects(restAtomSet) : false,
            isRestUnMaskable: (isRestPresent) ? currentlyDisplayedAtomSet.intersection_size(restAtomSet) < restAtomSet.size() : false
          }
          break
        case 'res':
          const res = (item.chainName === undefined) ? structure.getResidueProxy(item.index) : {resno: item.resnum, chainname: item.chainName, resname: item.resname} // call to NGL structure object
          const residueAtomSet = structure.getAtomSet(new NGL.Selection(res.resno + ':' + res.chainname))
          const restResAtomSet = residueAtomSet.clone().flip_all()
          const notSelectedAtomSet = currentSelectionAtomSet.clone().flip_all()
          anchor = {
            type: 'res',
            name: res.resname,
            num: res.resno,
            chain: res.chainname,
            isMaskable: currentlyDisplayedAtomSet.intersects(residueAtomSet),
            isUnMaskable: currentlyDisplayedAtomSet.intersection_size(residueAtomSet) < residueAtomSet.size(),
            // isRestPresent: isRestPresent,
            isRestMaskable: currentlyDisplayedAtomSet.intersects(restResAtomSet),
            isRestUnMaskable: currentlyDisplayedAtomSet.intersection_size(restResAtomSet) < restResAtomSet.size(),
            isSelected: currentSelectionAtomSet.intersects(residueAtomSet),
            isSelectionMaskable: currentSelectionAtomSet.intersects(currentlyDisplayedAtomSet),
            isSelectionUnMaskable: currentlyDisplayedAtomSet.intersection_size(currentSelectionAtomSet) < currentSelectionAtomSet.size(),
            isNotSelectedMaskable: currentlyDisplayedAtomSet.intersects(notSelectedAtomSet),
            isNotSelectedUnMaskable: currentlyDisplayedAtomSet.intersection_size(notSelectedAtomSet) < notSelectedAtomSet.size()
          }
          break
        case 'user':
          const userAtomSet = structure.getAtomSet(new NGL.Selection(context.state.userSelectionText))
          const restUserAtomSet = userAtomSet.clone().flip_all()
          anchor = {
            type: 'user',
            isMaskable: currentlyDisplayedAtomSet.intersects(userAtomSet),
            isUnMaskable: currentlyDisplayedAtomSet.intersection_size(userAtomSet) < userAtomSet.size(),
            isRestPresent: !restUserAtomSet.isEmpty(),
            isRestMaskable: currentlyDisplayedAtomSet.intersects(restUserAtomSet),
            isRestUnMaskable: currentlyDisplayedAtomSet.intersection_size(restUserAtomSet) < restUserAtomSet.size()
          }
          // console.log(anchor)
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
        selector = currentSelectionAtomSet.clone().flip_all().toSeleString()
      } else if (selector === 'selected') {
        selector = currentSelectionAtomSet.toSeleString()
      } else if (selector === 'hidden') {
        selector = currentlyDisplayedAtomSet.clone().flip_all().toSeleString()
      }
      highlight(selector)
    },

    setClipNear ({commit}, percentage) {
      stage.setParameters({clipNear: percentage})
    },

    setStageParameters ({commit}, params) {
      stage.setParameters(params)
      if (params.backgroundColor) {
        distance.switchColor(params.backgroundColor)
      }
    },
    sequenceSelected (context, tabSelectedResidues) {
      // has the selection started by a selected residue ?
      let isToBeSelected = (context.state.selected[tabSelectedResidues[0]] === false)
      // console.log(tabSelectedResidues, context.state.selected[tabSelectedResidues[0]])
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
      // console.log('chain:', chainId, isToBeSelected)
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
            currentSelectionAtomSet.add(i)
          }
        } else {
          for (let i = atomId; i < atomId + nbAtoms; i++) {
            currentSelectionAtomSet.remove(i)
          }
        }
      })
      // context.commit('updateSelectedFromTab', {tabSelectedResidues, isToBeSelected})
      context.commit('updateSelected', currentSelectionAtomSet)
      context.commit('updateSelection')
      context.commit('updateSelectedPercentage')
      context.commit('color', getColorFromSelection())
      context.commit('display', getRepresentationFromSelection())
    },
    setMouseMode (context, mouseMode) {
      switch (mouseMode) {
        case 'distance' :
          // set cursor style
          stage.viewer.container.style.cursor = 'crosshair'
          // set signal picking atom
          stage.signals.clicked.add(distance.clickDistance)
          stage.signals.hovered.add(distance.hoverDistance)
          // set state to measuring
          context.commit('isMeasuringDistances', true)
          break
        default :
          // set cursor style
          stage.viewer.container.style.cursor = 'default'
          // set signal picking atom
          stage.signals.clicked.removeAll()
          stage.signals.hovered.remove(distance.hoverDistance)
          // set state to not measuring
          context.commit('isMeasuringDistances', false)
          // disable distance highlights
          distance.disable()
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
          subject: help(subject.action, subject.attribute),
          resetHistory: newSubject
        })
      } else if (subject.token) { // help system internal link
        commit('helpHistoryStart', {
          subject: subject.token,
          resetHistory: newSubject
        })
      }
    },
    helpNavigate ({commit}, step) {
      if (step === 'backward') {
        commit('helpHistoryStep', -1)
      } else {
        commit('helpHistoryStep', 1)
      }
    },
    userSelection (context, value) {
      const sel = new NGL.Selection(value)
      const as = structure.getAtomSet(sel)
      context.commit('userSelectionSize', as.size())
      highlight(value)
      predefined.userSelection(as)
    },
    highlightUserSelection (context, value) {
      highlight(value)
    }
  },
  getters: {
    getResidue: state => {
      return { name: state.name, structure }
    }
  }
})

export default vuex
