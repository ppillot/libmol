<template>
    <div class="container">
        Sélectionner à partir des séquences des différentes chaînes
        <div class="sequence-widget"></div>
        <display-mol v-bind:complete="false"></display-mol>
        <compact-picker v-model="colors" @change-color="pickColor"></compact-picker>
    </div>
</template>

<script>
  import {
    Compact
  } from 'vue-color'
  import DisplayMol from './DisplayMol'

  export default {
    name: 'SequenceTab',
    data () {
      return {
        colors: {
          hex: '#00ff00'
        }
      }
    },
    components: {
      'compact-picker': Compact,
      'display-mol': DisplayMol
    },
    methods: {
      pickColor (val) {
        this.$store.dispatch('color', val.hex)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h3 {
    font-weight: normal;
  }

  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .sequence-widget {
    flex: 1;
    border: solid 1px #eee;
  }

</style>