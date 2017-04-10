<template>
  <div class="help" v-html="text">
  </div>
</template>

<script>
  import Marked from 'marked'
  
  export default {
    name: 'Help',
    computed: {
      text: function () {
        let helpKey = this.$store.state.help
        console.log(helpKey)
        return (this.$te('help.' + helpKey))
          ? Marked(this.$t('help.' + helpKey))
          : ''
      }
    },
    methods: {

    },
    watch: {

    }
  }
</script>

<style>
  
</style>
