<template>
    <div class="toolbar">
        <citation-button/>
        
        <div class="molname">{{ molName }}</div>
        <div class="commands">
          
          
          <el-popover
            ref="settings"
            placement="bottom-end"
            width="400"
            trigger="click">
            <settings></settings>
          </el-popover>
          <el-popover
            ref="measures"
            placement="bottom-end"
            width="400"
            trigger="click">
            <measures-panel></measures-panel>
          </el-popover>
          
          <el-button v-popover:measures class="button" type="text" size="medium">
            {{ $t('ui.toolbar.measures.button') }}
          </el-button>
          <el-button class="button large" type="text" @click="screenCapture">
            <i class="icon-camera"></i>
          </el-button>
          <el-button class="button large" type="text" @click="toggleFullscreen" v-if="isFullscreenEnabled">
            <i :class="[isFullScreen ? 'icon-resize-small' : 'icon-resize-full']"></i>
          </el-button>
          <el-button v-popover:settings icon="icon-sliders" class="button large" type="text"></el-button>
        </div>
    </div>
</template>

<script>
  import citationButton from './CitationButton'
  import settings from './Settings'
  import measuresPanel from './MeasuresPanel'
  import Screenfull from 'screenfull'

  export default {
    name: 'theToolbar',
    components: {
      settings,
      measuresPanel,
      citationButton
    },
    data: function () {
      return {
        isFullScreen: false,
        isCitationVisible: false
      }
    },
    computed: {
      isFullscreenEnabled: function () {
        return Screenfull.enabled
      },
      molName: function () {
        return this.$store.state.name
      },
      isHidden: function () {
        return this.$store.state.isHidden
      },
      molCode: function () {
        return this.$store.state.molCode
      }
    },
    methods: {
      toggleFullscreen () {
        Screenfull.toggle()
      },
      screenCapture () {
        this.$store.dispatch('screenCapture')
      }
    },
    mounted: function () {
      if (Screenfull.enabled) {
        Screenfull.onchange(function () { // user can use ESC key to cancel fullscreen
          if (this.$store.state.fullscreen && Screenfull.isFullscreen === false) {
            this.$store.commit('setFullscreen', false)
          } else {
            this.$store.commit('setFullscreen', Screenfull.isFullscreen)
          }
          this.isFullScreen = Screenfull.isFullscreen
        }.bind(this))
      }
    }
  }
</script>

<style>
  .button.large {
    font-size: 16px;
  }
  .toolbar {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    /* z-index must be superior to statusbar z-index (2) so that modal from
    toolbar is displayed on top of both toolbar and statusbar */
    z-index: 3;
    background: rgba(249, 250, 252, 0.95);
    vertical-align: middle;
    display: flex;
    flex-direction: row;
    max-height: 2em;
    padding: 0.2em;
    transition: max-height 0.6s;
    align-items: center;
  } 

  .molname {
    flex: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
        overflow: hidden;
  }

  .molname:hover {
    white-space: normal;
  }

  .toolbar:hover {
    max-height: none;
    transition: max-height 0.6s;
  }

  .button {
    margin: 0 0.2em;
    padding: 0;
    color: #88a9d4;
  }

  .warning {
    color: orangered;
  }
  
  .commands {
    margin-right: 0.5em;
  }

</style>
