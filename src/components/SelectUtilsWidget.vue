<template>
<div>
  <button-group :active-value="selected" @change="sel" @hover="highlight">
      <radio-button value="all">{{ $t('ui.commands.select.all') }}</radio-button>
      <radio-button value="none">{{ $t('ui.commands.select.none') }}</radio-button>
      <radio-button value="invert">{{ $t('ui.commands.select.invert') }}</radio-button>
    </button-group>
</div>
</template>

<script>
import ButtonGroup from './ButtonGroup'
import RadioButton from './RadioButton'

export default {
  name: 'SelectUtilsWidget',
  components: {
    ButtonGroup,
    RadioButton
  },
  computed: {
    selected: function () {
      return this.$store.state.selection
    }
  },
  methods: {
    sel (selector) {
      this.$store.dispatch('selection', selector)
    },
    highlight (selector) {
      if (selector === undefined) selector = 'none'
      this.$store.dispatch('highlightSelectHovered', selector)
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
