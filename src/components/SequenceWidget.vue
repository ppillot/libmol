<template>
    <div class="container">
        <div class="header" @mouseover.stop="getHoveredChain" @mouseout.stop="hideTooltip">
          <ul>
            <li v-for="chain in chains" :data-index="chain.id">
              {{ chain.id }}
            </li>
          </ul>
        </div>
        <div class="tab-body" @mouseover.stop="getHoveredResidue" @mouseout.stop="hideTooltip">
          <ul v-for="chain in chains">
            <li v-for="residu in chain.sequence" :data-index="residu.index" :class="{ hetero: residu.hetero, hoh: (residu.resname === 'HOH') }">
              {{ residu.resname }}
            </li>
          </ul>
        </div>
        <div class="tooltip" v-bind:style="tooltipStyles">{{ tooltipText }}</div>
    </div>
</template>

<script>
  function getTooltipStyles (target) {
    return {
      top: target.offsetTop - target.parentElement.parentElement.scrollTop - 5 + 'px',
      left: target.offsetLeft + target.offsetWidth + 5 - target.parentElement.parentElement.scrollLeft + 'px',
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
      }
    },
    methods: {
      getHoveredResidue (event) {
        const target = event.target
        if (target.tagName === 'LI') {
          this.tooltipStyles = getTooltipStyles(target)
          this.tooltipText = target.dataset.index
          // this.$store.getters.getResidue(target.dataset.index)
        } else {
          this.tooltipStyles.visibility = 'hidden'
        }
      },
      getHoveredChain (event) {
        const target = event.target
        if (target.tagName === 'LI') {
          this.tooltipStyles = getTooltipStyles(target)
          this.tooltipText = 'Chaîne ' + target.dataset.index
          // window.console.log(target.dataset.index)
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
    position: absolute;
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
    top: 50%;
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