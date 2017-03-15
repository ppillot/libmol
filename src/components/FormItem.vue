<template>
  <div class="form-item">
    <label> {{ label }}
      <div class="form-item-slot">
        <slot>
        </slot>
      </div>
    </label>
  </div>
</template>

<script>

export default {
  name: 'FormItem',
  props: {
    label: {
      type: String,
      required: true
    }
  }
}

</script>

<style lang="stylus">
.form-item
  margin-bottom: 22px
  label
    font-size 14px
    color #48576a
    line-height 1
    display block
.form-item-slot
  margin-top 8px
</style>
