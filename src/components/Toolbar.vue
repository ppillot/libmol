<template>
    <div class="toolbar">
        <span>{{ molName }}</span>
        <el-popover
          ref="settings"
          placement="bottom-end"
          width="400"
          trigger="click">
          <settings></settings>
        </el-popover>

        <el-button icon="d-caret" class="button" type="text" size="large" @click="toggleFullscreen"></el-button>>
        <el-button v-popover:settings icon="setting" class="button" type="text" size="large"></el-button>
    </div>
</template>

<script>
  import settings from './Settings'

  export default {
    name: 'toolbar',
    components: {
      settings
    },
    computed: {
      molName: function () {
        return this.$store.state.name
      }
    },
    methods: {
      toggleFullscreen () {
        this.$store.dispatch('toggleFullscreen')
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