<template>
  <div class="radio-button" 
    :class="{active: isActive, disabled: disabled}" 
    @click.stop="handlerClick"
    @mouseenter="handlerHover">
      <slot></slot>
      
      <div 
        class="split--button-trigger"
        @click.stop="toggleMenu"
        v-popover:splitList
      >
        <i class="el-icon-caret-bottom"></i>
      </div>
      <el-popover
        ref="splitList"
        placement="bottom"
        trigger="manual"
        v-model="isSplit">
        <slot name="list"></slot>
      </el-popover>
  </div>
</template>

<script>

export default {
  name: 'SplitButton',
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
      active: [],
      isSplit: false
    }
  },
  computed: {
    isActive () {
      return (this.$parent.active === this.value && !this.ungroup)
    }
  },
  methods: {
    toggleMenu (ev) {
      if (!this.disabled) this.isSplit = !this.isSplit
    },
    handlerClick (event) {
      if (!this.disabled) this.$parent.handlerActive(this.value)
      /* this.$emit('active', {
        value: this.value
      }) */
    },
    handlerHover (event) {
      if (this.disabled) this.$parent.handlerHover('none')
      else this.$parent.handlerHover(this.value)
    },
    forwardActive (val) {
      this.$parent.handlerActive(val)
      this.isSplit = false // close the menu
      console.log('forwardActive:', val)
    },
    forwardHover (event) {
      console.log('forwardHover:', event)
    }
  },
  watch: {
    isSplit: function (newValue, oldValue) {
      if (newValue === true) {
        this.$root.$on('click', this.toggleMenu)
      } else {
        this.$root.$off('click', this.toggleMenu)
      }
    }
  }
}

</script>

<style scoped>
  .radio-button {
    flex-basis: 9em;
    flex-grow: 1;
    line-height: 2em;
    border: solid #d1dbe5 1px;
    margin: 0 0 -1px -1px;
    padding: 0;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.3s cubic-bezier(.645,.045,.355,1);
    position: relative;
  }
  .split--button-trigger {
    padding: 0;
    font-size: 1rem;
    color: #8192a8;
    float: right;
    margin-right: 2px;
  }
  .split--buton-trigger:hover i::before {
    color: #20a0ff;
  }
  .active .split--button-trigger {
    color: white;
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
    z-index: 0;
  }
</style>
