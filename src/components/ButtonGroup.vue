<template>
  <div class="button-group">
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'ButtonGroup',
  props: {
    activeValue: {
      default: '',
      type: String
    }
  },
  data () {
    return {
    }
  },
  computed: {
    active () {
      // console.log(this)
      return this.$props.activeValue
    }
  },
  methods: {
    handlerActive (val) {
      this.$emit('change', val)
    }
  }
}

</script>

<style>
.button-group {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
</style>
