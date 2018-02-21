<template>
  <div>
   <form-item :label="$t('ui.commands.display.label')">
      <button-group>
        <radio-button :disabled="none" ungroup v-on:click="hide">{{ $t('ui.commands.display.hide') }}</radio-button>
        <radio-button :disabled="none" ungroup v-on:click="show">{{ $t('ui.commands.display.show') }}</radio-button>
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
      none: function () {
        return (this.$store.state.selection === 'none')
      }
    },
    methods: {
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
          active: active,
          namespace: 'commands'
        })
      }
    },
    props: ['compact']
  }
</script>

<style scoped>
  div.el-button-group {
    width: 100%;
    margin-bottom: 1.2em;
  }
  .el-button {
    width: 33%
  }
</style>
