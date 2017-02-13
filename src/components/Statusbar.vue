<template>
    <div class="statusbar">
      {{ colorDescription }} :
        <ul @mouseover.stop="getHoveredItem($event)" @mouseout.stop="hideTooltip">
          <li v-for="token in colorScheme" :style="token.css" :data-tooltip="token.tooltip">
              {{ token.text | capitalize }}
          </li>
        </ul>
        <div class="tooltip" v-bind:style="tooltipStyles" v-html="tooltipText"></div>
    </div>
</template>

<script>
  import {getColor} from '../utils/colors'
  import {getSStrucName} from '../utils/sstruc'
/**
 * remove values from the set when they are redundant with alias values
 * @param {set} setObject - the set we want to remove redundant aliases from
 * @param {array} aliasValues - an array containing aliases as properties
 */
  function removeRedundancyFromSet (setObject, aliasValues) {
    var s = new Set()
    setObject.forEach(item => {
      if (aliasValues[item] !== undefined) {
        s.add(aliasValues[item])
      } else {
        s.add(item)
      }
    })
    return s
  }

  function getTooltipStyles (target) {
    let rect = target.getBoundingClientRect()
    return {
      top: rect.top - 35 + 'px',
      left: rect.left - 5 + 'px',
      visibility: 'visible'
    }
  }

  export default {
    name: 'statusbar',
    data () {
      return {
        tooltipStyles: {
          top: '0px',
          left: '0px',
          visibility: 'hidden'
        },
        tooltipText: '',
        colorDescription: this.$t('ui.commands.color.cpk')
      }
    },
    computed: {
      colorScheme: function () {
        var cs = []
        switch (this.$store.state.color) {
          case 'element':
            this.$store.state.mol.elements.forEach(
              item => {
                cs.push({
                  text: item,
                  css: 'color: #' + getColor('element', item).toString(16),
                  tooltip: (this.$te('biochem.el_name.' + item)) ? this.$t('biochem.el_name.' + item) : undefined
                })
              }
            )
            this.colorDescription = this.$t('ui.commands.color.cpk')
            break
          case 'chainname':
            this.$store.state.mol.chains.forEach(
              item => {
                cs.push({
                  text: item.name,
                  css: 'color: #' + item.color,
                  tooltip: item.entity
                })
              }
            )
            this.colorDescription = this.$t('ui.commands.color.by_chain')
            break
          case 'resname':
            this.$store.state.mol.residues.forEach(
              item => {
                cs.push({
                  text: item,
                  css: 'color: #' + getColor('resname', item).toString(16),
                  tooltip: (this.$te('biochem.pdb_res_name.' + item)) ? this.$t('biochem.pdb_res_name.' + item) : undefined
                })
              }
            )
            this.colorDescription = this.$t('ui.commands.color.by_res')
            break
          case 'sstruc':
            let sstruc = removeRedundancyFromSet(this.$store.state.mol.sstruc, {'s': 'l', 'e': 'b'})
            sstruc.forEach(
              item => {
                let sstruc = getSStrucName(item)
                if (sstruc !== '') {
                  cs.push({
                    text: this.$t('biochem.sstruc.' + sstruc),
                    css: 'color: #' + getColor('sstruc', sstruc).toString(16)
                  })
                }
              }
            )
            this.colorDescription = this.$t('ui.commands.color.by_secondary_structure')
            break
          case 'moleculetype':
            Object.keys(this.$store.state.mol.molTypes).forEach(
              item => {
                if (this.$store.state.mol.molTypes[item] && item !== 'nucleic') {
                  cs.push({
                    text: this.$t('biochem.molecule_type.' + item),
                    css: 'color: #' + getColor('moleculetype', item).toString(16)
                  })
                }
              }
            )
            this.colorDescription = this.$t('ui.commands.color.by_biochemical_nature')
            break
          default :
            cs = {
              text: 'coucou',
              css: 'color: #00ff00'
            }
        }
        return cs
      }
    },
    methods: {
      getHoveredItem (event) {
        const target = event.target
        if (target.tagName === 'LI' && target.dataset.tooltip !== undefined) {
          this.tooltipStyles = getTooltipStyles(target)
          this.tooltipText = target.dataset.tooltip
        } else {
          this.hideTooltip()
        }
      },
      hideTooltip () {
        this.tooltipStyles.visibility = 'hidden'
      }
    },
    filters: {
      capitalize: function (value) {
        if (!value) return ''
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      }
    }
  }
</script>

<style>
  .statusbar {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
    background: rgba(249, 250, 252, 0.95);
    vertical-align: middle;
  }

  .statusbar {
    font-size: 1.3em
  }

  .statusbar ul {
    margin:0 0.5em;
    padding: 0;
    display: inline;
    font-weight: bold;
    -webkit-text-stroke: 1px #888;
    -moz-text-stroke: 1px #888;
    -ms-text-stroke: 1px #888;
  }

  .statusbar ul li {
    display: inline;
    cursor: default;
  }

  .statusbar .tooltip {
    position: fixed;
    background: #1f2d3d;
    padding: 0.2em 0.4em;
    color: #fff;
    border-radius: 5px;
    min-width: 4em;
    max-width: 30em;
    text-align: center;
    min-height: 1.2em;
    font-weight: 600;
    line-height: 1.2em;
    z-index: 2;
    word-wrap: break-word;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: none;
    font-size: 0.8em;
  }
  
  .statusbar .tooltip:after {
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
