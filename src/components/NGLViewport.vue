<template>
  <div class="ngl full-height">
    <div class="full-height" id="viewport">
    </div>
    <tooltip/>
  </div>
</template>

<script>
import Tooltip from './Tooltip'

export default {
  name: 'ngl',
  components: {
    Tooltip
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
