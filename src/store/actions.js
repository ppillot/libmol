import * as types from './mutation-types'

export const loadNewFile = ({ commit }, product) => {
  if (product.inventory > 0) {
    commit(types.NEW_FILE, {
      id: product.id
    })
  }
}
