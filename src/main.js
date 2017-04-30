import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {Autocomplete, Button, Col, Dialog, Icon, Popover, Row, Scrollbar, Slider, Switch, Tabs, TabPane} from 'element-ui'
import App from './App'
import store from './store'
import { locales } from './locales/locales'

Vue.use(VueI18n)
Vue.use(Autocomplete)
Vue.use(Button)
Vue.use(Col)
Vue.use(Dialog)
Vue.use(Icon)
Vue.use(Popover)
Vue.use(Row)
Vue.use(Scrollbar)
Vue.use(Slider)
Vue.use(Switch)
Vue.use(Tabs)
Vue.use(TabPane)

// set lang
// const locales = ['en', 'fr']
let language = [navigator.language]
if (navigator.languages) language = language.concat(navigator.languages)
let lang = language.find(navPreferedLanguage => {
  return locales.find(locale => {
    return navPreferedLanguage.substr(0, 2) === locale
  })
}).substr(0, 2).toLowerCase()

if (lang === undefined) lang = 'en'

/* eslint-disable */
import('./locales/' + lang + '.json')
/* eslint-enable */
.then(response => {
  Vue.locale(lang.substr(0, 2), response)
  Vue.config.lang = lang
  return Promise.resolve()
}).then(function () {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    store,
    // template: '<App/>',
    // components: { App },
    render: h => h(App)
  })
})
.catch(err => {
  console.log('failed to import ' + lang + '.json', err)
})

// set locales
/* Object.keys(locales).forEach(function (lang) {
  Vue.locale(lang, locales[lang])
}) */

/* eslint-disable no-new */

