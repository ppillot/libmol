import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './plugins/element.js'
import VueI18n from 'vue-i18n'
import { locales } from './locales/locales'

Vue.config.productionTip = false
Vue.use(VueI18n)

let langList = [navigator.language]
if (navigator.languages) langList.push(...navigator.languages)
const langSet = new Set(
  langList.map( (l) => {
    return l.substr(0, 2).toLowerCase()
  })
)
let lang = locales.find(locale => {
    return langSet.has(locale)
})
if (lang === undefined) lang = 'en'

import('./locales/bundles/' + lang + '.json')
.then(messages => {

    const i18n = new VueI18n({
        locale: lang,
        messages
    })
  
    new Vue({
        store,
        i18n,
        render: h => h(App)
    }).$mount('#app')
})
.catch(err => {
  console.log('failed to import ' + lang + '.json', err)
})
