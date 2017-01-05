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
      description = 'Ac-aminé'
      break
    case 4:
      description = 'Nucléotide'
      break
    case 5:
      description = 'Nucléotide'
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
    }
  },
  actions: {
    createNewStage (context, options) {
      stage = new NGL.Stage(options.id, { backgroundColor: 'white' })
      stage.signals.hovered.add(onHover)
      context.dispatch('loadNewFile', { file: 'rcsb://1crn', value: '1crn' })

      if (debug) { window.stage = stage }
    },
    loadNewFile (context, newFile) {
      stage.removeAllComponents()
      stage.loadFile(newFile.file)
      .then((component) => { // let's get the structure property from the structureComponent object returned by NGL's promise
        // console.log(structure)
        structure = window.structure = component.structure
        let molTypes = new Set()
        let chainMap = new Map()
        let chains = []
        component.structure.eachResidue(item => {
          if (!chainMap.has(item.chainname)) {
            chainMap.set(item.chainname, chainMap.size)
            chains[item.chainIndex] = {
              id: item.chainIndex,
              name: item.chainname,
              entity: item.entity.description,
              sequence: []
            }
          }
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

        context.commit('setMolTypes', {molTypes, chains})

        component.addRepresentation('licorice')
        component.centerView()
      })

      context.commit('loadNewFile', newFile)
    },
    selection (context, selector) {
      context.commit('selection', selector)
    },
    display (context, displayType) {
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
          let chain = context.state.mol.chains[item.index]
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
            description: getDescriptionFromRes(res)
          }
      }

      context.commit('itemHovered', itemHovered)
      // highlightRes(item)
    }
  },
  getters: {
    getResidue: state => {
      return { name: state.name, structure }
    }
  }
})

export default vuex
