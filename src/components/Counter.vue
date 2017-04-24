<template>
    <div class="counter" @mouseenter="highlight(true)" @mouseleave="highlight(false)">
      <template v-if="percentSelection > 0">
        <div class="scale-label">{{ $t('ui.statusbar.counter.selection') }}</div>
        <div v-scale:value="percentSelection" class="scale">
          <div></div>
        </div>
      </template>
      <div class="alert" v-else>
        <i class="el-icon-warning"></i> {{ $t('ui.statusbar.counter.no-selection')}}
      </div>
    </div>
</template>

<script>

  export default {
    name: 'counter',
    data () {
      return {
        tooltipStyles: {
          top: '0px',
          left: '0px',
          visibility: 'hidden'
        },
        tooltipText: ''
      }
    },
    computed: {
      percentSelection: function () {
        return this.$store.state.selectedPercentage
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
        this.$store.dispatch('highlightSelectHovered', (val) ? undefined : 'none')
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
  .scale div {
    height: 100%;
    background-color: #20A0FF; /*#20a0ff;*/
    border-radius: 100px;
  }
  .counter .alert {
    color: #ff4949;
  }
</style>
