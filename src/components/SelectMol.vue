<template>
  <div>
   <form-item :label="$t('ui.commands.select.label')">
    <button-group :active-value="selected" @change="sel" @hover="highlight">
      <radio-button value="all">{{ $t('ui.commands.select.all') }}</radio-button>
      <radio-button value="protein" :disabled="unselectables.protein">{{ $t('ui.commands.select.protein') }}</radio-button>
      <radio-button value="nucleic" :disabled="unselectables.nucleic">{{ $t('ui.commands.select.nucleic') }}</radio-button>
      <radio-button value="saccharide" :disabled="unselectables.saccharide">{{ $t('ui.commands.select.carbohydrate') }}</radio-button>
      <radio-button value="water" :disabled="unselectables.water">{{ $t('ui.commands.select.water') }}</radio-button>
      <radio-button value="hetero" :disabled="unselectables.hetero">{{ $t('ui.commands.select.hetero') }}</radio-button>
    </button-group>
   </form-item>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'
  function fixHetero (val) {
    return (val.indexOf('hetero') > -1) ? val.replace('hetero', 'hetero and not (water or saccharide)') : val
  }
  export default {
    name: 'SelectMol',
    components: {
      FormItem,
      ButtonGroup,
      RadioButton
    },
    computed: {
      unselectables: function () {
        let absent = {}
        for (let item in this.$store.state.mol.molTypes) {
          if (this.$store.state.mol.molTypes.hasOwnProperty(item)) {
            absent[item] = !this.$store.state.mol.molTypes[item]
          }
        }
        return absent
      },
      selected: function () {
        return this.$store.state.selection
      }
    },
    methods: {
      sel (selector) {
        this.$store.dispatch('selection', fixHetero(selector))
        this.help(selector, true)
      },
      highlight (selector) {
        this.help(selector, false)
        if (selector === undefined) selector = 'none'
        this.$store.dispatch('highlightSelectHovered', fixHetero(selector))
      },
      help (selector, active) {
        this.$store.dispatch('help', {
          action: 'select',
          attribute: selector,
          active: active
        })
      }
    }
  }
</script>

<style scoped>
  div.el-button-group {
    width: 100%
  }
  .el-button {
    width: 33%
  }
</style>
