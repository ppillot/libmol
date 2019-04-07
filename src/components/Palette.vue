<template>
  <div class="vue-color__compact" @click="handlerClick">
    <ul class="vue-color__compact__colors" :class="{'compact__ul': compact}">
      <li
        class="vue-color__compact__color-item"
        v-for="c in colorList"
        :class="{'vue-color__compact__color-item--white': c === '#FFFFFF'}"
        :style="{background: c}"
        :data-color="c"
        :key="c"
      >
        <span class="vue-color__compact__dot" v-if="c === value.toUpperCase()"></span>
      </li>
    </ul>
  </div>
</template>

<script>
const defaultColors = [
  '#4D4D4D',
  '#999999',
  '#FFFFFF',
  '#F44E3B',
  '#FE9200',
  '#FCDC00',
  '#DBDF00',
  '#A4DD00',
  '#68CCCA',
  '#73D8FF',
  '#AEA1FF',
  '#FDA1FF',
  '#333333',
  '#808080',
  '#CCCCCC',
  '#D33115',
  '#E27300',
  '#FCC400',
  '#B0BC00',
  '#68BC00',
  '#16A5A5',
  '#009CE0',
  '#7B64FF',
  '#FA28FF',
  '#000000',
  '#666666',
  '#B3B3B3',
  '#9F0500',
  '#C45100',
  '#FB9E00',
  '#808900',
  '#194D33',
  '#0C797D',
  '#0062B1',
  '#653294',
  '#AB149E'
]

export default {
  name: 'Palette',
  props: ['compact', 'value'],
  data () {
    return {
      defaultColors: defaultColors
    }
  },
  computed: {
    colorList: function () {
      return this.$props.compact === true
        ? defaultColors.filter((color, index) => {
          return index < 12
        })
        : defaultColors
    }
  },
  methods: {
    handlerClick (event) {
      if (event.target.tagName === 'LI') {
        this.$emit('color', event.target.dataset.color)
        this.$emit('input', event.target.dataset.color)
      }
    }
  }
}
</script>

<style lang="scss">
.vue-color__compact {
  max-width: 28em;
  min-width: 100%;
}

.vue-color__compact__colors {
  overflow: hidden;
  padding: 0;
  margin: 0;
}
.el-popover .vue-color__compact__colors {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-wrap: wrap;
}
.compact__ul {
  display: flex;
  flex-direction: row;
  width: 100%;
}
.vue-color__compact__color-item {
  list-style: none;
  width: 2em;
  height: auto;
  margin: 2px;
  cursor: pointer;
  position: relative;
  flex: 1 1 2em;
  padding: 0;
  &::before {
    padding-top: 100%;
    content: "";
    display: block;
  }
}
.vue-color__compact__color-item--white {
  box-shadow: inset 0 0 0 1px #ddd;
  .vue-color__compact__dot {
    background: #000;
  }
}
.vue-color__compact__dot {
  position: absolute;
  top: 5px;
  right: 5px;
  bottom: 5px;
  left: 5px;
  border-radius: 50%;
  opacity: 1;
  background: #fff;
}
</style>
