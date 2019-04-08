<template>
  <i :class="[value ? 'icon-eye' : 'icon-eye-off']"
              @click.stop="handlerClick"></i>
</template>

<script>

export default {
  name: 'Visible',
  props: {
    value: Boolean
  },
  methods: {
    handlerClick () {
      this.$emit('input', !this.value)
    }
  }
}

</script>
