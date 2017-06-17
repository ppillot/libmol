<template>
  <div>
   <button-group :active-value="displayed" @change="overlay" v-if="compact">
        <radio-button :disabled="none" value="spacefill">{{ $t('ui.commands.representation.spacefill') }}</radio-button>
        <radio-button :disabled="none" value="ball+stick">{{ $t('ui.commands.representation.balls_and_sticks') }}</radio-button>
        <radio-button :disabled="none" ungroup v-on:click="hide">{{ $t('ui.commands.display.hide') }}</radio-button>
   </button-group>
   <form-item :label="$t('ui.commands.representation.label')" v-else>
      <button-group :active-value="displayed" @change="display" @hover="hover">
        <radio-button :disabled="none" value="spacefill">{{ $t('ui.commands.representation.spacefill') }}</radio-button>
        <radio-button :disabled="none" value="ball+stick">{{ $t('ui.commands.representation.balls_and_sticks') }}</radio-button>
        <radio-button :disabled="none" value="licorice">{{ $t('ui.commands.representation.sticks') }}</radio-button>
        <radio-button :disabled="nonPolymer || none" value="cartoon">{{ $t('ui.commands.representation.cartoon') }}</radio-button>
        <radio-button :disabled="nonPolymer || none" value="backbone">{{ $t('ui.commands.representation.backbone') }}</radio-button>
      </button-group>
   </form-item>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'

  export default {
    name: 'RepresentationMol',
    components: {
      FormItem,
      ButtonGroup,
      RadioButton
    },
    computed: {
      nonPolymer: function () {
        let sel = this.$store.state.selection
        let molTypes = this.$store.state.mol.molTypes
        return ((molTypes.nucleic === false && molTypes.protein === false) || sel === 'hetero' || sel === 'water' || sel === 'saccharide' || this.$store.state.mol.noSequence)
      },
      none: function () {
        return (this.$store.state.selection === 'none')
      },
      displayed: function () {
        return this.$store.state.display
      }
    },
    methods: {
      display (displayType) {
        if (this.$store.state.selection !== 'user') {
          this.$store.dispatch('display', {display: displayType})
        } else {
          // it could be a selection from the command line
          this.$store.dispatch('overlay', displayType)
        }
        this.help(displayType, true)
      },
      overlay (displayType) {
        this.$store.dispatch('overlay', displayType)
      },
      hide () {
        this.$store.dispatch('hide')
        this.help('hide', true)
      },
      show () {
        this.$store.dispatch('show')
        this.help('show', true)
      },
      hover (displayType) {
        this.help(displayType, false)
      },
      help (displayType, active) {
        this.$store.dispatch('help', {
          action: 'display',
          attribute: displayType,
          active: active
        })
      }
    },
    props: ['compact']
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
