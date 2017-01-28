<template>
  <div class="container">
    <div class="header" @mouseover.stop="getHoveredItem('chain', $event)" @mouseout.stop="hideTooltip" :style="headerStyle">
      <ul>
        <li v-for="chain in chains" :data-index="chain.id">
          {{ chain.name }}
        </li>
      </ul>
    </div>
    <div class="tab-body" @mouseover.stop="getHoveredItem('res', $event)" @mouseout.stop="hideTooltip" @scroll.stop="scroll($event)">
      <div :style="listHeightStyle">
        <div :style="listScrollStyle">
          <ul v-for="chain in chains">
            <li v-for="residu in chain.sequence" 
            :data-index="residu.index" 
            :class="{ hetero: residu.hetero, hoh: (residu.resname === 'HOH') }">
              {{ residu.resname }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="tooltip" v-bind:style="tooltipStyles" v-html="tooltipText"></div>
  </div>
</template>

<script>
  let prevPos = {top: 0, left: 0}
  let actualPos = {top: 0, left: 0}
  let isScrollInProcess = false

  let optimizedResize = (function () {
    var callbacks = []
    var running = false

    // fired on resize event
    function resize () {
      if (!running) {
        running = true

        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(runCallbacks)
        } else {
          setTimeout(runCallbacks, 66)
        }
      }
    }

    // run the actual callbacks
    function runCallbacks () {
      callbacks.forEach(function (callback) {
        callback()
      })

      running = false
    }

    // adds callback to loop
    function addCallback (callback) {
      if (callback) {
        callbacks.push(callback)
      }
    }

    return {
      // public method to add additional callback
      add: function (callback) {
        if (!callbacks.length) {
          window.addEventListener('resize', resize)
        }
        addCallback(callback)
      }
    }
  }())

  function getTooltipStyles (target) {
    let rect = target.getBoundingClientRect()
    return {
      top: rect.top - 5 + 'px',
      left: rect.right + 5 + 'px',
      visibility: 'visible'
    }
  }

  export default {
    name: 'SequenceWidget',
    props: ['active'],
    data () {
      return {
        tooltipStyles: {
          top: '0px',
          left: '0px',
          visibility: 'hidden'
        },
        listStart: 0,
        listEnd: 9,
        elementHeight: 22,
        elementWidth: 48,
        listScrollStyle: 'margin-top: 0',
        headerStyle: 'margin-left: 0',
        nbElementsToDisplay: 20
      }
    },
    computed: {
      chains: function () {
        let chains = []
        this.$store.state.mol.chains.forEach(chain => {
          chains.push({
            entity: chain.entity,
            id: chain.id,
            name: chain.name,
            sequence: chain.sequence.slice(this.listStart, this.listStart + this.nbElementsToDisplay)
          })
        })
        return chains
      },

      tooltipText: function () {
        let item = this.$store.state.itemHovered
        let respHTML = ''
        if (item.num !== -1) {
          respHTML = item.name + ' ' + item.num + ' '
        }
        respHTML += this.$t('tooltips.chain') + ' ' + item.chain + '<br>'
        respHTML += (this.$te('biochem.pdb_res_name.' + item.name)) ? this.$t('biochem.pdb_res_name.' + item.name) : item.description
        return respHTML
      },

      listHeightStyle: function () {
        const nbElementMax = this.$store.state.mol.chains.reduce((accumulator, currentValue) => {
          return Math.max(accumulator, currentValue.sequence.length)
        }, 0)
        const maxHeight = nbElementMax * this.elementHeight
        const maxWidth = this.$store.state.mol.chains.length * this.elementWidth
        return { height: maxHeight + 'px', width: maxWidth + 'px' }
      }
    },
    methods: {
      getHoveredItem (itemType, event) {
        const target = event.target
        if (target.tagName === 'LI') {
          this.tooltipStyles = getTooltipStyles(target)
          this.$store.dispatch('sequenceHovered', {
            type: itemType,
            index: target.dataset.index
          })
        } else {
          this.hideTooltip()
        }
      },
      hideTooltip () {
        this.tooltipStyles.visibility = 'hidden'
        this.$store.dispatch('sequenceHovered', {
          type: 'none',
          index: 0
        })
      },
      pickColor (val) {
        this.$store.dispatch('color', val.hex)
      },
      scroll (event) {
        const target = event.target
        const pos = {
          top: target.scrollTop,
          left: target.scrollLeft
        }

        if (!isScrollInProcess) {
          isScrollInProcess = true
          let self = this
          window.requestAnimationFrame(function () {
            self.scrolling()
          })
        }

        actualPos = pos
      },

      scrolling () {
        if (prevPos.top !== actualPos.top) {
          this.listStart = (actualPos.top / this.elementHeight) | 0
          let vec = actualPos.top - (actualPos.top % this.elementHeight)
          this.listScrollStyle = { transform: 'translate3d(0,' + vec + 'px, 0px)' }
        } else {
          this.headerStyle = 'transform: translate3d(-' + actualPos.left + 'px, 0px, 0px)'
        }
        this.$forceUpdate()

        prevPos.top = actualPos.top
        isScrollInProcess = false
      },

      setNbElementsToDisplay () {
        const coords = this.$el.getBoundingClientRect()
        this.nbElementsToDisplay = Math.ceil(coords.height / this.elementHeight)
        // console.log(coords)
      }
    },
    watch: {
      active: function (val) {
        if (val) {
          this.setNbElementsToDisplay()
        }
      }
    },
    mounted: function () {
      this.$nextTick(this.setNbElementsToDisplay)
      optimizedResize.add(this.setNbElementsToDisplay)
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .header ul {
    margin: 0;
    padding: 0;
    white-space: nowrap;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.12);
    background: #f9fafc;
  }
  
  .header ul li {
    display: inline-block;
    margin: 0;
    padding: 0;
    width: 3em;
    text-align: center;
    font-weight: 500;
    cursor: pointer;
    color: #546e7a
  }
  
  .header ul li:hover {
    background: #90caf9;
  }
  
  .tab-body {
    flex: 1;
    overflow: auto;
    white-space: nowrap;
  }
  
  .tab-body ul {
    display: inline-table;
    margin: 0;
    padding: 0;
    width: 3em;
  }
  
  .tab-body ul li {
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: center;
    cursor: pointer;
    background: none;
  }
  
  .tab-body ul li:hover {
    background: #bbdefb;
  }
  
  .hetero {
    color: #bf360c
  }
  
  .hoh {
    color: #01579b
  }
  
  .tooltip {
    position: fixed;
    background: #1f2d3d;
    padding: 0.2em 0.4em;
    color: #fff;
    border-radius: 5px;
    min-width: 4em;
    max-width: 50em;
    text-align: center;
    min-height: 1.5em;
    font-weight: 600;
    line-height: 1.5em;
    z-index: 2;
    word-wrap: break-word;
  }
  
  .tooltip:after {
    right: 100%;
    top: 1em;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(47, 64, 74, 0);
    border-right-color: #1f2d3d;
    border-width: 5px;
    margin-top: -5px;
  }
</style>