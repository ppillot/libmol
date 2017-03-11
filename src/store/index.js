import Vue from 'vue'
import Vuex from 'vuex'
// import * as actions from './actions'
// import * as getters from './getters'
import * as NGL from 'ngl'
/* eslint-disable-next-line */
// let NGL = () => import('ngl') /* eslint-disable-line */
import debounce from 'throttle-debounce/debounce'
import Screenfull from 'screenfull'

Vue.use(Vuex)

/** @description local module variable to hold the NGL stage object
 * @typedef {NGL.stage}
 */
var stage = {}
var structure = {}
var resRepresentations
var representationsList = []
var highlight
var currentSelectionAtomSet
var currentlyDisplayedAtomSet
var wholeAtomSet

/**
 * @description removes residues form their current representation so that they are set only in the latest
 *
 * @param {NGL atomSet} atomSet
 * @param {number} skipReprIndex index of the latest representation : must be skipped !
 */
function removeSelectionFromRepresentations (atomSet, skipReprIndex) {
  for (let i = 0; i < representationsList.length; i++) {
    if (i === skipReprIndex) {
      continue
    }
    const repr = representationsList[i]
    if (repr.atomSet.intersects(atomSet)) {
      let sele = repr.atomSet.difference(atomSet)
      stage.compList[0].reprList[repr.index].setSelection(sele.toSeleString())
    }
  }
}
function onHover (response) {
  let atomHovered = response.atom // (response.atom !== undefined) ? response.atom : (response.bond !== undefined) ? response.bond.atom1 : undefined
  if (atomHovered !== undefined) {
    // console.log(atom)
    let atom = {
      symbol: atomHovered.element,
      atomname: atomHovered.atomname,
      resname: atomHovered.resname,
      resno: atomHovered.resno,
      chainname: atomHovered.chainname,
      entity: atomHovered.entity.description,
      resType: atomHovered.residueType.moleculeType,
      pos: {x: response.canvasPosition.x, y: response.canvasPosition.y}
    }
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
      description = res.entity.description
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
  let reprHighlight = component.addRepresentation('spacefill', {sele: 'none', color: 'limegreen', opacity: 0.2})
  return function (sel) {
    reprHighlight.setSelection(sel)
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
      sstruc: new Set()
    },
    selected: [],
    selection: '*',
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
    }
  },
  mutations: {
    loadNewFile (state, newFile) {
      state.fileName = newFile.file
      state.name = newFile.value
    },
    setMolTypes (state, {molTypes, chains, elements, residues, sstruc, selected}) {
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
    setClipNear (state, percentage) {
      state.stage.clipNear = percentage
    },
    setFullscreen (state, isFullscreenOn) {
      state.fullscreen = isFullscreenOn
    },
    isAtomHovered (state, isDisplayed) {
      state.isAtomHovered = isDisplayed
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
    hide (state, everythingIsDisplayed) {
      state.isHidden = !everythingIsDisplayed
    }
  },
  actions: {
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

        // resRepresentations is a private var of this module
        resRepresentations = new Uint16Array(structure.residueStore.length)

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
              entity: item.entity.description,
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
        resRepresentations.fill(0)

        getChainColors(chains, structure).forEach(
          (color, index) => {
            chains[index].color = color
          }
        )

        context.commit('setMolTypes', {molTypes, chains, elements, residues, sstruc, selected})

        component.addRepresentation('ball+stick')
        component.centerView()
        representationsList[0] = {
          display: 'ball+stick',
          color: 'cpk',
          sele: '*',
          atomSet: structure.getAtomSet(),
          index: component.reprList.length - 1
        }
        currentSelectionAtomSet = structure.getAtomSet()
        currentlyDisplayedAtomSet = currentSelectionAtomSet.clone()
        wholeAtomSet = currentSelectionAtomSet.clone()

        highlight = highlightRes(component)
      })
      context.commit('loadNewFile', newFile)
      context.dispatch('init')
    },
    init (context) {
      context.commit('selection', '*')
      context.commit('display', 'ball+stick')
      context.commit('color', 'element')
    },
    selection (context, selector) {
      context.commit('selection', selector)
      const sel = new NGL.Selection(selector)
      currentSelectionAtomSet = structure.getAtomSet(sel)
      context.commit('updateSelected', currentSelectionAtomSet)
    },

    display (context, displayType) {
      // console.log(representationsList)
      const num = representationsList.findIndex(val => {
        return val.display === displayType
      })
      // console.log(num)
      if (num === -1) {
        // new representation
        stage.compList[0].addRepresentation(displayType,
                                            {sele: context.state.selection || currentSelectionAtomSet.toSeleString()})
        representationsList.push(
          {display: displayType,
            index: stage.compList[0].reprList.length - 1,
            atomSet: currentSelectionAtomSet.clone(),
            sele: context.state.selection})
        removeSelectionFromRepresentations(currentSelectionAtomSet, representationsList.length - 1)
      } else {
        const repr = representationsList[num]
        // representation already exists, is it the same selection ?
        if (!repr.atomSet.equals(currentSelectionAtomSet)) {
          // not the same selection, we must extend representation to the union
          repr.atomSet.union(currentSelectionAtomSet)

          // need to update the representation
          stage.compList[0].reprList[repr.index].setSelection(repr.atomSet.toSeleString())

          // and to update the remaining representations
          removeSelectionFromRepresentations(currentSelectionAtomSet, num)
        }
      }
      context.commit('display', displayType)
    },

    hide (context) {
      // decide if we should hide or show depending on wether selected atoms are displayed
      let isToBeHidden = currentlyDisplayedAtomSet.intersects(currentSelectionAtomSet)

      if (isToBeHidden) {
        currentlyDisplayedAtomSet.difference(currentSelectionAtomSet)
      } else {
        currentlyDisplayedAtomSet.union(currentSelectionAtomSet)
      }

      stage.compList[0].setSelection(currentlyDisplayedAtomSet.toSeleString())
      context.commit('hide', currentlyDisplayedAtomSet.equals(wholeAtomSet))
    },

    color (context, colorScheme) {
      stage.compList[0].addRepresentation(context.state.display, {sele: context.state.selection, color: colorScheme})
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
            description: chain.entity
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
      highlight(selector)
    },
    setClipNear ({commit}, percentage) {
      stage.setParameters({clipNear: percentage})
      // commit('setClipNear', percentage)
    },
    setStageParameters ({commit}, params) {
      stage.setParameters(params)
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
      context.commit('updateSelectedFromTab', {tabSelectedResidues, isToBeSelected})
      context.commit('selection', undefined)
    }
  },
  getters: {
    getResidue: state => {
      return { name: state.name, structure }
    }
  }
})

export default vuex
