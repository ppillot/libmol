<template>
    <div class="container">
        {{ $t('ui.sequence_select_instructions') }}
        <sequence-widget class="sequence-widget"></sequence-widget>
        <display-mol v-bind:complete="false"></display-mol>
        <compact-picker v-model="colors" @change-color="pickColor"></compact-picker>
    </div>
</template>

<script>
  import {
    Compact
  } from 'vue-color'
  import DisplayMol from './DisplayMol'
  import SequenceWidget from './SequenceWidget'

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
      'display-mol': DisplayMol,
      'sequence-widget': SequenceWidget
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
    border: 1px solid #d3dce6;
  }

</style>