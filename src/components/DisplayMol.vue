<template>
  <div>
   <button-group :active-value="displayed" @change="overlay" v-if="compact">
        <radio-button :disabled="none" value="spacefill">{{ $t('ui.commands.display.spacefill') }}</radio-button>
        <radio-button :disabled="none" value="ball+stick">{{ $t('ui.commands.display.balls_and_sticks') }}</radio-button>
        <radio-button :disabled="none" ungroup v-on:click="hide">{{ $t('ui.commands.display.hide') }}</radio-button>
   </button-group>
   <form-item :label="$t('ui.commands.display.label')" v-else>
      <button-group :active-value="displayed" @change="display" @hover="hover">
        <radio-button :disabled="none" value="spacefill">{{ $t('ui.commands.display.spacefill') }}</radio-button>
        <radio-button :disabled="none" value="ball+stick">{{ $t('ui.commands.display.balls_and_sticks') }}</radio-button>
        <radio-button :disabled="none" value="licorice">{{ $t('ui.commands.display.sticks') }}</radio-button>
        <radio-button :disabled="nonPolymer || none" value="cartoon">{{ $t('ui.commands.display.cartoon') }}</radio-button>
        <radio-button :disabled="nonPolymer || none" value="backbone">{{ $t('ui.commands.display.backbone') }}</radio-button>
        <radio-button :disabled="none" ungroup v-on:click="hide">{{ $t('ui.commands.display.hide') }}</radio-button>
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
      none: function () {
        return (this.$store.state.selection === 'none')
      },
      displayed: function () {
        return this.$store.state.display
      }
    },
    methods: {
      display (displayType) {
        this.$store.dispatch('display', displayType)
        this.help(displayType, true)
      },
      overlay (displayType) {
        this.$store.dispatch('overlay', displayType)
      },
      hide () {
        this.$store.dispatch('hide')
        this.help('hide', true)
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
