<template>
  <div class="container" @contextmenu.prevent="displayContextMenu">
    <div class="header" @mouseover.stop="getHoveredItem('chain', $event)" @mouseout.stop="hideTooltip" :style="headerStyle">
      <ul id="chains-list">
        <li v-for="chain in chains"
          :data-index="chain.id"
          @click="selectChain(chain.id)"
          :class="{ sel: isSelectedChain(chain.name),
                    sense: chain.sense,
                    'anti-sense': chain.antiSense }"
          :key="chain.id">
          {{ chain.name }}
        </li>
      </ul>
    </div>
    <div class="tab-body"
      @mouseover.stop="getHoveredItem('res', $event)"
      @mouseout.stop="hideTooltip"
      @scroll.stop="scroll($event)">
      <div :style="listHeightStyle">
          <table :style="[listScrollStyle, listWidthStyle]" id="table-seq">
            <tr v-for="line in visibleResidues" :key="line.index">
              <template v-for="(residu, ix) in line.resRow">
                <td v-if="residu !== null"
                  :data-index="residu.index"
                  :class="{ hetero: residu.hetero,
                            hoh: (residu.resname === 'HOH'),
                            sel: isSelected(residu.index),
                            usersel: isBeingSelected(residu.index)}"
                  :key="line.index +' '+ ix">
                    {{ residu.resname }}
                </td>
                <td v-else :key="line.index +' '+ ix">
                </td>
              </template>
            </tr>
          </table>
        </div>
    </div>
    <div class="tooltip" v-bind:style="tooltipStyles" v-html="tooltipText"></div>
    <entity-context-menu
      :showContextMenu="showContextMenu" :target="contextMenuTarget" @hide="hideContextMenu"/>
  </div>
</template>

<script>
import EntityContextMenu from './EntityContextMenu'
import optimizedResize from '../utils/resize.ts'

let prevPos = { top: 0, left: 0 }
let actualPos = { top: 0, left: 0 }
let isScrollInProcess = false
let preventShowTooltip = false
let preventTooltipTimeout = 0
let lastHoveredItem = null
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
  components: {
    EntityContextMenu
  },
  props: ['active'],
  data () {
    return {
      tooltipStyles: {
        top: '0px',
        left: '0px',
        visibility: 'hidden'
      },
      showContextMenu: false,
      contextMenuTarget: this.$el,
      listStart: 0,
      listEnd: 9,
      elementHeight: 22,
      elementWidth: 48,
      listScrollStyle: { marginTop: 0 },
      headerStyle: 'margin-left: 0',
      nbElementsToDisplay: 20,
      userSelection: [],
      userSelectionStart: NaN,
      targetTYpe: 'res'
    }
  },
  computed: {
    ctxMProp: function () {
      return this.$store.state.anchor
    },
    chains: function () {
      let chains = []
      chainByResidueList = []

      this.$store.state.mol.chains.forEach((chain, index) => {
        chains.push({
          entity: chain.entity,
          id: chain.id,
          name: chain.name,
          sense: chain.hasDNA && !chain.isInReverse,
          antiSense: chain.hasDNA && chain.isInReverse
        })
        chain.sequence.forEach(res => {
          chainByResidueList[res.index] = chain.id
        })
      })
      // console.log(chainByResidueList)
      return chains
    },

    residuesList: function () {
      const rList = []
      const maxElementNb = Math.max(...this.$store.state.mol.chains.map(ch => {
        return ch.sequence.length
      }))

      for (let i = 0; i < maxElementNb; i++) {
        const resPosiList = []
        this.$store.state.mol.chains.forEach(chain => {
          resPosiList.push(
            (chain.sequence.length > i) ? chain.sequence[i] : null
          )
        })
        rList.push({ index: i, resRow: resPosiList })
      }
      return rList
    },

    visibleResidues: function () {
      return this.residuesList.slice(
        this.listStart,
        this.listStart + this.nbElementsToDisplay)
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
      respHTML += (this.$te('biochem.pdb_res_name.' + item.name))
        ? this.$t('biochem.pdb_res_name.' + item.name)
        : item.description
      return respHTML
    },

    listHeightStyle: function () {
      this.$nextTick(function () {
        actualPos = { top: 0, left: 0 }
        this.scrolling()
      })
      const nbElementMax = this.$store.state.mol.chains.reduce((accumulator, currentValue) => {
        return Math.max(accumulator, currentValue.sequence.length)
      }, 0)
      const maxHeight = nbElementMax * this.elementHeight
      const maxWidth = this.$store.state.mol.chains.length * this.elementWidth
      return { height: maxHeight + 'px', width: maxWidth + 'px' }
    },

    selectedResidues: function () {
      return this.$store.state.selected
    }
  },
  methods: {
    isSelectedChain (chainName) {
      return this.$store.state.selectedChains.includes(chainName)
    },
    isSelected (resIndex) {
      return this.selectedResidues[resIndex]
    },
    isBeingSelected (resIndex) {
      return this.userSelection.includes(resIndex)
    },
    getHoveredItem (itemType, { target }) {
      if (preventShowTooltip) {
        lastHoveredItem = { itemType, target }
        return
      }
      if (((target.tagName === 'LI') || (target.tagName === 'TD' && target.dataset.index !== undefined)) && !isScrollInProcess) {
        this.tooltipStyles = getTooltipStyles(target)
        this.$store.dispatch('sequenceHovered', {
          type: itemType,
          index: target.dataset.index
        })
        // if (this.showContextMenu) this.showContextMenu = false
      } else {
        this.hideTooltip()
      }
    },
    hideTooltip () {
      if (this.tooltipStyles.visibility === 'hidden') return
      this.tooltipStyles.visibility = 'hidden'
      this.$store.dispatch('sequenceHovered', {
        type: 'none',
        index: 0
      })
      lastHoveredItem = null
    },
    // ******** Context menu
    displayContextMenu (event) {
      const target = event.target
      this.hideTooltip()
      if (((target.tagName === 'LI') || (target.tagName === 'TD' && target.dataset.index !== undefined)) && !isScrollInProcess) {
        this.showContextMenu = true
        const targetType = (target.tagName === 'LI') ? 'chain' : 'res'
        this.$store.dispatch('contextMenuCalled', {
          type: targetType,
          index: target.dataset.index
        })
        this.contextMenuTarget = target
      } else {
        this.hideContextMenu()
      }
    },
    hideContextMenu () {
      this.showContextMenu = false
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
        preventShowTooltip = true
        this.hideTooltip()
        window.requestAnimationFrame(function () {
          this.scrolling()
        }.bind(this))
      }

      actualPos = pos
    },

    scrolling () {
      if (prevPos.top !== actualPos.top) {
        this.listStart = (actualPos.top / this.elementHeight) | 0
        if (this.listStart < 0) {
          this.listStart = 0
        }
        let vec = actualPos.top - (actualPos.top % this.elementHeight)
        this.listScrollStyle = { transform: 'translate(0,' + vec + 'px)' }
      } else {
        this.headerStyle = 'transform: translate(-' + actualPos.left + 'px, 0)'
      }
      this.$forceUpdate()

      prevPos.top = actualPos.top
      isScrollInProcess = false
      window.clearTimeout(preventTooltipTimeout)

      preventTooltipTimeout = window.setTimeout(() => {
        preventShowTooltip = false
        if (lastHoveredItem !== null) {
          this.getHoveredItem(lastHoveredItem.itemType, { target: lastHoveredItem.target })
        }
      }, 300)
    },

    setNbElementsToDisplay () {
      const coords = this.$el.getBoundingClientRect()
      this.nbElementsToDisplay = Math.ceil(coords.height / this.elementHeight) + 3
    },

    setVisibleResidues () {
      this.visibleResidues = this.residuesList.slice(this.listStart, this.listStart + this.nbElementsToDisplay)
    },
    // ************* Selection
    startSelection (event) {
      event.stopPropagation()
      if (event.button > 1) return

      let startResId = getResIndexFromNode(event.target)

      // console.log('start:', startResId, 'chain:', chainByResidueList[startResId])
      if (isNaN(startResId)) { // could not get the starting point
        // console.log(event.target)
        this.userSelectionStart = NaN
        return
      }

      // special case: user is using shift key to extend previously started selection
      if (event.shiftKey) {
        // check that previous start and new end belong to same chain
        if (chainByResidueList[this.userSelectionStart] === chainByResidueList[startResId]) {
          this.userSelection =
            fillArrayTo.call(this, this.userSelectionStart, startResId)
        }
      } else {
        this.userSelectionStart = startResId
        this.userSelection = [startResId]
      }
      // isSelectionInProcess = true
      document.getElementById('table-seq').addEventListener('mouseover', this.currentSelection)
      document.getElementById('table-seq').addEventListener('mouseleave', this.cancelSelection)
      document.addEventListener('mouseup', this.endSelection)
    },

    cancelSelection (event) {
      // event.stopPropagation()
      this.userSelection.splice(1)
      // console.log('cancel selection')
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
    },

    endSelection (event) {
      event.stopPropagation()
      let endResId = getResIndexFromNode(event.target)

      // let's commit the new selection if the event happened in the same chain
      if (!isNaN(endResId) && (chainByResidueList[this.userSelection[0]] === chainByResidueList[endResId])) {
        // shift key forces to select
        this.$store.dispatch('sequenceSelected', {
          selection: this.userSelection.slice(0),
          forceSelect: event.shiftKey
        })
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
        this.$nextTick(function () {
          this.setNbElementsToDisplay()
          // when a new model has been loaded, if the previous sequence has been scrolled,
          // the (v?)dom node keeps track of the scroll amount which reappears when the component
          // is loaded again. We set scrollTop to zero when the vertical pos has been set back to 0
          if (actualPos.top === 0 && actualPos.left === 0) {
            const tb = this.$el.getElementsByClassName('tab-body')[0]
            tb.scrollTop = 0
            tb.scrollLeft = 0
          }
        })
        document.getElementById('table-seq').addEventListener('mousedown', this.startSelection)
      } else {
        document.getElementById('table-seq').removeEventListener('mousedown', this.startSelection)
      }
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.setNbElementsToDisplay()
      this.$el.getElementsByClassName('tab-body')[0].scrollTop = 0
    })
    resize.add(this.setNbElementsToDisplay.bind(this))
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

  .header {
    box-shadow: 0 2px 4px 0 rgba(0,0,0,.12);
    z-index: 2;
  }

  .header ul {
    margin: 0;
    padding: 0;
    white-space: nowrap;
    background: #f9fafc;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
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
    background: #e6e9ef;
  }

  .header ul li.sense::after {
    content: '↓';
  }
  .header ul li.anti-sense::after {
    content: '↑';
  }
  .header ul li::after {
    position: absolute;
    color: #b0bec5;
    margin-left: 3px;
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

  .header ul li.sel {
    background: #6ab6e2;
    color: white;
    font-weight: bold;
  }

  .header ul li.sel::after {
    color: lightblue;
  }

  .header ul li.sel:sel {
    background: #6ab6e2;
  }

  .header ul li.sel:hover {
    background: #e6e9ef;
    color: #546e7a;
  }

  .usersel {
    background: #dbdf00;
  }

  .tooltip, .context-menu {
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

  .tooltip:after, .context-menu:after {
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

  .context-menu {
    background: #EFF2F7;
    color: #1f2d3d;
    font-weight: 400;
    font-size: 0.9em;
    padding: 0;
  }

  .context-menu ul {
    margin: 0 0 5px 0;
    padding: 0;
  }
  .context-menu li {
    list-style: none;
    text-align: left;
    padding: 0 0.4em;
  }
  .context-menu li:hover {
    background: #20A0FF;
    color: #fff;
    cursor: pointer;
  }
  .context-menu li.disabled {
    color: #C0CCDA;
  }
  .context-menu li.disabled:hover {
    cursor: default;
    background: transparent;
    color: #C0CCDA;
  }
  .context-menu div {
    background: #1f2d3d;
    border-radius: 5px 5px 0 0;
    margin-bottom: 0.2em;
    font-weight: 600;
    color: #fff;
    padding: 0 0.5em;
  }
  .context-menu-backdrop {
    background: transparent;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
  }
</style>
