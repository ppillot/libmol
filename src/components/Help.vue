<template>
  <div class="help">
    {{ text }}
  </div>
</template>

<script>
  import Marked from 'marked'
  import help from './locales/fr/help'
  
  export default {
    name: 'Help',
    data () {
      return {
        colors: {hex: '#00ff00'}
      }
    },
    computed: {
      text: function () {
        return Marked(help.colorByChain)
      }
    },
    methods: {

    }
  }
</script>

<style scoped>
  div.radio-button-group {
    width: 100%
  }
  .radio-button {
    width: 33%
  }
</style>
