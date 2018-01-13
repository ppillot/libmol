/* polyfills */
import 'utils/polyfills/array-find'
// import 'whatwg-fetch'

import Vue from 'vue'
import {Button, Checkbox, CheckboxGroup, Dialog, Icon, Option, Popover, Scrollbar, Select, Slider, Switch, Tabs, TabPane} from 'element-ui'
import App from './App'
import store from './store'
import { locales } from './locales/locales'
import './assets/font/css/icons.css'

// Vue.use(VueI18n)
Vue.use(Button)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Dialog)
Vue.use(Icon)
Vue.use(Option)
Vue.use(Popover)
Vue.use(Scrollbar)
Vue.use(Select)
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
import('./locales/bundles/' + lang + '.json')
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

