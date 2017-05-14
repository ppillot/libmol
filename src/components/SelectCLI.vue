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
          @keydown.enter="selectUserSelection"
          @keyup.delete="highlightUserSelection"
          @keydown.down.prevent="highlightSuggestion(1)"
          @keydown.up.prevent="highlightSuggestion(-1)"
          @focus="help('command-line', true)"
          :class="{ invalid: isNotValid }">
        
          <div class="tooltip" v-bind:style="tooltipStyles" @click="hideTooltip(true)" v-if="tooltipEnabled">
            <i class="el-icon-circle-close"></i>
            {{ $t('tooltips.validate_selection') }}
          </div>

          <i class="el-icon-check"
            @click="selectUserSelection" v-if="userSelectionSize > 0"></i>
          <span class="counter" :class="{success: userSelectionSize > 0}">{{ userSelectionSize }}</span>
      <!-- suggestions -->
          <div class="suggest" :style="suggestStyles">
            
              <ul>
                <li
                  v-for="(suggestion, index) in suggestions" 
                  :class="{highlight: (highlightedSuggestion === index)}"
                  @mouseup="replaceBySuggestion(suggestion)"
                  >
                  {{ suggestion }}
                </li>
              </ul>
            
          </div>
      </template>

    <!-- button active after selection, when editing has stopped -->
      <div class="button-like" 
        v-else
        @dblclick.stop="editing" 
        @keydown.enter="editing"
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

  function filter (array, word, startIndex = 0) {
    let filteredArray = []
    let w = word.toUpperCase()

    array.forEach(function (val) {
      let u = val.toUpperCase()
      if (u.indexOf(w) === startIndex) {
        filteredArray.push(val)
      }
    })

    return filteredArray
  }

  function getWordBoundaries (text, caretPos) {
    const wordStartDelimitors = ['(', '.', '[', ' ', ':', '_']
    const wordEndDelimitors = [')', ' ']
    const start = Math.max(...wordStartDelimitors.map(char => {
      const shift = (char === ' ') ? 1 : 0
      return text.lastIndexOf(char, caretPos - 1) + shift
    }))

    const end = Math.min(...wordEndDelimitors.map(char => {
      const pos = text.indexOf(char, caretPos - 1)
      return (pos === -1) ? text.length : pos // if there is no ')' don't consider -1 as a position
    }))

    return [(start > -1) ? start : 0,
      (end > -1) ? end : text.length]
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
        suggestions: [],
        highlightedSuggestion: -1
      }
    },
    computed: {
      selected: function () {
        return this.$store.state.selection === 'user'
      },
      validSelectors: function () {
        let tabRes = []
        const isNumeric = /\d+/
        this.$store.state.mol.residues.forEach(val => {
          tabRes.push(isNumeric.test(val) ? `[${val}]` : val)
        })

        let tabEl = []
        this.$store.state.mol.elements.forEach(val => { tabEl.push('_' + val) })

        let tabAt = this.$store.state.mol.atoms.map(val => { return '.' + val })

        return {
          chains: this.$store.state.mol.chains.reduce((acc, val) => { return acc.concat([':' + val.name]) }, []),
          residues: tabRes,
          elements: tabEl,
          atoms: tabAt
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
      suggestStyles: function () {
        let rect = this.$el.getBoundingClientRect()
        return {
          top: rect.bottom + 'px',
          left: rect.left + 'px',
          'min-width': rect.width + 'px',
          visibility: (this.suggestions.length === 0) ? 'hidden' : 'visible'
        }
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
        // edge case: user is selecting from the suggestions list
        if (this.highlightedSuggestion >= 0) {
          this.replaceBySuggestion(this.suggestions[this.highlightedSuggestion])
          return
        }

        // debugger
        // normal case, validating a selection statement
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
      replaceBySuggestion (suggestion) {
        const input = this.$el.getElementsByTagName('input')[0]
        const caretPos = input.selectionStart
        let text = this.selectionText
        const wordBoundaries = getWordBoundaries(text, caretPos)

        const prefix = text.substring(0, wordBoundaries[0])
        const postfix = (wordBoundaries[1] === -1) ? '' : text.substring(wordBoundaries[1])

        this.selectionText = prefix + suggestion + postfix
        // debugger
        input.focus()
        input.selectionStart = (prefix.length + suggestion.length)
        this.getSuggestions(suggestion)
        this.highlightedSuggestion = -1
      },
      highlightSuggestion (delta) {
        this.highlightedSuggestion += delta
        if (this.highlightedSuggestion < -1) this.highlightedSuggestion = -1
      },
      getSuggestions (val) {
        if (val === '') {
          this.suggestions = []
          // this.highlightedSuggestion = -1
          return
        }
        const input = this.$el.getElementsByTagName('input')[0]
        const text = input.value
        const caretPos = input.selectionStart

        let tabSuggestions = []

        if (text === '' || text.charAt(caretPos - 1) === ' ') {
          // do nothing: empty suggestions
        } else {
          // get last word before caret (and after last word delimiter)
          const wordDelimitor = /[(.[ :_]/
          let word = ''
          let wordStart = caretPos - 1

          while (wordStart >= 0) {
            word = text.charAt(wordStart) + word
            if (wordDelimitor.test(text.charAt(wordStart))) {
              break
            }
            wordStart--
          }

          // debugger
          // check char at wordStart
          switch (word.charAt(0)) {
            case ':': // it begins by ':' --> suggest chain names
              tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.chains, word))
              break
            case '_': // suggest element names
              tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.elements, word))
              break
            case '.': // suggest atoms names
              tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.atoms, word))
              break
            case '[': // suggest res names
              tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.residues, word))
              break
            default:
              if (/^[ ]/.test(word)) {
                word = word.substring(1)
              }
              if (/^[a-zA-Z]+$/.test(word)) {
                tabSuggestions = tabSuggestions.concat(filter(keywords, word))
                tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.residues, word))
                tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.chains, word, 1))
                tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.elements, word, 1))
                tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.atoms, word, 1))
                // debugger
              } else {
                tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.residues, word, 1))
                tabSuggestions = tabSuggestions.concat(filter(this.validSelectors.atoms, word, 1))
                // debugger
              }
          }
        }
        this.suggestions = tabSuggestions
        // this.highlightedSuggestion = -1
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
    width: 30em;
    background: white;
    border: 1px solid #d1dbe5;
    z-index: 3;
    border-radius: 4px;
    margin: -1px 0 0 6px;
    max-height: 15em;
    overflow: scroll;
  }

  .suggest ul {
    width: 100%;
    margin: 0;
    list-style: none;
    padding: 0;
    overflow: hidden;
  }
  .suggest ul li {
    width: 100%;
    border-bottom: 1px solid #eee;
    padding: 4px;
    cursor: pointer;
    font-family: Courier New, Courier, monospace;
  }
  .suggest li:hover, .suggest li.highlight {
    background: #20A0FF;
    color: #fff;
    cursor: pointer;
  }
  li:hover code {
    color: #fff;
  }
</style>
