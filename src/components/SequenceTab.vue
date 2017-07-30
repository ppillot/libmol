<template>
    <div class="container">
        {{ $t('ui.sequence_select_instructions') }}
        <sequence-widget class="sequence-widget" :active="active"></sequence-widget>
        <select-utils-widget class="select-utils-widget"></select-utils-widget>
        <representation-mol :compact="true"></representation-mol>
        <palette v-model="colors" :compact="true"></palette>
    </div>
</template>

<script>
  import Palette from './Palette'
  import RepresentationMol from './RepresentationMol'
  import SelectUtilsWidget from './SelectUtilsWidget'
  import SequenceWidget from './SequenceWidget'

  export default {
    name: 'SequenceTab',
    props: ['active'],
    computed: {
      colors: {
        set: function (val) {
          this.$store.dispatch('color', val)
        },
        get: function () {
          return {
            hex: `${this.$store.state.color}`
          }
        }
      }
    },
    components: {
      'palette': Palette,
      'representation-mol': RepresentationMol,
      'select-utils-widget': SelectUtilsWidget,
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
<style>
  
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

  .select-utils-widget {
    margin: 4px 0;
  }
</style>
