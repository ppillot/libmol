import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './plugins/element.js'
import VueI18n from 'vue-i18n'

Vue.config.productionTip = false
Vue.use(VueI18n)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
