<template>
  <el-form label-position="top" class="settings">
    <el-form-item :label="$t('ui.settings.clip_near_label')">
      <el-slider v-model="clipNear" @change="setClipNear"></el-slider>  
    </el-form-item>
    <el-form-item :label="$t('ui.settings.fog_near_label')">
      <el-slider v-model="fogNear" @change="setFogNear"></el-slider>  
    </el-form-item>
    <el-form-item :label="$t('ui.settings.fog_far_label')">
      <el-slider v-model="fogFar" @change="setFogFar"></el-slider>  
    </el-form-item>
    <el-form-item :label="$t('ui.settings.background_label')">
      <el-switch
        v-model="color"
        width=80
        on-color="#ddd"
        off-color="black"
        :on-text="$t('ui.settings.white')"
        :off-text="$t('ui.settings.black')"
        @change="switchBackgroundColor">
      </el-switch>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="reset">{{ $t('ui.settings.reset') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  var defaultParameters = {
    clipNear: 0,
    clipFar: 100,
    fogNear: 50,
    fogFar: 100,
    backgroundColor: 'white',
    ambientIntensity: 0.2,
    lightIntensity: 1,
    cameraType: 'perspective'
  }

  export default {
    name: 'settings',
    data () {
      return {
        clipNear: 0,
        clipFar: 100,
        fogNear: 50,
        fogFar: 100,
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
      setClipNear (percentage) {
        this.setStageParameters({clipNear: percentage})
      },
      setFogNear (percentage) {
        this.setStageParameters({fogNear: percentage})
        if (this.$data.fogFar < percentage) {
          this.$data.fogFar = percentage + 1
          this.setStageParameters({fogFar: this.$data.fogFar})
        }
      },
      setFogFar (percentage) {
        this.setStageParameters({fogFar: percentage})
        if (this.$data.fogNear > percentage) {
          this.$data.fogNear = percentage - 1
          this.setStageParameters({fogNear: this.$data.fogNear})
        }
      },
      setStageParameters (params) {
        this.$store.dispatch('setStageParameters', params)
      },
      switchBackgroundColor (isWhite) {
        let color = (isWhite) ? 'white' : 'black'
        this.setStageParameters({backgroundColor: color})
      }
    }
  }
</script>

<style>
  .settings.el-form--label-top .el-form-item__label {
    padding: 0;
    font-weight: 500;
  }
  .settings .el-form-item {
    margin-bottom: 1em;
  }
  .settings.el-form {
    padding: 1em;
  }
</style>