<template>
  <div class="ngl full-height">
    <div class="full-height" id="viewport">
    </div>
    <div class="tooltip" :style="tooltipStyles" v-show="isTooltipVisible">
      {{ this.$t('tooltips.atom') }}: {{ this.$t('biochem.el_name.' + atomDescription.symbol) }}
      {{ atomDescription.atomname }}
      <br>
      {{ this.$t('tooltips.res.' + atomDescription.residueTypeName) }}: {{ (this.$te('biochem.pdb_res_name.' + atomDescription.resname)) ? this.$t('biochem.pdb_res_name.' + atomDescription.resname) : atomDescription.resname }}
      {{ atomDescription.resname }} {{ atomDescription.resno }}
      <br>
      {{ this.$t('tooltips.chain') }}: {{ atomDescription.chainname }}
      {{ atomDescription.entity }}
    </div>
  </div>
</template>

<script>
function residueKey (moleculeType) {
  let residueTypeMap = new Map([
    [0, 'hetero'],
    [1, 'water'],
    [2, 'ion'],
    [3, 'protein'],
    [4, 'rna'],
    [5, 'dna'],
    [6, 'saccharide']
  ])
  return residueTypeMap.get(moleculeType)
}
function getTooltipStyles ({x, y}) {
  var left = document.getElementById('viewport').getBoundingClientRect().left
  return {
    bottom: y + 10 + 'px',
    left: x + left - 12 + 'px'
  }
}

export default {
  name: 'ngl',
  data () {
    return {
      tooltipStyles: {
        top: '0px',
        left: '0px'
      },
      atomDescription: {
        symbol: 'C',
        atomname: 'CA',
        resname: 'VAL',
        resno: '120',
        chainname: 'A',
        entity: 'HEMOGLOBIN ALPHA',
        moleculeType: 3,
        restype: 'protein'
      }
    }
  },
  computed: {
    isTooltipVisible: function () {
      if (this.$store.state.isAtomHovered) {
        let atomHovered = this.$store.state.atomHovered
        Object.assign(this.atomDescription, atomHovered)
        this.atomDescription.residueTypeName = residueKey(atomHovered.resType)
        this.tooltipStyles = getTooltipStyles(atomHovered.pos)
      }
      return this.$store.state.isAtomHovered
    }
  },
  mounted () {
    this.$store.dispatch('createNewStage', {id: 'viewport'})
  }
}
</script>

<style>
  .ngl .tooltip {
    position: fixed;
    background: #1f2d3d;
    padding: 0.2em 0.4em;
    color: #fff;
    border-radius: 5px;
    min-width: 4em;
    max-width: 30em;
    text-align: left;
    min-height: 1.2em;
    font-weight: 600;
    line-height: 1.2em;
    z-index: 2;
    word-wrap: break-word;
    font-size: 0.8em;
  }
  
  .ngl .tooltip:after {
    left: 0.5em;
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(47, 64, 74, 0);
    border-top-color: #1f2d3d;
    border-width: 5px;
    margin-top: 0;
  }
</style>