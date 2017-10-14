<template>
    <div class="frame">
        <div id="commands-tab--commands">
            <select-mol></select-mol>
            <representation-mol></representation-mol>
            <color-mol></color-mol>
        </div>
        <div id="commands-tab--help">
            
           <help></help>
            
        </div>
    </div>
</template>

<script>
import SelectMol from './SelectMol'
import RepresentationMol from './RepresentationMol'
import ColorMol from './ColorMol'
import Help from './Help'
import Split from 'split.js'

export default {
  name: 'commandsTab',
  components: {
    SelectMol,
    RepresentationMol,
    ColorMol,
    Help
  },
  mounted: function () {
    Split([this.$el.children[0], this.$el.children[1]], {
      direction: 'vertical',
      cursor: 'ns-resize',
      sizes: [70, 30],
      minSize: [150, 150],
      gutterSize: 6
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .help {
        font-size: 1em;
    }
    .frame {
        flex: 1;
        overflow: hidden;
    }
    #commands-tab--commands {
        overflow-y: auto;
        padding-left: 1px;
    }
    #commands-tab--help {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }
    
</style>
<style>

    .help h3 {
        font-size: 0.95em;
        margin: 0 0.5em;
        font-weight: 500;
    }

    .gutter.gutter-vertical {
        background-color: #fff;
        /*border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;*/
        margin: 0 0 0 0;
        cursor: ns-resize;
        box-shadow: #e8e8e8 0px 1px 2px 0px;
        
    }
    .gutter.gutter-vertical:hover {
        background-color: #f8f8f8;
        transition: background-color 0.3s ease-in-out 0.1s;
        /* background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
        transition: background-image 0.5s ease-in-out 0.3s; */
        
    }
</style>
