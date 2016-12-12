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

// const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    fileName: '',
    name: 'LibMol'
  },
  mutations: {
    loadNewFile (state, newFile) {
      state.fileName = newFile.file
      state.name = newFile.value
    }
  },
  actions: {
    createNewStage (context, options) {
      stage = new NGL.Stage(options.id, { backgroundColor: 'white' })
      context.dispatch('loadNewFile', { file: 'rcsb://1crn', value: '1crn' })
    },
    loadNewFile (context, newFile) {
      stage.loadFile(newFile.file, { defaultRepresentation: true })
      context.commit('loadNewFile', newFile)
    }
  }
})
