<template>
    <div class="toolbar">
        <span>{{ molName }}</span>
        <el-popover
          ref="settings"
          placement="bottom-end"
          width="400"
          trigger="click">
          <div>
            <!-- <span class="demonstration">Position du plan de coupe avant</span> -->
            <el-slider v-model="clipNear" @change="setClipNear"></el-slider>  
          </div>
          <el-switch
            v-model="color"
            on-color="#ddd"
            off-color="black"
            on-text="blanc"
            off-text="noir"
            @change="switchBackgroundColor">
          </el-switch>
          <el-button @click="reset">Réinitialiser</el-button>
        </el-popover>

        <el-button v-popover:settings icon="setting" class="button" type="text" size="large"></el-button>
    </div>
</template>

<script>
  // import * as NGL from 'ngl'
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
    name: 'toolbar',
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
    computed: {
      molName: function () {
        return this.$store.state.name
      } /* ,
      clipNear: function () {
        return this.$store.state.stage.clipNear
      } */
    },
    methods: {
      reset () {
        Object.assign(this.$data, defaultParameters, {color: true})
        this.setStageParameters(defaultParameters)
      },
      setClipNear (percentage) {
        this.setStageParameters({clipNear: percentage})
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
  .toolbar {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    background: rgba(249, 250, 252, 0.95);
    vertical-align: middle;
  }

  .toolbar span {
    font-size: 1.5em
  }

  .button {
    float: right;
    margin: 4px;
  }
</style>