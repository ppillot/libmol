<template>
  <div class="ngl full-height">
    <div class="full-height" id="viewport">
    </div>
    <tooltip/>
    <entity-context-menu :showContextMenu="displayContextMenu" @hide="hideContextMenu" :target="contextMenuPos"/>
  </div>
</template>

<script>
import Tooltip from './Tooltip'
import EntityContextMenu from './EntityContextMenu'

export default {
  name: 'ngl',
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
      this.$store.commit('isContextMenuCalled', {show: false})
    }
  },
  mounted () {
    this.$nextTick(function () {
      this.$store.dispatch('createNewStage', {id: 'viewport'})
    })
  }
}
</script>

<style>
  .ngl {
    overflow: hidden;
  }
</style>
