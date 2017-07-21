<template>
  <div id="app">
    <div class="full-height sidebar row-bg" v-if="isSidebarVisible">
      <sidebar></sidebar>
    </div>
    <div class="full-height viewer" id="view">
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
  computed: {
    /**
     * The side bar is hidden when the viewer is embedded into another webpage
     * Except if the viewer is in fullscreen mode (in the later case, the sidebar
     * is always visible)
     */
    isSidebarVisible: function () {
      if (this.$store.state.fullscreen) {
        return true
      } else {
        return (!this.$store.state.embedded)
      }
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
    min-width: 300px;
    width: 30%;
    flex: none;
  }

</style>
