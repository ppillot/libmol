<template>
  <div class="settings">
    <form-item :label="$t('ui.toolbar.settings.clip_near_label')">
      <el-slider v-model="clipNear"></el-slider>  
    </form-item>
    <form-item :label="$t('ui.toolbar.settings.fog_label')">
      <el-slider v-model="fog" range></el-slider>  
    </form-item>
    <form-item :label="$t('ui.toolbar.settings.background_label')">
      <el-switch
        v-model="color"
        :active-text="$t('ui.toolbar.settings.white')"
        :inactive-text="$t('ui.toolbar.settings.black')"
        @change="switchBackgroundColor">
      </el-switch>
    </form-item>
    <form-item :label="$t('ui.toolbar.settings.multiple_bonds')">
      <el-switch
        v-model="multipleBond"
        @change="switchMultipleBond">
      </el-switch>
    </form-item>
    <form-item :label="$t('ui.toolbar.settings.language')" inline>
      <select @change="switchLanguage">
        <option 
          :value="language" 
          :selected="language == lang"
          v-for="language in locales"
          :key="language">
          {{ language }}
        </option>
      </select>  
    </form-item>
    <contacts-types-settings />

    <div style="text-align: right">
      <el-button
        type="primary"
        size="medium"
        @click="reset">{{ $t('ui.toolbar.settings.reset') }}</el-button>
    </div>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  import ContactsTypesSettings from './ContactsTypesSettings'
  import { locales } from '../locales/locales'
  import Vue from 'vue'
  
  var defaultParameters = {
    clipNear: 0,
    clipFar: 100,
    fog: [50, 100],
    backgroundColor: 'white',
    ambientIntensity: 0.2,
    lightIntensity: 1,
    cameraType: 'perspective',
    multipleBond: false
  }

  export default {
    name: 'settings',
    components: {
      FormItem,
      ContactsTypesSettings
    },
    data () {
      return {
        clipNear: 0,
        clipFar: 100,
        fog: [50, 100],
        backgroundColor: 'white',
        ambientIntensity: 0.2,
        lightIntensity: 1,
        cameraType: 'perspective',
        color: true,
        locales: locales,
        lang: this.$root.$lang,
        multipleBond: false
      }
    },
    methods: {
      reset () {
        Object.assign(this.$data, defaultParameters, {color: true})
        this.setStageParameters(defaultParameters)
        this.$store.dispatch('displayContacts', [])
      },
      setStageParameters (params) {
        this.$store.dispatch('setStageParameters', params)
      },
      switchBackgroundColor (isWhite) {
        let color = (isWhite) ? 'white' : 'black'
        this.setStageParameters({backgroundColor: color})
      },
      switchMultipleBond (enableMultipleBond) {
        this.$store.dispatch('setRepresentationParameters', {
          multipleBond: (enableMultipleBond) ? 'symmetric' : 'off'
        })
      },
      switchLanguage (ev) {
        /* eslint-disable */
        import(`../locales/bundles/${ev.target.value}.json`)
        .then(response => {
          Vue.locale([ev.target.value], response)
          Vue.config.lang = this.lang = ev.target.value
          return Promise.resolve()
        })
        .catch(err => {
          console.log('failed to import ' + ev.target.value + '.json', err)
        })
        /* eslint-enable */
      }
    },
    watch: {
      clipNear: function (val) {
        this.setStageParameters({clipNear: val})
      },
      fog: function ([percentNear, percentFar]) {
        this.setStageParameters({fogNear: percentNear, fogFar: percentFar})
      }
    }
  }
</script>

<style>
  .settings {
    margin: 1em 1em 0.5em 1em
  }
  .settings .form-item {
    margin-bottom: 1em;
  }
  .settings.el-form {
    padding: 1em;
  }
  .settings label {
    font-weight: 500;
  }
  .settings .form-item-slot {
    margin-top: 0;
  }
  .settings select {
    font-size: 1em;
    border: none;
    background: #bfcbd9;
  }
  .settings select:focus {
    outline: none;
  }
</style>
