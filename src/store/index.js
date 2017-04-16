import Vue from 'vue'
import Vuex from 'vuex'
// import * as actions from './actions'
// import * as getters from './getters'
import {Stage, Selection, ColormakerRegistry, download, Vector3, Vector2} from 'ngl'
/* eslint-disable-next-line */
// let NGL = () => import('ngl') /* eslint-disable-line */
import debounce from 'throttle-debounce/debounce'
import Screenfull from 'screenfull'
import help from 'utils/help'

let NGL = {Stage, Selection, ColormakerRegistry, download, Vector2, Vector3}
Vue.use(Vuex)

/** @description local module variable to hold the NGL stage object
 * @typedef {NGL.stage}
 */
var stage = {}
var structure = {}
var representationsList = []
var highlight
var distance
var currentSelectionAtomSet
var currentlyDisplayedAtomSet
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
    if (repr.name === 'highlight') return
    repr.setColor(globalColorScheme)
  })
}

function updateRepresentationDisplay () {
  representationsList.forEach(repr => {
    repr.displayedAtomSet = repr.atomSet.clone().intersection(currentlyDisplayedAtomSet)
    // console.log('update repr:', repr.name, repr.index, repr.displayedAtomSet)
    stage.compList[0].reprList[repr.index].setSelection(repr.displayedAtomSet.toSeleString())
  })
}

function updateStageCenter () {
  const sele = currentlyDisplayedAtomSet.toSeleString()
  stage.compList[0].autoView(sele, 1000)
}

function getCanvasPositionFromCoordinates (atom) {
  const rg = stage.viewer.rotationGroup
  const tg = stage.viewer.translationGroup
  let v = new NGL.Vector3(atom.x, atom.y, atom.z)

  v.add(tg.position)
  v.applyMatrix4(rg.matrix)
  v.project(stage.viewer.camera)

  return {
    x: (v.x + 1) * stage.viewer.width / 2,
    y: (v.y + 1) * stage.viewer.height / 2
  }
}

function getClosestAtomFromBond (bond, pointerPosition) {
  const a1 = getCanvasPositionFromCoordinates(bond.atom1)
  const a2 = getCanvasPositionFromCoordinates(bond.atom2)
  const v1 = new NGL.Vector2(a1.x, a1.y)
  const v2 = new NGL.Vector2(a2.x, a2.y)
  const vp = new NGL.Vector2(pointerPosition.x, pointerPosition.y)

  return (vp.distanceTo(v1) < vp.distanceTo(v2))
    ? bond.atom1
    : bond.atom2
}

function measureDistance (component, context) {
  let tabMeasures = []
  let measure = {
    atom1: {},
    atom2: {},
    distance: 0
  }
  let distRepr = {}
  let distHighLightRepr = {}
  let labelColor = 0x000000
  const comp = component

  function dispatch () {
    context.dispatch('setDistances', tabMeasures)
  }

  function getDistance (atom1, atom2) {
    return atom1.distanceTo(atom2)
  }

  function switchBackgroundColor (color) {
    labelColor = (color === 'black') ? 0xFFFFFF : 0x000000
    if (comp.hasRepresentation(distRepr)) {
      distRepr.setParameters({labelColor: labelColor})
    }
  }

  function distanceRepresentation () {
    const tabAtomPairs = tabMeasures.reduce((acc, val) => {
      return acc.concat([[val.atom1.index, val.atom2.index]])
    }, [])

    if (comp.hasRepresentation(distRepr)) {
      distRepr.setParameters({
        atomPair: tabAtomPairs
      })
    } else {
      distRepr = comp.addRepresentation('distance', {
        atomPair: tabAtomPairs,
        labelColor: labelColor,
        color: 0x1D8CE0,
        opacity: 0.5,
        scale: 0.1,
        labelUnit: 'nm'
      })
    }
  }

  function distanceHighlight (atom) {
    if (atom === undefined) {
      // hover a non atom/bond shape
      if (measure.atom1.index) {
        distHighLightRepr.setSelection('@' + measure.atom1.index)
      } else {
        distHighLightRepr.setSelection('none')
      }
      return
    }

    const atom1Modifier = (measure.atom1.index) ? ',' + measure.atom1.index : ''
    if (comp.hasRepresentation(distHighLightRepr)) {
      distHighLightRepr.setSelection('@' + atom.index + atom1Modifier)
    } else {
      distHighLightRepr = comp.addRepresentation('spacefill', {
        sele: '@' + atom.index,
        color: 'red',
        scale: 0.4,
        opacity: 0.5
      })
    }
  }

  function clearDistanceHightLight () {
    if (distHighLightRepr.name !== undefined) {
      distHighLightRepr.setSelection('none')
    }
  }

  function clearMeasure (index) {
    tabMeasures.splice(index, 1)
    distanceRepresentation()
    dispatch()
  }

  function clearAllMeasures () {
    tabMeasures = []
    distanceRepresentation()
    dispatch()
  }

  function handleClick (response) {
    let atomClicked = response.atom
    if (atomClicked === undefined) {
      const bondClicked = response.bond
      if (bondClicked === undefined) {
        // cancel measurement
        // send a warning
        measure.atom1 = {}
        clearDistanceHightLight()
        return
      } else {
        atomClicked = getClosestAtomFromBond(bondClicked, response.canvasPosition)
      }
    }
    if (measure.atom1.index === undefined) {
      // first atom to be added to the measure
      measure.atom1 = atomClicked
      distanceHighlight(measure.atom1)
      return
    }
    measure.atom2 = atomClicked
    measure.distance = getDistance(measure.atom1, measure.atom2)
    tabMeasures.push({
      atom1: getAtomProperties(measure.atom1),
      atom2: getAtomProperties(measure.atom2),
      distance: measure.distance
    })
    measure.atom1 = {}
    distanceRepresentation()
    clearDistanceHightLight()
    dispatch()
  }

  function handleHover (response) {
    let atom = response.atom
    if (atom === undefined) {
      const bond = response.bond
      if (bond === undefined) {
        return
      } else {
        atom = getClosestAtomFromBond(bond, response.canvasPosition)
      }
    }
    distanceHighlight(atom)
  }

  return {
    clickDistance: function (response) {
      return handleClick(response)
    },
    delete: function (index) {
      return clearMeasure(index)
    },
    deleteAll: function () {
      return clearAllMeasures()
    },
    getMeasures: function () {
      return tabMeasures
    },
    hoverDistance: function (response) {
      return handleHover(response)
    },
    switchColor: function (color) {
      return switchBackgroundColor(color)
    }
  }
}
function getAtomProperties (atom) {
  return {
    index: atom.index,
    symbol: atom.element,
    atomname: atom.atomname,
    resname: atom.resname,
    resno: atom.resno,
    chainname: atom.chainname,
    entity: (atom.entity) ? atom.entity.description : 'unknown',
    resType: atom.residueType.moleculeType
  }
}
function onHover (response) {
  let atomHovered = response.atom // (response.atom !== undefined) ? response.atom : (response.bond !== undefined) ? response.bond.atom1 : undefined
  if (atomHovered !== undefined) {
    // console.log(atom)
    let atom = getAtomProperties(atomHovered)
    Object.assign(atom, {
      pos: {x: response.canvasPosition.x, y: response.canvasPosition.y}
    })
    vuex.dispatch('atomHovered', atom)
  } else {
    vuex.dispatch('displayAtomTooltip', false)
  }
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

function getChainColors (chains, structure) {
  // console.log(structure)
  var chainColors = []
  var chainNameScheme = NGL.ColormakerRegistry.getScheme({scheme: 'chainname', structure: structure})

  chains.forEach(chain => {
    chainColors.push(
      chainNameScheme.atomColor(
        structure.getAtomProxy(
          structure.getChainProxy(chain.id).atomOffset
        )
      ).toString(16)
    )
  })
  return chainColors
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

  const predefinedSets = [
    ['all', structure.getAtomSet()],
    ['protein', getAtomSet('protein')],
    ['saccharide', getAtomSet('saccharide')],
    ['nucleic', getAtomSet('nucleic')],
    ['water', getAtomSet('water')],
    ['hetero', getAtomSet('hetero and not water and not saccharide')]
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

  return function (as) {
    return findSet(as)
  }
}

const debug = process.env.NODE_ENV !== 'production'
if (debug) {
  window.NGL = NGL
}

var vuex = new Vuex.Store({
  state: {
    fileName: '',
    name: 'LibMol',
    fullscreen: false,
    mol: {
      chains: [],
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
    stage: {
      clipNear: 30
    },
    distances: [],
    help: '',
    helpHistory: [],
    helpHistoryForward: []
  },
  mutations: {
    loadNewFile (state, newFile) {
      state.fileName = newFile.file
      state.name = newFile.value
    },
    setMolTypes (state, {molTypes, chains, elements, residues, sstruc, selected, noSequence}) {
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
      state.atomHovered = atom
    },
    itemHovered (state, res) {
      state.itemHovered = res
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
      let sel = predefined(selector)
      state.selectedChains = sel.chains
      state.selection = sel.selection
    },
    hide (state, everythingIsDisplayed) {
      state.isHidden = !everythingIsDisplayed
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
        factor: 1,
        antialias: true,
        trim: false,
        transparent: false
      }).then(function (blob) {
        NGL.download(blob, 'screenshot.png')
      })
    },
    createNewStage (context, options) {
      stage = new NGL.Stage(options.id, { backgroundColor: 'white' })
      stage.signals.hovered.add(onHover)
      context.dispatch('loadNewFile', { file: 'rcsb://1crn', value: 'Crambin - 1CRN' })

      let resize = resizeStage(stage)
      window.onresize = debounce(100, resize)
      if (debug) { window.stage = stage }
    },
    loadNewFile (context, newFile) {
      stage.removeAllComponents()
      stage.loadFile(newFile.file)
      .then((component) => { // let's get the structure property from the structureComponent object returned by NGL's promise
        // structure is a private var of this module
        structure = component.structure
        if (debug) window.structure = structure

        // representationsList is a private var of this module
        representationsList = []

        let molTypes = new Set()
        let chainMap = new Map()
        let chains = []
        let elements = new Set(Object.keys(structure.atomMap.dict).sort()
                                      .map(atomIdentifier =>
                                        atomIdentifier.substr(atomIdentifier.indexOf('|') + 1)
                                      )
        )
        let residues = new Set(Object.keys(structure.residueMap.dict).sort()
                                      .map(residueIdentifier =>
                                        residueIdentifier.substr(0, residueIdentifier.indexOf('|'))
                                      )
        )
        let sstruc = new Set()
        let selected = []

        // let's iterate through each residue from this structure
        structure.eachResidue(item => {
          // Have we encountered a yet unknown chain.
          if (!chainMap.has(item.chainname)) {
            // let's keep track of the different chains by their given order
            const chainId = chainMap.size
            chainMap.set(item.chainname, chainId)

            // let's set new chain properties based upon first item
            chains.push({
              id: chainId,
              name: item.chainname,
              entity: (item.entity) ? item.entity.description : 'unknown',
              sequence: [],
              color: undefined
            })
          }

          // add a residue corresponding to the item in the chains' respective sequence
          let chainId = chainMap.get(item.chainname)
          chains[chainId].sequence.push({
            resname: item.resname,
            resno: item.resno,
            hetero: item.hetero,
            index: item.index,
            // moleculeType: item.moleculeType,
            selected: true
          })
          molTypes.add(item.moleculeType)
          sstruc.add(item.sstruc)
          selected.push(true)
        })

        getChainColors(chains, structure).forEach(
          (color, index) => {
            chains[index].color = color
          }
        )

        let noSequence = (structure.residueStore.count <= 1)

        context.commit('setMolTypes', {molTypes, chains, elements, residues, sstruc, selected, noSequence})
        context.commit('selectedChains')

        tabColorScheme = [['element', 'all']]
        updateGlobalColorScheme()
        component.addRepresentation('ball+stick')
        component.autoView()
        representationsList[0] = {
          display: 'ball+stick',
          color: 'element',
          sele: 'all',
          atomSet: structure.getAtomSet().clone(),
          displayedAtomSet: structure.getAtomSet().clone(),
          index: component.reprList.length - 1
        }
        currentSelectionAtomSet = structure.getAtomSet().clone()
        currentlyDisplayedAtomSet = structure.getAtomSet().clone()
        wholeAtomSet = structure.getAtomSet().clone()
        tabColorAtomSet = [structure.getAtomSet().clone()]

        predefined = getPredefined(structure, chains)
        highlight = highlightRes(component)
        distance = measureDistance(component, context)

        context.commit('loadNewFile', newFile)
        context.dispatch('init')
      })
    },
    init ({commit}) {
      commit('selection', 'all')
      commit('display', 'ball+stick')
      commit('color', 'element')
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
      context.commit('color', getColorFromSelection())
      context.commit('display', getRepresentationFromSelection())
    },

    display (context, {display, atomSet = currentSelectionAtomSet, overlay = false}) {
      const displayType = display
      // does this representation already exist?
      const num = representationsList.findIndex(val => {
        return (val.display === displayType && val.overlay === overlay)
      })
      let dAtomSet = atomSet.clone().intersection(currentlyDisplayedAtomSet)

      if (num === -1) {
        // new representation
        const seleString = (overlay && displayType !== 'spacefill') ? dAtomSet.toSeleString() + ' and sidechainAttached' : dAtomSet.toSeleString()
        stage.compList[0].addRepresentation(displayType,
          {
            sele: seleString,
            color: globalColorScheme
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

    hide (context) {
      // decide if we should hide or show depending on wether selected atoms are displayed
      let isToBeHidden = currentlyDisplayedAtomSet.intersects(currentSelectionAtomSet)

      if (isToBeHidden) {
        currentlyDisplayedAtomSet.difference(currentSelectionAtomSet)
      } else {
        currentlyDisplayedAtomSet.union(currentSelectionAtomSet)
      }

      updateRepresentationDisplay(isToBeHidden)
      updateStageCenter()
      context.commit('hide', currentlyDisplayedAtomSet.equals(wholeAtomSet))
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
          break
        default :
          // set cursor style
          stage.viewer.container.style.cursor = 'default'
          // set signal picking atom
          stage.signals.clicked.removeAll()
          stage.signals.hovered.remove(distance.hoverDistance)
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
    }
  },
  getters: {
    getResidue: state => {
      return { name: state.name, structure }
    }
  }
})

export default vuex
