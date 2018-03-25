import Help from '../Help.vue'
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
    helpHistory: {
      commands: []
    },
    helpHistoryForward: {
      commands: []
    },
    help: {
      commands: ''
    }
  }
}

describe('Help.vue', () => {
  test('renders "Help" component', () => {
    const wrapper = shallow(Help, {
      localVue,
      mocks: {
        $store
      }
    })
    expect(wrapper.is('div')).toBe(true)
  })

  test('renders Help content based upon store help value', () => {
    const lStore = Object.assign($store)
    const wrapper = shallow(Help, {
      localVue,
      mocks: {
        $store: lStore
      }
    })
    expect(wrapper.find('.help').text()).toBeFalsy()

    lStore.state.help.commands = 'lexiconProtein'
    wrapper.update()
    expect(wrapper.find('.help').text()).toBeTruthy()
  })

  test('toggle Help visibility', () => {
    const wrapper = shallow(Help, {
      localVue,
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.active).toBeTruthy()
    wrapper.vm.toggle()
    wrapper.update()
    expect(wrapper.vm.active).toBeFalsy()
  })
/*
  test('menu elements are created', () => {
    const s = Object.assign({}, $store)
    s.state.anchor.isMaskable = false

    const props = {
      showContextMenu: true,
      target: target
    }
    const wrapper = shallow(Help, {
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
    const wrapper = shallow(Help, {
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

