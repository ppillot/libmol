<template>
  <div class="split-button--item" 
    @click="handlerClick"
    @mouseenter="handlerHover">
    <slot/>
  </div>
</template>

<script>

export default {
  name: 'SplitButtonItem',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      active: [],
      isSplit: false
    }
  },
  computed: {
    isActive () {
      return (this.$parent.active === this.value)
    }
  },
  methods: {
    handlerClick (event) {
      this.$parent.$parent.forwardActive(this.value)
    },
    handlerHover (event) {
      this.$parent.$parent.forwardHover(this.value)
    }
  }
}

</script>

<style scoped>
  .split-button--item {
    display: block;
    font-size: 1em;
    color: #8192a8;
    margin-bottom: 4px;
    padding: 2px 1em;
    cursor: pointer;
  }
  .split-button--item:hover {
    background: #f0f2f7;
    color: #00a0ff;
    border-radius: 2px;
  }
</style>
