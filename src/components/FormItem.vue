<template>
  <div class="form-item">
    <label> {{ label }}
      <div class="form-item-slot" :style="display">
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
    },
    inline: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    display () {
      return (this.inline)
        ? {display: 'inline-block', verticalAlign: 'text-bottom'}
        : {display: 'block'}
    }
  }
}

</script>

<style>
.form-item {
  margin-bottom: 22px;
}
.form-item label {
  font-size: 14px;
  color: #48576a;
  line-height: 1;
  display: block;
}
    
.form-item-slot {
  margin-top: 8px
}
</style>
