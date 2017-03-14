<template>
  <div>
   <form-item :label="$t('ui.commands.display.label')">
      <button-group :active-value="displayed" @change="display">
        <radio-button value="spacefill">{{ $t('ui.commands.display.spacefill') }}</radio-button>
        <radio-button value="ball+stick">{{ $t('ui.commands.display.balls_and_sticks') }}</radio-button>
        <radio-button value="licorice">{{ $t('ui.commands.display.sticks') }}</radio-button>
        <radio-button :disabled="nonPolymer" value="cartoon">{{ $t('ui.commands.display.cartoon') }}</radio-button>
        <radio-button :disabled="nonPolymer" value="tube">{{ $t('ui.commands.display.backbone') }}</radio-button>
        <radio-button ungroup v-on:click="hide">{{ $t('ui.commands.display.hide') }}</radio-button>
      </button-group>
   </form-item>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'

  export default {
    name: 'DisplayMol',
    components: {
      FormItem,
      ButtonGroup,
      RadioButton
    },
    computed: {
      nonPolymer: function () {
        let sel = this.$store.state.selection
        return (sel === 'hetero and not water' || sel === 'water' || sel === 'saccharide')
      },
      displayed: function () {
        return this.$store.state.display
      }
    },
    methods: {
      display (displayType) {
        this.$store.dispatch('display', displayType)
      },
      hide () {
        this.$store.dispatch('hide')
      }
    },
    props: {
      // wether we display the full component or not
      complete: {
        type: Boolean,
        default: true,
        required: false
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
