import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import './plugins/element'
import VueI18n from 'vue-i18n'
import { locales as localesList } from './locales/locales'
import './assets/font/css/icons.css'

Vue.config.productionTip = false
Vue.use(VueI18n)

let langList = [navigator.language]
if (navigator.languages) langList.push(...navigator.languages)
const langSet = new Set(
  langList.map((l) => {
    return l.substr(0, 2).toLowerCase()
  })
)
let langFound: string
for (const locale of langSet) {
  if (localesList.includes(locale)) {
    langFound = locale
    break
  }
}

const lang = (langFound === undefined) ? 'en' : langFound

import('./locales/bundles/' + lang + '.json')
  .then(messages => {
    const opt = {
      locale: lang,
      messages: {}
    }
    opt.messages[lang] = messages

    const i18n = new VueI18n(opt)

    new Vue({
      store,
      i18n,
      render: h => h(App)
    }).$mount('#app')

  })
  .catch(err => {
    console.log('failed to import ' + lang + '.json', err)
  })
