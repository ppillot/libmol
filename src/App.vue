<template>
  <div id="app">
    <div class="full-height sidebar row-bg" v-if="isSidebarVisible" id="sidebar">
      <the-sidebar/>
    </div>
    <div class="full-height viewer" id="view">
      <the-toolbar/>
      <div style="height: 100%; display: flex; flex-direction: row;">
        <ngl/><molstar/>
      </div>
      <the-statusbar/>
    </div>
    <alert/>
  </div>
</template>

<script>
import TheSidebar from './components/TheSidebar'
import ngl from './components/NGLViewport'
import molstar from './components/MolstarViewport'
import TheToolbar from './components/TheToolbar'
import TheStatusbar from './components/TheStatusbar'
import Alert from './components/Alert'
import Split from 'split.js'

export default {
  name: 'App',
  components: {
    TheSidebar,
    ngl,
    molstar,
    TheToolbar,
    TheStatusbar,
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
  },
  mounted: function () {
    Split([this.$el.children[0], this.$el.children[1]], {
      sizes: [30, 70],
      minSize: 300,
      gutterSize: 4,
      elementStyle: function (dimension, size, gutterSize) {
        return {
          'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
        }
      },
      gutterStyle: function (dimension, gutterSize) {
        return {
          'flex-basis': gutterSize + 'px'
        }
      },
      onDragEnd: function () {
        this.$store.dispatch('resize')
      }.bind(this)
    })
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

  .gutter {
    background-repeat: no-repeat;
    background-position: 50%;
  }

  .gutter.gutter-horizontal {
    background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    cursor: ew-resize;
    background-color: #f9fafc;
  }

  .el-slider__runway {
    height: 4px;
  }

  .el-slider__bar {
    height: 4px;
    background-color: #20a0ff;
  }

  .el-slider__button {
    width: 11px;
    height: 11px;
    background-color: #20a0ff;
  }

  p {
    word-break: break-word;
  }
</style>
