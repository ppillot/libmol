<template>
  <div class="container">
    <div class="header" @mouseover.stop="getHoveredItem('chain', $event)" @mouseout.stop="hideTooltip" :style="headerStyle">
      <ul id="chains-list">
        <li v-for="chain in chains" :data-index="chain.id" @click="selectChain(chain.id)">
          {{ chain.name }}
        </li>
      </ul>
    </div>
    <div class="tab-body" @mouseover.stop="getHoveredItem('res', $event)" @mouseout.stop="hideTooltip" @scroll.stop="scroll($event)">
      <div :style="listHeightStyle">
          <table :style="[listScrollStyle, listWidthStyle]" id="table-seq">
            <tr v-for="line in visibleResidues" :key="line.index">
              <template v-for="residu in line.resRow">
              <td v-if="residu" 
              :data-index="residu.index" 
              :class="{ hetero: residu.hetero, hoh: (residu.resname === 'HOH'), sel: isSelected(residu.index), usersel: isBeingSelected(residu.index)}"
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
  let chainByResidueList = []
  // let isSelectionInProcess = false

  function getTooltipStyles (target) {
    let rect = target.getBoundingClientRect()
    return {
      top: rect.top - 5 + 'px',
      left: rect.right + 5 + 'px',
      visibility: 'visible'
    }
  }

  function getResIndexFromNode (node) {
    if (node.nodeType === window.Node.TEXT_NODE) {
      node = node.parentNode
    }
    if (node.tagName !== 'TD') {
      return NaN
    }
    return ('index' in node.dataset) ? node.dataset.index | 0 : NaN
  }

  function fillArrayTo (start, end) {
    let arr = []
    let chainSeq = this.$store.state.mol.chains[chainByResidueList[start]].sequence
    let isReversed = (start > end)

    if (isReversed) {
      [start, end] = [end, start]
    }
    let i = 0
    let push = false
    while ((i < chainSeq.length) && (chainSeq[i].index <= end)) {
      if (chainSeq[i].index === start) {
        push = true
      }
      if (push) {
        arr.push(chainSeq[i].index)
      }
      i++
    }
    if (isReversed) {
      arr.reverse()
    }

    return arr
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
        visibleResidues: [],
        userSelection: []
      }
    },
    computed: {
      chains: function () {
        let chains = []
        chainByResidueList = []

        this.$store.state.mol.chains.forEach((chain, index) => {
          chains.push({
            entity: chain.entity,
            id: chain.id,
            name: chain.name
          })
          chain.sequence.forEach(res => {
            chainByResidueList[res.index] = chain.id
          })
        })
        // console.log(chainByResidueList)
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
      isSelected (resIndex) {
        return this.$store.state.selected[resIndex]
      },
      isBeingSelected (resIndex) {
        return this.userSelection.includes(resIndex)
      },
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
// *********  Virtual scrolling
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
      },
// ************* Selection
      startSelection (event) {
        event.stopPropagation()

        let startResId = getResIndexFromNode(event.target)
        // console.log('start:', startResId, 'chain:', chainByResidueList[startResId])
        if (isNaN(startResId)) { // could not get the starting point
          // console.log(event.target)
          return
        }
        this.userSelection = [startResId]
        // isSelectionInProcess = true
        document.getElementById('table-seq').addEventListener('mouseover', this.currentSelection)
        document.getElementById('table-seq').addEventListener('mouseleave', this.cancelSelection)
        document.addEventListener('mouseup', this.endSelection)
      },

      cancelSelection (event) {
        // event.stopPropagation()
        this.userSelection.splice(1)
        // console.log('cancel selection')
        return
      },

      currentSelection (event) {
        // event.stopPropagation()

        let currentResId = getResIndexFromNode(event.target)
        if (isNaN(currentResId)) {
          this.userSelection.splice(1)
        } else {
          // check if same chain
          if (chainByResidueList[this.userSelection[0]] !== chainByResidueList[currentResId]) {
            this.userSelection.splice(1)
          } else {
            this.userSelection = fillArrayTo.call(this, this.userSelection[0], currentResId)
          }
        }
        // console.log('current:', currentResId)
        return
      },

      endSelection (event) {
        event.stopPropagation()
        let endResId = getResIndexFromNode(event.target)

        // let's commit the new selection if the event happened in the same chain
        if (!isNaN(endResId) && (chainByResidueList[this.userSelection[0]] === chainByResidueList[endResId])) {
          this.$store.dispatch('sequenceSelected', this.userSelection.slice(0))
        }

        this.userSelection = []
        // console.log('end:', endResId)
        document.getElementById('table-seq').removeEventListener('mouseover', this.currentSelection)
        document.getElementById('table-seq').removeEventListener('mouseleave', this.cancelSelection)
        document.removeEventListener('mouseup', this.endSelection)
      },

      selectChain (chainId) {
        this.$store.dispatch('chainSelected', chainId)
        this.$forceUpdate()
      }
    },
    watch: {
      active: function (val) {
        if (val) {
          this.setNbElementsToDisplay()
          this.setVisibleResidues()
          document.getElementById('table-seq').addEventListener('mousedown', this.startSelection)
        } else {
          document.getElementById('table-seq').removeEventListener('mousedown', this.startSelection)
        }
      }
    },
    mounted: function () {
      this.$nextTick(this.setNbElementsToDisplay)
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
    cursor: cell;
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
    /* user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none; */
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
    cursor: cell;
    user-select: none;
  }

  td::selection {
    background: #fff
  }

  .tab-body tr td:hover {
    background: #eef1f6;
  }
  
  .hetero {
    color: #bf360c
  }
  
  .hoh {
    color: #01579b
  }

  .sel {
    background: #b1e3f7
  }

  .sel::selection {
    background: #b1e3f7
  }

  .usersel {
    background: #dbdf00;
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
