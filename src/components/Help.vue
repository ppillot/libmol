<template>
  <div>
    <hr class="shadow">
    <div class="help" v-html="text">
    </div>
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
  .shadow {
    border-top: solid 1px #eee;
    border-bottom: none;
    /* box-shadow: #bbb 0px 4px 10px; */
    margin: 8px 0 0 0;
  }
  .help {
    flex: 1;
    overflow-y: auto;
    font-size: 0.9em;
  }
  .help h1 {
    font-size: 1.1em;
    margin: 0.3em 0;
  }
  .help p {
    margin-top: 0.3em;
  }
  .help a {
    background: #EFF2F7;
    color: #20A0FF;
    text-decoration-style: dotted;
    text-decoration-line: underline;
  }
  .help a:hover {
    text-decoration-line: none;
    background: none;
  }
</style>
