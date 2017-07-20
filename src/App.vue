<template>
  <div id="app">
    <div class="full-height sidebar row-bg">
      <sidebar></sidebar>
    </div>
    <div class="full-height viewer" id="view" :style="fullscreen">
      <toolbar></toolbar>
      <ngl></ngl>
      <statusbar></statusbar>
    </div>
    <alert></alert>
  </div>
  <!-- <el-row class="row-bg" id="app">
    <el-col :span="8" class="full-height">
      <div class="grid-content full-height">
        <sidebar></sidebar>
      </div>
    </el-col>
    <el-col :span="16" class="full-height" id="view" :style="fullscreen">
        <toolbar></toolbar>
        <ngl></ngl>
        <statusbar></statusbar>
    </el-col>
    <alert></alert>
  </el-row> -->
</template>

<script>
import Sidebar from './components/Sidebar'
import ngl from './components/NGLViewport'
import SearchLibmol from './components/Searchlibmol'
import Toolbar from './components/Toolbar'
import Statusbar from './components/Statusbar'
import Alert from './components/Alert'
import Screenfull from 'screenfull'

export default {
  name: 'app',
  components: {
    Sidebar,
    ngl,
    SearchLibmol,
    Toolbar,
    Statusbar,
    Alert
  },
  data: function () {
    return {
      fullscreen: {}
    }
  },
  /* computed: {
    fullscreen: function () {
      if (this.$store.state.fullscreen) {
        let view = document.getElementById('view')
        Screenfull.request(view)
        return { width: '100%' }
      } else {
        if (Screenfull.enabled) Screenfull.exit()
        return {}
      }
    }
  }, */
  mounted: function () {
    if (Screenfull.enabled) {
      Screenfull.onchange(() => { // user can use ESC key to cancel fullscreen
        this.fullscreen = (Screenfull.isFullscreen === false) ? {} : { width: '100%' }
      })
    }
  }
}
</script>

<style>
  html, body {
    height: 100%;
    width: 100%;
  }
  body {
    margin: 0;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    overflow: hidden;
    user-select: none;
    -moz-user-select: none;
    cursor: default;
  }
  
  #app {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
  }

  #view {
    flex: 1;
    overflow-x: hidden;
  }
  
  .el-col {
    border-radius: 4px;
  }
  
  .bg-purple {
    background: #d3dce6;
  }
    
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  
  .row-bg {
    /* padding: 10px 0; */
    background-color: #f9fafc;
  }
  
  .full-height {
    position: relative;
    height: 100%;
  }

  .sidebar {
    max-width: 500px;
    width: 30%;
    flex: none;
  }

</style>
