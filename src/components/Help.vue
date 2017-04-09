<template>
  <div class="help" v-html="text">
  </div>
</template>

<script>
  import Marked from 'marked'
  
  export default {
    name: 'Help',
    data () {
      return {
        colors: {hex: '#00ff00'}
      }
    },
    computed: {
      text: function () {
        console.log(this)
        return Marked(this.$t('help.colorBychain'))
      }
    },
    methods: {

    }
  }
</script>

<style>
  
</style>
