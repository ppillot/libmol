<template>
  <el-row class="row-bg" id="app">
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
  </el-row>
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
  computed: {
    fullscreen: function () {
      if (this.$store.state.fullscreen) {
        let view = document.getElementById('view')
        Screenfull.request(view)
        return { width: '100%' }
      } else {
        Screenfull.exit()
        return {}
      }
    }
  }
}
</script>

<style>
  body {
    margin: 0;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    overflow: hidden;
  }
  
  #app {
    position: absolute;
    height: 100%;
    width: 100%;
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

</style>
