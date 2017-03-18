<template>
  <div class="radio-button" 
    :class="{active: isActive, disabled: disabled}" 
    @click="handlerClick"
    @mouseenter="handlerHover">
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'RadioButton',
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    ungroup: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      active: []
    }
  },
  computed: {
    isActive () {
      return (this.$parent.active === this.value && !this.ungroup)
    }
  },
  methods: {
    handlerClick (event) {
      if (this.ungroup) {
        this.$emit('click')
        return
      }
      if (!this.disabled) this.$parent.handlerActive(this.value)
      /* this.$emit('active', {
        value: this.value
      }) */
    },
    handlerHover (event) {
      if (this.disabled) this.$parent.handlerHover('none')
      else this.$parent.handlerHover(this.value)
    }
  }
}

</script>

<style>
  .radio-button {
    flex-basis: 9em;
    flex-grow: 1;
    line-height: 2em;
    border: solid #d1dbe5 1px;
    margin: 0 0 -1px -1px;
    padding: 0;
    text-align: center;
    cursor: pointer;
  }
  .radio-button:hover {
    border-color: #20a0ff;
    z-index: 1;
  }
  .active {
    background: #20a0ff;
    color: white;
    border-color: #20a0ff;
    z-index: 1;
  }
  .disabled {
    background: #eef1f6;
    color: #c0cbd9;
    cursor: not-allowed;
    z-index: 0;
    border-color: #d1dbe5;
  }
  .disabled:hover {
    border-color: #d1dbe5;
  }
</style>
