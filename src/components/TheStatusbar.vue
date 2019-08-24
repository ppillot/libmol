<template>
    <div class="statusbar">
      <div class="statusbar--contact" v-if="hasContacts">
        <div v-for="type in contactTypes"
          :key="type"
          class="statusbar--element"
          >
          <context-help
            :subject="type"
            namespace="contacts"
            placement="top"
            trigger-event="click">
              <span :class="`${type}-border dashed`">
              </span>
              <span :class="`${type}-text`">
                {{ $t(`ui.contacts.${type}`) }}
              </span>
          </context-help>
        </div>

      </div>
      <div class="coloration">
        <div  v-show="isShown">
          {{ colorDescription }} :
          <span @mouseover.stop="getHoveredItem($event)" @mouseout.stop="hideTooltip">
            <span v-for="token in colorScheme" :style="token.css" :data-tooltip="token.tooltip" :key="token.text">
                {{ token.text | capitalize }}
            </span>
          </span>
        </div>
      </div>
        <div class="tooltip" v-bind:style="tooltipStyles" v-html="tooltipText"></div>
        <counter-selection class="counter"></counter-selection>
        <counter-hidden></counter-hidden>
    </div>
</template>

<script>
import { getColor } from '../utils/colors'
import { getSStrucName } from '../utils/sstruc'
import CounterHidden from './CounterHidden'
import CounterSelection from './CounterSelection'
import ContextHelp from './ContextHelp'

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
  name: 'TheStatusbar',
  data () {
    return {
      tooltipStyles: {
        top: '0px',
        left: '0px',
        visibility: 'hidden'
      },
      tooltipText: ''
    }
  },
  components: {
    CounterHidden,
    CounterSelection,
    ContextHelp
  },
  computed: {
    hasContacts: function () {
      return this.$store.state.contacts.length > 0
    },
    contactTypes: function () {
      const visibleContacts = this.$store.state.contacts.reduce((acc, contact) => {
        if (contact.visible) {
          acc.push(contact)
        }
        return acc
      }, [])

      let cTypes = new Set()
      visibleContacts.forEach((contact) => {
        contact.contactsList.forEach((contactEl) => {
          cTypes.add(contactEl.type)
        })
      })

      return [...cTypes]
    },
    isShown: function () {
      return this.$store.state.selection !== 'none'
    },
    colorDescription: function () {
      return this.colorState.colorName
    },
    colorScheme: function () {
      return this.colorState.colorScheme
    },
    colorState: function () {
      const cs = []
      let cName = ''
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
          // Hydrogen though present in reality can be absent in the model (cf crystallography)
          // We check for organic molecules
          if (!this.$store.state.mol.elements.has('H')) {
            const molTypes = this.$store.state.mol.molTypes
            if (molTypes.water || molTypes.nucleic || molTypes.protein || molTypes.saccharide) {
              cs.push({
                text: '(H)',
                css: 'color: #FFFFFF',
                tooltip: this.$t('tooltips.missingH')
              })
            }
          }
          cName = this.$t('ui.commands.color.cpk')
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
          cName = this.$t('ui.commands.color.by_chain')
          break
        case 'sidechain':
          cs.push({
            text: this.$t('ui.commands.representation.backbone'),
            css: 'color: #888',
            tooltip: this.$t('ui.commands.representation.backbone')
          })
        // intentional fallthrough
        // eslint-disable-next-line
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
          cName = (this.$store.state.color === 'resname')
            ? this.$t('ui.commands.color.by_res')
            : this.$t('ui.commands.color.sidechain')
          break
        case 'sstruc':
          let sstruc = removeRedundancyFromSet(this.$store.state.mol.sstruc, { 's': 'l', 'e': 'b' })
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
          cName = this.$t('ui.commands.color.by_secondary_structure')
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
          cName = this.$t('ui.commands.color.by_biochemical_nature')
          break
        case 'mix':
          cs.push({
            text: this.$t('ui.statusbar.color.mix'),
            css: 'color: black'
          })
          cName = this.$t('ui.statusbar.color.color')
          break
        default :
          cs.push({
            text: this.$t('ui.statusbar.color.user'),
            css: 'color: ' + this.$store.state.color
          })
          cName = this.$t('ui.statusbar.color.color')
      }
      return {
        colorScheme: cs,
        colorName: cName
      }
    }
  },
  methods: {
    getHoveredItem (event) {
      const target = event.target
      if (target.tagName === 'SPAN' && target.dataset.tooltip !== undefined) {
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
      if (value.charAt(0) === '(') return value
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
    padding: 0.2em;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .statusbar span {
    font-weight: bolder;
    -webkit-text-stroke: 1px #888;
    -moz-text-stroke: 1px #888;
    -ms-text-stroke: 1px #888;
  }

  .statusbar span span {
    cursor: default;
  }

  .statusbar--element {
    display: inline-block;
    margin-right: 0.8em;
  }

  .statusbar .statusbar--element span {
    font-weight: normal;
    -webkit-text-stroke: unset;
    -moz-text-stroke: unset;
    -ms-text-stroke: unset;
    font-size: 0.95em;
  }

  .statusbar .tooltip {
    position: fixed;
    background: #1f2d3d;
    padding: 0.2em 0.4em;
    color: #fff;
    border-radius: 5px;
    min-width: 4em;
    max-width: 40em;
    text-align: center;
    min-height: 1.2em;
    font-weight: 600;
    line-height: 1.2em;
    z-index: 2;
    /* if overflow is set, the after selector is hidden...
    word-wrap: break-word;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden; */
    font-size: 0.8em;
  }

  .statusbar .tooltip::after {
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
  .statusbar .coloration {
    flex: 1;
  }

  .statusbar .statusbar--contact {
    width: 100%;
  }

  .dashed {
    display: inline-block;
    height: 0;
    width: 20px;
    border-style: dashed;
    border-width: 2px;
    vertical-align: middle;
  }
</style>
