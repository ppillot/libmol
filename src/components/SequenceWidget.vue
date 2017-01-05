<template>
    <div class="container">
        <div class="header" @mouseover.stop="getHoveredItem('chain', $event)" @mouseout.stop="hideTooltip">
          <ul>
            <li v-for="chain in chains" :data-index="chain.id">
              {{ chain.name }}
            </li>
          </ul>
        </div>
        <div class="tab-body" @mouseover.stop="getHoveredItem('res', $event)" @mouseout.stop="hideTooltip">
          <ul v-for="chain in chains">
            <li v-for="residu in chain.sequence" :data-index="residu.index" :class="{ hetero: residu.hetero, hoh: (residu.resname === 'HOH') }">
              {{ residu.resname }}
            </li>
          </ul>
        </div>
        <div class="tooltip" v-bind:style="tooltipStyles" v-html="tooltipText"></div>
    </div>
</template>

<script>
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
    data () {
      return {
        tooltipStyles: {
          top: '0px',
          left: '0px',
          visibility: 'hidden'
        },
        tooltipText: 'coucou'
      }
    },
    computed: {
      chains: function () {
        return this.$store.state.mol.chains
      },
      tooltipText: function () {
        let item = this.$store.state.itemHovered
        let respHTML = ''
        if (item.num !== -1) {
          respHTML = item.name + ' ' + item.num + ' '
        }
        respHTML += 'Chaîne ' + item.chain + '<br>' + item.description
        return respHTML
      }
    },
    methods: {
      getHoveredItem (itemType, event) {
        const target = event.target
        if (target.tagName === 'LI') {
          this.tooltipStyles = getTooltipStyles(target)
          this.$store.dispatch('sequenceHovered', {
            type: itemType,
            index: target.dataset.index})
        } else {
          this.hideTooltip()
        }
      },
      hideTooltip () {
        this.tooltipStyles.visibility = 'hidden'
      },
      pickColor (val) {
        this.$store.dispatch('color', val.hex)
      }
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
    box-shadow: 0 0 6px #aaa;
    background: #eee;
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
    background: #444;
    padding: 0.2em 0.4em;
    color: #fff;
    border-radius: 5px;
    min-width: 4em;
    text-align: center;
    min-height: 1.5em;
    font-weight: 600;
    line-height: 1.5em;
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
    border-right-color: #444;
    border-width: 5px;
    margin-top: -5px;
  }
</style>