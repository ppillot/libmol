import Vue from 'vue'
import Vuex from 'vuex'
// import * as actions from './actions'
// import * as getters from './getters'
import * as NGL from 'ngl'

Vue.use(Vuex)

/** @description local module variable to hold the NGL stage object
 * @typedef {NGL.stage}
 */
var stage = {}
var structure = {}
var resRepresentations
var representationsList = []

function onHover (response) {
  // console.log(response)
  let atomHovered = response.atom // (response.atom !== undefined) ? response.atom : (response.bond !== undefined) ? response.bond.atom1 : undefined
  // console.log(response, atomHovered)
  if (atomHovered !== undefined) {
    let atom = {
      symbol: atomHovered.element,
      atomname: atomHovered.atomname,
      resname: atomHovered.resname,
      resno: atomHovered.resno,
      chainname: atomHovered.chainname,
      entity: atomHovered.entity.description
    }
    vuex.dispatch('atomHovered', atom)
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
/*
function highlightRes (res) {
  let reprHighlight = stage.addRepresentation('spacefill', {sele: res})
  return function (sel) {
    reprHighlight.selection(sel)
  }
}
*/
const debug = process.env.NODE_ENV !== 'production'
if (debug) {
  window.NGL = NGL
}

var vuex = new Vuex.Store({
  state: {
    fileName: '',
    name: 'LibMol',
    mol: {
      chains: [],
      molTypes: {
        protein: true,
        nucleic: false,
        water: false,
        saccharide: false,
        hetero: false
      }
    },
    selection: '*',
    display: 'licorice',
    color: 'element',
    atomHovered: {},
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
    setMolTypes (state, {molTypes, chains}) {
      state.mol.molTypes.protein = molTypes.has(3)
      state.mol.molTypes.nucleic = molTypes.has(4) || molTypes.has(5) // 4: RNA; 5:DNA
      state.mol.molTypes.water = molTypes.has(1)
      state.mol.molTypes.saccharide = molTypes.has(6)
      state.mol.molTypes.hetero = molTypes.has(0) || molTypes.has(2) // 0: Unknown; 2: Ions

      state.mol.chains = chains
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
    }
  },
  actions: {
    createNewStage (context, options) {
      stage = new NGL.Stage(options.id, { backgroundColor: 'white' })
      stage.signals.hovered.add(onHover)
      context.dispatch('loadNewFile', { file: 'rcsb://1crn', value: 'Crambin - 1CRN' })

      if (debug) { window.stage = stage }
    },
    loadNewFile (context, newFile) {
      stage.removeAllComponents()
      stage.loadFile(newFile.file)
      .then((component) => { // let's get the structure property from the structureComponent object returned by NGL's promise
        // structure is a global to this module
        structure = component.structure
        if (debug) window.structure = structure

        // resRepresentations is a global to this module
        resRepresentations = new Uint8Array(33333)

        let molTypes = new Set()
        let chainMap = new Map()
        let chains = []

        // let's enumerate each residue from this structure
        component.structure.eachResidue(item => {
          // Have we encountered a yet unknown chain.
          if (!chainMap.has(item.chainname)) {
            // let's keep track of the different chains by their given order
            chainMap.set(item.chainname, chainMap.size)

            // let's set new chain properties based upon first item
            chains.push({
              id: item.chainIndex,
              name: item.chainname,
              entity: item.entity.description,
              sequence: []
            })
          }

          // add a residue corresponding to the item in the chain sequence
          let chainId = chainMap.get(item.chainname)
          chains[chainId].sequence.push({
            resname: item.resname,
            resno: item.resno,
            hetero: item.hetero,
            index: item.index,
            selected: true
          })
          molTypes.add(item.moleculeType)
        })
        resRepresentations.fill(0)

        context.commit('setMolTypes', {molTypes, chains})

        component.addRepresentation('licorice')
        component.centerView()
        representationsList[0] = {display: 'licorice', color: 'cpk', sele: []}
      })

      context.commit('loadNewFile', newFile)
    },
    selection (context, selector) {
      context.commit('selection', selector)
    },
    display (context, displayType) {
      console.log(representationsList)
      stage.compList[0].addRepresentation(displayType, {sele: context.state.selection})
      context.commit('display', displayType)
    },
    color (context, colorScheme) {
      stage.compList[0].addRepresentation(context.state.display, {sele: context.state.selection, color: colorScheme})
      context.commit('color', colorScheme)
    },
    atomHovered (context, atom) {
      context.commit('atomHovered', atom)
    },
    sequenceHovered (context, item) {
      let itemHovered = {}
      switch (item.type) {
        case 'chain':
          let chain = context.state.mol.chains.find(ch => ch.id === parseInt(item.index))
          itemHovered = {
            name: '',
            num: -1,
            chain: chain.name,
            description: chain.entity
          }
          break
        default:
          let res = structure.getResidueProxy(item.index) // call to NGL structure object
          itemHovered = {
            name: res.resname,
            num: res.resno,
            chain: res.chainname,
            description: getDescriptionFromRes.call(this, res)
          }
      }

      context.commit('itemHovered', itemHovered)
      // highlightRes(item)
    },
    setClipNear ({commit}, percentage) {
      stage.setParameters({clipNear: percentage})
      // commit('setClipNear', percentage)
    },
    setStageParameters ({commit}, params) {
      stage.setParameters(params)
    }
  },
  getters: {
    getResidue: state => {
      return { name: state.name, structure }
    }
  }
})

export default vuex
