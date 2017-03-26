<template>
    <div class="toolbar">
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
            ref="warninghidden"
            placement="bottom-end"
            width="400"
            trigger="click">
            <span>Some atoms are not currently displayed</span>
          </el-popover>
          <el-button v-show="isHidden" v-popover:warninghidden icon="warning" class="button warning" type="text" size="large"></el-button>
          <el-popover
            ref="distance"
            placement="bottom-end"
            width="400"
            trigger="click">
            <distance></distance>
          </el-popover>
          <el-button v-popover:distance class="button" type="text" size="small">
            {{ $t('ui.toolbar.distance.button') }}
          </el-button>
          <el-button icon="picture" class="button" type="text" size="large" @click="screenCapture"></el-button>
          <el-button icon="d-caret" class="button" type="text" size="large" @click="toggleFullscreen"></el-button>
          <el-button v-popover:settings icon="setting" class="button" type="text" size="large"></el-button>
        </div>
    </div>
</template>

<script>
  import settings from './Settings'
  import distance from './Distance'

  export default {
    name: 'toolbar',
    components: {
      settings,
      distance
    },
    computed: {
      molName: function () {
        return this.$store.state.name
      },
      isHidden: function () {
        return this.$store.state.isHidden
      }
    },
    methods: {
      toggleFullscreen () {
        this.$store.dispatch('toggleFullscreen')
      },
      screenCapture () {
        this.$store.dispatch('screenCapture')
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
    display: flex;
    flex-direction: row;
    max-height: 2em;
    padding: 0.2em;
    transition: max-height 0.6s;
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
  
</style>
