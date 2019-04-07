<template>
  <div class="tooltip" :style="tooltipStyles" v-show="isTooltipVisible" :class="{'contact': content==='contact'}">
    <template v-if="content === 'atom'">
      {{ this.$t('tooltips.atom') }}: {{ this.$t('biochem.el_name.' + atomDescription.symbol) }}
      {{ atomDescription.atomname }}
      <br>
      {{ (this.$te('tooltips.resType.' + atomDescription.residueTypeName))? this.$t('tooltips.resType.' + atomDescription.residueTypeName) : 'Res' }}: {{ (this.$te('biochem.pdb_res_name.' + atomDescription.resname)) ? this.$t('biochem.pdb_res_name.' + atomDescription.resname) : '' }}
      {{ atomDescription.resname }} {{ atomDescription.resno }}
      <br>
      {{ this.$t('tooltips.chain') }}: {{ atomDescription.chainname }}
      {{ atomDescription.entity }}
    </template>
    <template v-else-if="content === 'contact'">
      {{ contactDescription.contactName }}
      <table>
        <tr>
          <td :class="contactDescription.contactClass">
            {{ (this.$te('biochem.pdb_res_name.' + contactDescription.atom1.resname)) ? this.$t('biochem.pdb_res_name.' + contactDescription.atom1.resname) : contactDescription.atom1.resname }}
            {{ contactDescription.atom1.resno }}
            <br>
            {{ this.$t('tooltips.chain') }}: {{ contactDescription.atom1.chainname }}
          </td>
          <td :class="contactDescription.contactClass">
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
import {contactTypesMap} from '../utils/contacts'
const residueTypes = [
  'hetero',
  'water',
  'ion',
  'protein',
  'rna',
  'dna',
  'saccharide'
]

/* const contactTypesMap = new Map([
  ['hydrogen bond', 'hbond'],
  ['weak hydrogen bond', 'weakHbond'],
  ['water hydrogen bond', 'waterHbond'],
  ['backbone hydrogen bond', 'backboneHbond'],
  ['hydrophobic contact', 'hydrophobic'],
  ['ionic interaction', 'ionic'],
  ['pi-pi stacking', 'piStacking'],
  ['cation-pi interaction', 'cationPi'],
  ['metal coordination', 'metalCoordination']
]) */

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
        // console.log(key, contactNameTranslation)
        Object.assign(this.contactDescription, contactHovered, {'contactName': contactNameTranslation, 'contactClass': key})
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
    padding: 0 0.5em;
  }
</style>

<style>
/* text colors */
  .hydrogenBond-text, .waterHydrogenBond-text, .backboneHydrogenBond-text {
    color: #2B83BA;
  }

  .hydrophobic-text {
    color: #808080;
  }

  .halogenBond-text {
    color: #40FFBF;
  }

  .ionicInteraction-text {
    color: #f0c814;
  }

  .metalCoordination-text {
    color: #8C4099;
  }

  .cationPi-text {
    color: #ff8000;
  }

  .piStacking-text {
    color: #8cb366;
  }

  .weakHydrogenBond-text {
    color: #c5ddec;
  }

/* border-color*/
  .hydrogenBond-border, .waterHydrogenBond-border, .backboneHydrogenBond-border {
    border-color: #2B83BA;
  }

  .hydrophobic-border {
    border-color: #808080;
  }

  .halogenBond-border {
    border-color: #40FFBF;
  }

  .ionicInteraction-border {
    border-color: #f0c814;
  }

  .metalCoordination-border {
    border-color: #8C4099;
  }

  .cationPi-border {
    border-color: #ff8000;
  }

  .piStacking-border {
    border-color: #8cb366;
  }

  .weakHydrogenBond-border {
    border-color: #c5ddec;
  }

/* background color */
  .hydrogenBond, .waterHydrogenBond, .backboneHydrogenBond {
    background: #2B83BA;
    color: #fff;
  }

  .hydrophobic {
    background: #808080;
    color: #fff;
  }

  .halogenBond {
    background: #40FFBF;
    color: #1f2d3d;
  }

  .ionicInteraction {
    background: #f0c814;
    color: #1f2d3d;
  }

  .metalCoordination {
    background: #8C4099;
    color: #fff;
  }

  .cationPi {
    background: #ff8000;
    color: #1f2d3d;
  }

  .piStacking {
    background: #8cb366;
    color: #1f2d3d;
  }

  .weakHydrogenBond {
    background: #c5ddec;
    color: #1f2d3d;
  }
</style>
