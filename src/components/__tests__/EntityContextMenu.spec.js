import EntityContextMenu from '../EntityContextMenu.vue'
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
    anchor: {
      type: 'chain',
      chain: 'A',
      isMaskable: true,
      isUnMaskable: true,
      isRestMaskable: true,
      isRestUnMaskable: true,
      isRestPresent: true
    }
  }
}
const target = document.createElement('td')

describe('EntityContextMenu.vue', () => {
  test('renders "EntityContextMenu"', () => {
    const props = {
      showContextMenu: true,
      target: target
    }
    const wrapper = shallow(EntityContextMenu, {
      localVue,
      propsData: props,
      mocks: {
        $store
      }
    })
    expect(wrapper.is('div')).toBe(true)
  })

  test('Context menu title is correct', () => {
    const props = {
      showContextMenu: true,
      target: target
    }
    const wrapper = shallow(EntityContextMenu, {
      localVue,
      propsData: props,
      mocks: {
        $store
      }
    })
    expect(wrapper.find('.context-menu > div').text()).toBe('Chain A')
  })

  test('menu elements are created', () => {
    const s = Object.assign({}, $store)
    s.state.anchor.isMaskable = false

    const props = {
      showContextMenu: true,
      target: target
    }
    const wrapper = shallow(EntityContextMenu, {
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
      target: { top: 10, left: 20, right: 20 }
    }
    const wrapper = shallow(EntityContextMenu, {
      localVue,
      propsData: props,
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.contextMenuStyles.top).toBe('-5px')
  })
})
