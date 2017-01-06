<template>
    <div class="ngl full-height" id="viewport">
    </div>
</template>

<script>
// import * as NGL from 'ngl'

export default {
  name: 'ngl',
  mounted () {
    this.$store.dispatch('createNewStage', {id: 'viewport'})
  }
}
</script>