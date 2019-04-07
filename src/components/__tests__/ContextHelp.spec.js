import ContextHelp from '../ContextHelp.vue'
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

describe('ContextHelp.vue', () => {
  test('renders "ContextHelp" component', () => {
    const wrapper = shallow(ContextHelp, {
      localVue,
      mocks: {
        $store
      }
    })
    expect(wrapper.is('span')).toBe(true)
  })
})

