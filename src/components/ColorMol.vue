<template>
  <form-item :label="$t('ui.commands.color.label')">
    <button-group :active-value="colored" @change="color" @hover="hover">
        <radio-button :disabled="none" value="element">{{ $t('ui.commands.color.cpk') }}</radio-button>
        <radio-button :disabled="nonPolymer || none" value="chainname">{{ $t('ui.commands.color.by_chain') }}</radio-button>
        <radio-button :disabled="nonPolymer || none" value="resname">{{ $t('ui.commands.color.by_res') }}</radio-button>
    <el-popover
      ref="palette"
      placement="right"
      trigger="click">
      <palette v-model="colors" @color="pickColor"></palette>
    </el-popover>
        <radio-button :disabled="noSStruc || none" value="sstruc">{{ $t('ui.commands.color.by_secondary_structure') }}</radio-button>
        <radio-button :disabled="notAll || none" value="moleculetype">{{ $t('ui.commands.color.by_biochemical_nature') }}</radio-button>
        <radio-button :disabled="none" ungroup value="palette" v-popover:palette>{{ $t('ui.commands.color.pick_color') }}</radio-button>
    </button-group>
  </form-item>
</template>

<script>
  import Palette from './Palette'
  import FormItem from './FormItem'
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'

  export default {
    name: 'ColorMol',
    data () {
      return {
        colors: {hex: '#00ff00'}
      }
    },
    components: {
      'palette': Palette,
      FormItem,
      ButtonGroup,
      RadioButton
    },
    computed: {
      nonPolymer: function () {
        let sel = this.$store.state.selection
        return (sel === 'hetero' || sel === 'water' || sel === 'saccharide')
      },
      noSStruc: function () {
        return (this.$store.state.selection !== 'protein' || (this.$store.state.display !== 'cartoon' && this.$store.state.display !== 'backbone'))
      },
      notAll: function () {
        return (this.$store.state.selection !== 'all')
      },
      none: function () {
        return (this.$store.state.selection === 'none')
      },
      colored: function () {
        return this.$store.state.color
      }
    },
    methods: {
      color (colorScheme) {
        this.$store.dispatch('color', colorScheme)
        this.help(colorScheme, true)
      },
      pickColor (val) {
        this.$store.dispatch('color', val.hex)
        this.help('palette', true)
      },
      hover (colorScheme) {
        this.help(colorScheme, false)
      },
      help (colorScheme, active) {
        this.$store.dispatch('help', {
          action: 'color',
          attribute: colorScheme,
          active: active
        })
      }
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
