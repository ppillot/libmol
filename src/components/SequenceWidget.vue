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
          <table :style="[listScrollStyle, listWidthStyle]">
            <tr v-for="line in visibleResidues" :key="line.index">
              <template v-for="residu in line.resRow">
              <td v-if="residu" 
              :data-index="residu.index" 
              :class="{ hetero: residu.hetero, hoh: (residu.resname === 'HOH') }"
              :key="residu.index">
                {{ residu.resname }}
              </td>
              <td v-else>
              </td>
              </template>
            </tr>
          </table>
        </div>
    </div>
    <div class="tooltip" v-bind:style="tooltipStyles" v-html="tooltipText"></div>
  </div>
</template>

<script>
  import optimizedResize from '../utils/resize'

  let prevPos = {top: 0, left: 0}
  let actualPos = {top: 0, left: 0}
  let isScrollInProcess = false
  let resize = optimizedResize()

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
        listScrollStyle: { marginTop: 0 },
        headerStyle: 'margin-left: 0',
        nbElementsToDisplay: 20,
        residuesList: [],
        visibleResidues: []
      }
    },
    computed: {
      chains: function () {
        let chains = []
        this.$store.state.mol.chains.forEach(chain => {
          chains.push({
            entity: chain.entity,
            id: chain.id,
            name: chain.name
          })
        })
        let rList = []
        const maxElementNb = this.$store.state.mol.chains.reduce((accumulator, currentValue) => {
          return Math.max(accumulator, currentValue.sequence.length)
        }, 0)

        for (let i = 0; i < maxElementNb; i++) {
          let resPosiList = []
          this.$store.state.mol.chains.forEach(chain => {
            resPosiList.push(
              (chain.sequence.length > i) ? chain.sequence[i] : null
            )
          })
          rList.push({index: i, resRow: resPosiList})
        }
        this.residuesList = rList

        return chains
      },

      listWidthStyle: function () {
        return {
          width: this.$store.state.mol.chains.length * 3 + 'em'
        }
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
        const maxHeight = (nbElementMax + 1) * this.elementHeight
        const maxWidth = this.$store.state.mol.chains.length * this.elementWidth
        return { height: maxHeight + 'px', width: maxWidth + 'px' }
      }
    },
    methods: {
      getHoveredItem (itemType, event) {
        const target = event.target
        if (((target.tagName === 'LI') || (target.tagName === 'TD' && target.dataset.index !== undefined)) && !isScrollInProcess) {
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
          this.hideTooltip()
          window.requestAnimationFrame(function () {
            self.scrolling()
          })
        }

        actualPos = pos
      },

      scrolling () {
        if (prevPos.top !== actualPos.top) {
          this.listStart = (actualPos.top / this.elementHeight) | 0
          this.listStart --
          if (this.listStart < 0) {
            this.listStart = 0
          }
          let vec = actualPos.top - (actualPos.top % this.elementHeight)
          this.listScrollStyle = { transform: 'translate(0,' + vec + 'px)' }
          this.visibleResidues = this.residuesList.slice(this.listStart, this.listStart + this.nbElementsToDisplay)
        } else {
          this.headerStyle = 'transform: translate(-' + actualPos.left + 'px, 0)'
        }
        this.$forceUpdate()

        prevPos.top = actualPos.top
        isScrollInProcess = false
      },

      setNbElementsToDisplay () {
        const coords = this.$el.getBoundingClientRect()
        this.nbElementsToDisplay = Math.ceil(coords.height / this.elementHeight) + 3
        // console.log(coords)
      },

      setVisibleResidues () {
        this.visibleResidues = this.residuesList.slice(this.listStart, this.listStart + this.nbElementsToDisplay)
      }
    },
    watch: {
      active: function (val) {
        if (val) {
          this.setNbElementsToDisplay()
          this.setVisibleResidues()
        }
      }
    },
    mounted: function () {
      this.$nextTick(this.setNbElementsToDisplay)
      console.log(optimizedResize.add)
      resize.add(this.setNbElementsToDisplay)
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
    position: relative;
  }

  .tab-body div {
    overflow: hidden;
  }
  
  .tab-body table {
    display: table;
    margin: 0;
    padding: 0;
    border-collapse: collapse;
    table-layout: fixed;
    width: 3em;
  }
  
  .tab-body table tr {
    box-sizing: border-box;
    height: 1em;
    width: 100%;
  }

  .tab-body table tr td {
    width: 3em;
    padding: 0;
    text-align: center;
    cursor: pointer;
  }

  .tab-body ul li {
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: center;
    cursor: pointer;
    background: none;
    display: inline-block;
    width: 3em;
  }
  
  .tab-body tr td:hover {
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