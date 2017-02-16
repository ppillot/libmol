<template>
    <div class="container">
        {{ $t('ui.sequence_select_instructions') }}
        <sequence-widget class="sequence-widget" :active="active"></sequence-widget>
        <display-mol v-bind:complete="false"></display-mol>
        <palette v-model="colors" @color="pickColor"></palette>
    </div>
</template>

<script>
  import Palette from './Palette'
  import DisplayMol from './DisplayMol'
  import SequenceWidget from './SequenceWidget'

  export default {
    name: 'SequenceTab',
    props: ['active'],
    data () {
      return {
        colors: {
          hex: '#00ff00'
        }
      }
    },
    components: {
      'palette': Palette,
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
    max-height: 100%;
  }

  .sequence-widget {
    flex: 1;
    border: 1px solid #d3dce6;
  }

</style>
