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

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
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
    display: 'licorice'
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
    }
  },
  actions: {
    createNewStage (context, options) {
      stage = new NGL.Stage(options.id, { backgroundColor: 'white' })
      context.dispatch('loadNewFile', { file: 'rcsb://1crn', value: '1crn' })

      if (debug) { window.stage = stage }
    },
    loadNewFile (context, newFile) {
      stage.removeAllComponents()
      stage.loadFile(newFile.file, { defaultRepresentation: true })
      .then(({structure}) => { // let's get the structure property from the structureComponent object returned by NGL's promise
        // console.log(structure)
        window.structure = structure
        let molTypes = new Set()
        let chainMap = new Map()
        let chains = []
        structure.eachResidue(item => {
          if (!chainMap.has(item.chainname)) {
            chainMap.set(item.chainname, chainMap.size)
            chains.push({id: item.chainname, sequence: []})
          }
          let chainId = chainMap.get(item.chainname)
          chains[chainId].sequence.push({
            resname: item.resname,
            resno: item.resno,
            hetero: item.hetero
          })
          molTypes.add(item.moleculeType)
        })

        context.commit('setMolTypes', {molTypes, chains})
      })

      context.commit('loadNewFile', newFile)
    },
    selection (context, selector) {
      context.commit('selection', selector)
    },
    display (context, displayType) {
      context.commit('display', displayType)
    }
  }
})
