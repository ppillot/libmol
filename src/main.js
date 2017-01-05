import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App'
import store from './store'

Vue.use(VueI18n)
Vue.use(ElementUI)

// ready translated locales
var locales = {
  en: {
    message: {
      file: 'Files'
    }
  },
  fr: {
    message: {
      file: 'Fichiers'
    }
  }
}

// set lang
Vue.config.lang = 'fr'

// set locales
Object.keys(locales).forEach(function (lang) {
  Vue.locale(lang, locales[lang])
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
})
