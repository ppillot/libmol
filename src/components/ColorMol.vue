<template>
  <form-item :label="$t('ui.commands.color.label')">
    <el-popover
      ref="palette"
      placement="right"
      trigger="click">
      <palette :value="colors" @color="pickColor"></palette>
    </el-popover>
    <button-group :active-value="colored" @change="changeColor" @hover="hover">
        <radio-button :disabled="none" value="element">{{ $t('ui.commands.color.cpk') }}</radio-button>
        <radio-button :disabled="nonPolymer || none" value="chainname">{{ $t('ui.commands.color.by_chain') }}</radio-button>
        <split-button :disabled="nonPolymer || none" value="resname">
          {{ $t('ui.commands.color.by_res') }}
          <split-button-item default value="resname" slot="list">
            {{ $t('ui.commands.color.by_res') }}
          </split-button-item>
          <split-button-item default value="residueindex" slot="list">
            {{ $t('ui.commands.color.resindex') }}
          </split-button-item>
          <split-button-item default value="sidechain" slot="list">
            {{ $t('ui.commands.color.sidechain') }}
          </split-button-item>
        </split-button>
        <radio-button :disabled="noSStruc || none" value="sstruc">{{ $t('ui.commands.color.by_secondary_structure') }}</radio-button>
        <radio-button :disabled="notAll || none" value="moleculetype">{{ $t('ui.commands.color.by_biochemical_nature') }}</radio-button>
        <radio-button :disabled="none" value="palette" v-popover:palette>{{ $t('ui.commands.color.pick_color') }}</radio-button>
    </button-group>
  </form-item>
</template>

<script>
import Palette from './Palette'
import FormItem from './FormItem'
import ButtonGroup from './ButtonGroup'
import RadioButton from './RadioButton'
import SplitButton from './SplitButton'
import SplitButtonItem from './SplitButtonItem'

export default {
  name: 'ColorMol',
  components: {
    'palette': Palette,
    FormItem,
    ButtonGroup,
    RadioButton,
    SplitButton,
    SplitButtonItem
  },
  computed: {
    nonPolymer: function () {
      let sel = this.$store.state.selection
      if (sel === 'hetero' || sel === 'water' || sel === 'saccharide') return true
      if (sel === 'all' &&
        this.$store.state.mol.chains.length === 1 &&
        this.$store.state.mol.chains[0].sequence.length === 1
      ) return true
      return false
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
    colors: function () {
      return this.$store.state.color
    },
    colored: function () {
      if (this.colors.indexOf('#') === -1) {
        return this.colors
      } else {
        return 'palette'
      }
    }
  },
  methods: {
    changeColor (colorScheme) {
      if (colorScheme !== 'palette') this.$store.dispatch('color', colorScheme)
      this.help(colorScheme, true)
    },
    pickColor (val) {
      if (val !== 'palette') this.$store.dispatch('color', val)
      this.help('palette', true)
    },
    hover (colorScheme) {
      this.help(colorScheme, false)
    },
    help (colorScheme, active) {
      this.$store.dispatch('help', {
        action: 'color',
        attribute: colorScheme,
        active: active,
        namespace: 'commands'
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
