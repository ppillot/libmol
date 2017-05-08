<template>
  <div class="cli-container">
<!-- container of the input box and its controls -->
    <div class="text-search" 
      :class="{'radio-button': !isEditing, active: selected && !isEditing}"
      @mouseover="highlightUserSelection"
      @mouseout="highlightUserSelection(false)"
      v-if="!isTextSearchDisabled">

    <!-- text box active when editing -->  
      <template v-if="isEditing">
        <input type="text"
          spellcheck="false"
          v-model="selectionText"
          @keyup.enter="selectUserSelection"
          @keyup.delete="highlightUserSelection"
          @focus="help('command-line', true)"
          :class="{ invalid: isNotValid }">
        
          <div class="tooltip" v-bind:style="tooltipStyles" @click="hideTooltip(true)" v-if="tooltipEnabled">
            <i class="el-icon-circle-close"></i>
            {{ $t('tooltips.validate_selection') }}
          </div>

          <i class="el-icon-check"
            @click="selectUserSelection" v-if="userSelectionSize > 0"></i>
          <span class="counter" :class="{success: userSelectionSize > 0}">{{ userSelectionSize }}</span>

          <div class="suggest">
            <table>
              <tr v-for="suggestion in suggestions">
                <td class="suggest-keyword">{{ suggestion }}</td>
                <td></td>
              </tr>
            </table>
          </div>
      </template>

    <!-- button active after selection, when editing has stopped -->
      <div class="button-like" 
        v-else
        @dblclick.stop="editing" 
        @keyup.enter="editing"
        @click.stop="selectUserSelection"
        tabindex="0">
        <span>"{{ selectionText }}"</span>
        <i class="el-icon-edit"  
        @click.stop="editing"></i>
      </div>
    </div>
<!-- container end -->

<!-- activate/deactivate button -->
    <i :class="{'el-icon-search': isTextSearchDisabled, 'el-icon-circle-close': !isTextSearchDisabled}"
      @click="toggleUserSelection"></i>
  </div>
</template>

<script>
  import {Selection} from 'ngl'
  let keywords = [
    'and',
    'or',
    'not',
    'all',
    'sidechain',
    'sidechainAttached',
    'backbone',
    'protein',
    'nucleic',
    'rna',
    'dna',
    'hetero',
    'ion',
    'saccharide',
    'sugar',
    'polymer',
    'water',
    'hydrogen',
    'helix',
    'sheet',
    'turn',
    'small',
    'nucleophilic',
    'hydrophobic',
    'aromatic',
    'amid',
    'acidic',
    'basic',
    'charged',
    'polar',
    'nonpolar'
  ]

  function filter (array, word) {
    let filteredArray = []
    let w = word.toUpperCase()

    array.forEach(function (val) {
      let u = val.toUpperCase()
      if (u.indexOf(w) === 0) {
        filteredArray.push(val)
      }
    })

    return filteredArray
  }

  function isNGLValid (sele) {
    const sel = new Selection(sele)
    return sel.test !== false
  }

  function getTooltipStyles (target, root) {
    if (target === undefined) {
      return {
        visibility: 'hidden'
      }
    }
    let rect = target.getBoundingClientRect()
    let bigRect = root.getBoundingClientRect()
    return {
      bottom: 'calc(' + (bigRect.height - rect.top) + 'px + 0.7em)',
      left: 'calc(' + rect.left + 'px - 10.3em)',
      visibility: 'visible'
    }
  }
  export default {
    name: 'SelectCLI',
    data: function () {
      return {
        isTextSearchDisabled: true,
        isEditing: true,
        isValid: false,
        tooltipStyles: {
          top: '0px',
          left: '0px',
          visibility: 'hidden'
        },
        tooltipEnabled: true,
        suggestions: []
      }
    },
    computed: {
      selected: function () {
        return this.$store.state.selection === 'user'
      },
      validSelectors: function () {
        let tabRes = []
        console.log(this.$store.state.mol.residues)
        this.$store.state.mol.residues.forEach(val => { tabRes.push(val) })

        let tabEl = []
        this.$store.state.mol.elements.forEach(val => { tabEl.push(val) })
        return {
          chains: this.$store.state.mol.chains.reduce((acc, val) => { return acc.concat([':' + val.name]) }, []),
          residues: tabRes,
          elements: tabEl
        }
      },
      visible: function () {
        return this.$store.state.visible
      },
      isNotValid: function () {
        return (this.isValid === false && this.selectionText.length > 0)
      },
      userSelectionSize: function () {
        return (this.$store.state.userSelectionSize)
      },
      selectionText: {
        set: function (value) {
          this.$store.commit('setUserSelectionText', value)
          this.getSuggestions(value)
          if (value !== '') {
            this.isValid = isNGLValid(value)
            if (this.isValid) {
              this.$store.dispatch('userSelection', value)
            }
          }
        },
        get: function () {
          return (this.$store.state.userSelectionText)
        }
      }
    },
    methods: {
      highlightUserSelection (go = true) {
        if (this.selectionText === '' || !this.isValid) {
          this.$store.commit('userSelectionSize', 0)
          this.$store.dispatch('highlightUserSelection', 'none')
          return
        }
        if (this.isValid && this.selectionText !== '') {
          this.$store.dispatch('highlightUserSelection', (go) ? this.selectionText : 'none')
        }
        if (go) {
          this.help('command-line', false)
        }
      },
      selectUserSelection () {
        if (this.isValid && this.selectionText !== '' && this.$store.state.userSelectionSize > 0) {
          this.$store.dispatch('selection', this.selectionText)
          this.isEditing = false
          this.hideTooltip(true)
          this.$nextTick(function () {
            this.$el.getElementsByClassName('button-like')[0].focus()
          }.bind(this))
        }
      },
      editing () {
        this.isEditing = true
        this.$nextTick(function () {
          this.$el.getElementsByTagName('input')[0].focus()
          this.$el.getElementsByTagName('input')[0].select()
        }.bind(this))
      },
      toggleUserSelection () {
        this.isTextSearchDisabled = !this.isTextSearchDisabled
        this.selectionText = ''
        if (!this.isTextSearchDisabled) {
          this.$nextTick(function () {
            this.$el.getElementsByTagName('input')[0].focus()
          }.bind(this))
        } else {
          this.isEditing = true
          this.$store.commit('userSelectionSize', 0)
          this.tooltipStyles.visibility = 'hidden'
        }
      },
      help (selector, active) {
        this.$store.dispatch('help', {
          action: 'select',
          attribute: selector,
          active: active
        })
      },
      toggleUserSelectionVisibility () {
        this.$store.dispatch('hide', {sele: this.selectionText, action: 'hide'})
      },
      hideTooltip (forever = false) {
        this.tooltipStyles.visibility = 'hidden'
        if (forever) {
          this.unwatch()
          // this.tooltipEnabled = false
        }
      },
      displayTooltip () {
        if (this.tooltipEnabled) {
          const target = this.$el.getElementsByClassName('el-icon-check')[0]
          this.tooltipStyles = getTooltipStyles(target, this.$root.$el)
        }
      },
      getSuggestions (val) {
        if (val === '') {
          return
        }
        const input = this.$el.getElementsByTagName('input')[0]
        const text = input.value
        const carretPos = input.selectionStart

        let tabSuggestions = []

        if (text === '' || text.charAt(carretPos - 1) === ' ') {
          // do nothing: empty suggestions
        } else {
          // get last word before carret (and after last space)
          let word = text.substring(text.lastIndexOf(' '), carretPos)

          // check last char
          const last = word.charAt(word.length - 1)
          switch (last) {
            case ':': // it finishes by ':' --> suggest chain names
              tabSuggestions = tabSuggestions.concat(this.validSelectors.chains)
              break
            case '#': // suggest element names
              tabSuggestions = tabSuggestions.concat(this.validSelectors.elements)
              break
            default:
              if (/^\w+$/.test(word)) {
                tabSuggestions = tabSuggestions.concat(filter(keywords, word))
                tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.residues, word))
              }
          }
        }
        this.suggestions = tabSuggestions
      }
    },
    mounted: function () {
      this.unwatch = this.$watch(function () {
        return this.userSelectionSize
      }, function (val) {
        if (val > 0) {
          this.displayTooltip()
        }
      })
    }
  }
</script>

<style scoped>
  .cli-container {
    display: inline-flex;
    flex: 1;
  }
  .button-like {
    position: relative;
    justify-content: center;
    width: 100%;
    display: inline-flex;
    outline: none;
  }
  .button-like span {
    max-width: calc(100% - 2em);
    text-overflow: ellipsis;
    overflow: hidden;
    height: 2em;
    word-break: break-all;
    font-family: Courier New, Courier, monospace;
  }
  .button-like i {
    position: absolute;
    right: 0;
  }
  .radio-button {
    position: relative;
  }
  .radio-button.active i {
    color: #fff;
  }
  .radio-button.active i:hover {
    background: white;
    color: #20A0FF;
  }
  i {
    color: #8492A6;
    cursor: pointer;
    padding: 0 0 0 4px;
    align-self: center;
  }
  .radio-button i {
    display: inline-block;
    border-radius: 100px;
    position: absolute;
    color: #8492A6;
    right: 0;
    padding: 0 4px;
  }
  .radio-button i:hover {
    background: #20A0FF;
    color: #fff;
  }

  .button-panel {
    margin-bottom: 1.2em;
    font-size: 14px;
  }
  .text-search {
    flex: 1;
    display: inline-flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    margin: 2px 0 2px 0.5em;
    height: 1.8em;
    padding: 0 2px 0 5px;
    border: solid 1px #d1dbe5;
    border-radius: 5px;
    overflow: hidden;
  }
  .text-search:hover {
    border-color: #58b7ff;
  }
  .text-search i {
    position: initial;
  }
  .text-search input {
    border: none;
    flex: 1;
    font-size: 1em;
    font-weight: normal;
    color: #2c3e50;
    font-family: Courier New, Courier, monospace
  }
  .text-search input:focus {
    box-shadow: none;
    outline: none;
  }
  .text-search input.invalid {
    color: #FF4949;
  }
  .text-search.radio-button {
    border-radius: 0;
  }
  .text-search.radio-button.active {
    border: #20A0FF;
  }
  .counter {
    font-size: 0.8em;
    font-weight: bold;
    color: #fff;
    background: #8492a6;
    border-radius: 10px;
    padding: 0 5px;
    min-width: initial;
  }
  .el-icon-circle-close:hover {
    color: #FF4949
  }
  .el-icon-search:hover {
    color: #20A0FF
  }
  .el-icon-check {
    color: #C0CCDA
  }
  .el-icon-check:hover {
    color: #20A0FF;
  }
  .el-icon-edit {
    line-height: 2em;
  }
  .success {
    background-color: #13CE66;
  }

  .tooltip {
    position: fixed;
    background: #2c3e50;
    padding: 0.8em;
    color: #fff;
    opacity: 0.8;
    border-radius: 5px;
    min-width: 4em;
    max-width: 20em;
    text-align: center;
    min-height: 1.2em;
    line-height: 1.2em;
    z-index: 2;
    word-wrap: break-word;
    font-size: 1em;
  }
  
  .tooltip:after {
    left: 50%;
    top: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(47, 64, 74, 0);
    border-top-color: #2c3e50;
    border-width: 5px;
    margin-top: 0;
  }
  
  .tooltip i {
    float: right;
    margin: -5px -5px 0 0
  }

  .suggest {
    position: fixed;
    width: 600px;
    top: 11em;
    left: 10em;
    background: white;
    border: 1px solid #aaa;
    z-index: 3;
  }
</style>
