<template>
  <div class="tooltip" :style="tooltipStyles" v-show="isTooltipVisible" :class="{'contact': content==='contact'}">
    <template v-if="content === 'atom'">
      {{ this.$t('tooltips.atom') }}: {{ this.$t('biochem.el_name.' + atomDescription.symbol) }}
      {{ atomDescription.atomname }}
      <br>
      {{ (this.$te('tooltips.res.' + atomDescription.residueTypeName))? this.$t('tooltips.res.' + atomDescription.residueTypeName) : 'Res' }}: {{ (this.$te('biochem.pdb_res_name.' + atomDescription.resname)) ? this.$t('biochem.pdb_res_name.' + atomDescription.resname) : '' }}
      {{ atomDescription.resname }} {{ atomDescription.resno }}
      <br>
      {{ this.$t('tooltips.chain') }}: {{ atomDescription.chainname }}
      {{ atomDescription.entity }}
    </template>
    <template v-else-if="content === 'contact'">
      {{ contactDescription.contactName }}
      <table>
        <tr>
          <td>
            {{ (this.$te('biochem.pdb_res_name.' + contactDescription.atom1.resname)) ? this.$t('biochem.pdb_res_name.' + contactDescription.atom1.resname) : contactDescription.atom1.resname }}
            {{ contactDescription.atom1.resno }}
            <br>
            {{ this.$t('tooltips.chain') }}: {{ contactDescription.atom1.chainname }}
          </td>
          <td>
            {{ (this.$te('biochem.pdb_res_name.' + contactDescription.atom2.resname)) ? this.$t('biochem.pdb_res_name.' + contactDescription.atom2.resname) : contactDescription.atom2.resname }}
            {{ contactDescription.atom2.resno }}
            <br>
            {{ this.$t('tooltips.chain') }}: {{ contactDescription.atom2.chainname }}
          </td>
        </tr>
      </table>
      
      
      
    </template>
  </div>
</template>

<script>
const residueTypes = [
  'hetero',
  'water',
  'ion',
  'protein',
  'rna',
  'dna',
  'saccharide'
]

const contactTypesMap = new Map([
  ['hydrogen bond', 'hbond'],
  ['weak hydrogen bond', 'weakHbond'],
  ['water hydrogen bond', 'waterHbond'],
  ['backbone hydrogen bond', 'backboneHbond'],
  ['hydrophobic contact', 'hydrophobic'],
  ['ionic interaction', 'ionic'],
  ['pi-pi stacking', 'piStacking'],
  ['cation-pi interaction', 'cationPi'],
  ['metal coordination', 'metalCoordination']
])

export default {
  name: 'tooltip',
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
      },
      contactDescription: {
      },
      content: ''
    }
  },
  computed: {
    isTooltipVisible: function () {
      if (this.$store.state.isAtomHovered) {
        // we need to copy by value to prevent side effects
        let atomHovered = this.$store.state.atomHovered
        Object.assign(this.atomDescription, atomHovered)
        this.atomDescription.residueTypeName = residueTypes[atomHovered.resType]
        this.tooltipStyles = this.getTooltipStyles(atomHovered.pos)
        this.content = 'atom'
      } else if (this.$store.state.isContactHovered) {
        const contactHovered = this.$store.state.contactHovered
        const key = contactTypesMap.get(contactHovered.contactType)
        const contactNameTranslation = (key === undefined) ? contactHovered.contactType : this.$t('ui.contacts.' + key)
        Object.assign(this.contactDescription, contactHovered, {'contactName': contactNameTranslation})
        this.tooltipStyles = this.getTooltipStyles(contactHovered.pos)
        this.content = 'contact'
      }
      return this.$store.state.isAtomHovered || this.$store.state.isContactHovered
    }
  },
  methods: {
    getTooltipStyles: function ({x, y}) {
      return {
        bottom: y + 10 + 'px',
        left: x - 12 + 'px'
      }
    }
  }
}
</script>

<style scoped>
  .tooltip {
    position: absolute;
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
  
  .tooltip:after {
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
  .contact {
    text-align: center;
    line-height: 1.5em;
    padding: 0;
  }
  table {
    border-collapse: separate;
    width: 100%;
    font-weight: 400;
    
  }
  .contact td {
    background:#446688;
    color: #fff;
    padding: 0 0.5em;
  }
</style>
