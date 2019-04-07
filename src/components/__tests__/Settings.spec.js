import Settings from '../Settings.vue'
import { shallow, createLocalVue } from 'vue-test-utils'
import VueI18n from 'vue-i18n'

const localVue = createLocalVue()
localVue.use(VueI18n)
import('../../locales/bundles/en.json')
  .then(response => {
    localVue.locale('en', response)
    localVue.config.lang = 'en'
  })
  .catch((t) => {
    console.log('error in loading locale: ' + t)
  })

let $store = {
  state: {
    fog: [50, 100],
    mol: {
      nbSSBridges: 0
    }
  },
  dispatch: jest.fn()
}

describe('Settings.vue', () => {
  test('renders "Settings" component', () => {
    const wrapper = shallow(Settings, {
      localVue,
      mocks: {
        $store
      }
    })
    expect(wrapper.is('div')).toBe(true)
  })

  test('change fog value and reset', () => {
    const wrapper = shallow(Settings, {
      localVue,
      mocks: {
        $store
      }
    })
    wrapper.vm.fog = [50, 60]
    wrapper.update()
    expect($store.dispatch).toHaveBeenCalledWith('setStageParameters', {fogFar: 60, fogNear: 50})

    wrapper.vm.reset()
    wrapper.update()
    expect(wrapper.vm.fog).toEqual([50, 100])
    expect($store.dispatch).toHaveBeenCalledWith('setStageParameters', {fogFar: 100, fogNear: 50})
  })

/*
  test('menu elements are created', () => {
    const s = Object.assign({}, $store)
    s.state.anchor.isMaskable = false

    const props = {
      showContextMenu: true,
      target: target
    }
    const wrapper = shallow(Settings, {
      localVue,
      propsData: props,
      mocks: {
        $store: s
      }
    })
    expect(wrapper.findAll('li.disabled').length).toBe(1)
  })

  test('target prop accepts object', () => {
    const props = {
      showContextMenu: true,
      target: {top: 10, left: 20, right: 20}
    }
    const wrapper = shallow(Settings, {
      localVue,
      propsData: props,
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.contextMenuStyles.top).toBe('-5px')
  })
*/
})

