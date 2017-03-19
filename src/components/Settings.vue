<template>
  <div class="settings">
    <form-item :label="$t('ui.settings.clip_near_label')">
      <el-slider v-model="clipNear"></el-slider>  
    </form-item>
    <form-item :label="$t('ui.settings.fog_label')">
      <el-slider v-model="fog" range></el-slider>  
    </form-item>
    <form-item :label="$t('ui.settings.background_label')">
      <el-switch
        v-model="color"
        :width="80"
        on-color="#ddd"
        off-color="black"
        :on-text="$t('ui.settings.white')"
        :off-text="$t('ui.settings.black')"
        @change="switchBackgroundColor">
      </el-switch>
    </form-item>
    <div style="text-align: right">
      <el-button type="primary" @click="reset">{{ $t('ui.settings.reset') }}</el-button>
    </div>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  
  var defaultParameters = {
    clipNear: 0,
    clipFar: 100,
    fog: [50, 100],
    backgroundColor: 'white',
    ambientIntensity: 0.2,
    lightIntensity: 1,
    cameraType: 'perspective'
  }

  export default {
    name: 'settings',
    components: {
      FormItem
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
        color: true
      }
    },
    methods: {
      reset () {
        Object.assign(this.$data, defaultParameters, {color: true})
        this.setStageParameters(defaultParameters)
      },
      setStageParameters (params) {
        this.$store.dispatch('setStageParameters', params)
      },
      switchBackgroundColor (isWhite) {
        let color = (isWhite) ? 'white' : 'black'
        this.setStageParameters({backgroundColor: color})
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
</style>
