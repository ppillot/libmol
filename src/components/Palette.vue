<template>
  <div class="vue-color__compact" @click="handlerClick">
    <ul class="vue-color__compact__colors">
      <li class="vue-color__compact__color-item" v-for="c in defaultColors"
        :class="{'vue-color__compact__color-item--white': c === '#FFFFFF' }"
        :style="{background: c}"
        :data-color="c">
      </li>
    </ul>
  </div>
</template>

<script>

const defaultColors = [
  '#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00',
  '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF',
  '#333333', '#808080', '#CCCCCC', '#D33115', '#E27300', '#FCC400',
  '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF',
  '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00',
  '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E'
]

export default {
  name: 'Palette',
  props: {
  },
  data () {
    return {
      defaultColors: defaultColors
    }
  },
  methods: {
    handlerClick (event) {
      if (event.target.tagName === 'LI') {
        this.$emit('color', {
          hex: event.target.dataset.color,
          source: 'hex'
        })
      }
    }
  }
}

</script>

<style lang="stylus">
.vue-color__compact
  width 28em
.vue-color__compact__colors
  overflow hidden
  padding 0
  margin 0
.vue-color__compact__color-item
  list-style none
  width 2em
  height 2em
  float left
  margin 2px
  position relative
  cursor pointer
.vue-color__compact__color-item--white
  box-shadow inset 0 0 0 1px #ddd
  .vue-color__compact__dot
      background #000
.vue-color__compact__dot
  position absolute
  top 5px
  right 5px
  bottom 5px
  left 5px
  border-radius 50%
  opacity 1
  background #fff
</style>
