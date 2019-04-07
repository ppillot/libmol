import Vue from 'vue'
import { Button, Dialog, Popover, Slider, Switch, Tabs, TabPane, Select, Checkbox, CheckboxGroup, Option } from 'element-ui'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

locale.use(lang)

Vue.use(Button)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Dialog)
Vue.use(Option)
Vue.use(Popover)
Vue.use(Select)
Vue.use(Slider)
Vue.use(Switch)
Vue.use(Tabs)
Vue.use(TabPane)
