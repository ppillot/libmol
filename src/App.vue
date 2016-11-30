<template>
  <el-row class="row-bg" id="app">
    <el-col :span="8" class="full-height">
      <div class="grid-content full-height">
        <sidebar></sidebar>
      </div>
    </el-col>
    <el-col :span="16" class="full-height">
      <div class="grid-content bg-purple full-height">
        <ngl></ngl>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import Sidebar from './components/Sidebar'
import ngl from './components/NGLViewport'
import SearchLibmol from './components/Searchlibmol'

export default {
  name: 'app',
  components: {
    Sidebar,
    ngl,
    SearchLibmol
  }
}
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    position: absolute;
    height: 100%;
    width: 100%;
  }
  
  .el-row {
    margin-bottom: 20px;
  }
  
  .el-col {
    border-radius: 4px;
  }
  
  .bg-purple-dark {
    background: #99a9bf;
  }
  
  .bg-purple {
    background: #d3dce6;
  }
  
  .bg-purple-light {
    background: #e5e9f2;
  }
  
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
  
  .full-height {
    position: relative;
    height: 100%;
  }
</style>