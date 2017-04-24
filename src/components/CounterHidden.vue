<template>
    <div class="counter" 
      @mouseenter="highlight(true)" 
      @mouseleave="highlight(false)"
      v-if="percentHidden > 0">
      <template v-if="percentHidden < 100">
        <div class="scale-label">{{ (hover) ? Math.floor(percentHidden) + ' %' : $t('ui.statusbar.counter.mask') }}</div>
        <div v-scale:value="percentHidden" class="scale alert">
          <div></div>
        </div>
      </template>
      <div class="alert" v-else>
        <i class="el-icon-warning"></i> {{ $t('ui.statusbar.counter.all-hidden')}}
      </div>
    </div>
</template>

<script>

  export default {
    name: 'counter',
    data () {
      return {
        hover: false
      }
    },
    computed: {
      percentHidden: function () {
        return this.$store.state.hiddenPercentage
      }
    },
    directives: {
      scale: {
        bind (el, binding, vnode) {
          el.children[0].style.width = binding.value + '%'
        },
        update (el, binding, vnode) {
          el.children[0].style.width = binding.value + '%'
        }
      }
    },
    methods: {
      highlight (val) {
        this.hover = val
        this.$store.dispatch('highlightSelectHovered', (val) ? 'hidden' : 'none')
      }
    }
  }
</script>

<style>
  .counter {
    min-width: 100px;
    padding: 0 1em;
  }
  .scale-label {
    font-size: 12px;
    width: 100%;
    text-align: center;
    cursor: default;
  }
  .scale {
    width: 100%;
    height: 6px;
    background-color: #e5e9f2;
    border-radius: 10px;
  }
  .scale.alert div {
    height: 100%;
    background-color: #f7ba2a; /*#20a0ff;*/
    border-radius: 100px;
  }
  .counter .alert {
    color: #ff4949;
  }
</style>
