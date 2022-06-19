<template>
  <div class="ngl full-height">
    <div class="full-height" id="molstar__ctnr">
        <canvas id="molstar__canvas" style="position: absolute; top:0; bottom: 0; left: 0; right: 0"></canvas>
    </div>
    <tooltip/>
    <entity-context-menu :showContextMenu="displayContextMenu" @hide="hideContextMenu" :target="contextMenuPos"/>
  </div>
</template>

<script>
import Tooltip from './Tooltip'
import EntityContextMenu from './EntityContextMenu'
import { init } from '../utils/molstar'

export default {
  name: 'Molstar',
  components: {
    Tooltip,
    EntityContextMenu
  },
  computed: {
    displayContextMenu: function () {
      return this.$store.state.isContextMenuCalled
    },
    contextMenuPos: function () {
      return this.$store.state.contextMenuPos
    }
  },
  methods: {
    hideContextMenu: function () {
      this.$store.commit('isContextMenuCalled', { show: false })
    }
  },
  mounted () {
    this.$nextTick(function () {
      init('molstar__canvas', 'molstar__ctnr')
    })
  }
}
</script>

<style scoped>
  .ngl {
    overflow: hidden;
    flex: 1 1 0;
  }
</style>
