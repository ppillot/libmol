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
        
          <!--<div class="tooltip" v-bind:style="tooltipStyles">
            Valider la sélection pour la rendre active (Touche entrée ou clic sur cette icône)
          </div>-->

          <i class="el-icon-check"
            @click="selectUserSelection" v-if="userSelectionSize > 0"></i>
          <span class="counter" :class="{success: userSelectionSize > 0}">{{ userSelectionSize }}</span>
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
<!-- Suggestion div -->
    <div id="cli-suggest" >

    </div>
<!-- activate/deactivate button -->
    <i :class="{'el-icon-search': isTextSearchDisabled, 'el-icon-circle-close': !isTextSearchDisabled}"
      @click="toggleUserSelection"></i>
  </div>
</template>

<script>
  import {Selection} from 'ngl'

  function isNGLValid (sele) {
    const sel = new Selection(sele)
    return sel.test !== false
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
        }
      }
    },
    computed: {
      selected: function () {
        return this.$store.state.selection === 'user'
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
          // this.getHoveredItem(this.$el.getElementsByClassName('el-icon-check')[0])
        }
        if (go) {
          this.help('command-line', false)
        }
      },
      selectUserSelection () {
        if (this.isValid && this.selectionText !== '' && this.$store.state.userSelectionSize > 0) {
          this.$store.dispatch('selection', this.selectionText)
          this.isEditing = false
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
      getHoveredItem (target) {
        this.tooltipStyles = getTooltipStyles(target)
      },
      hideTooltip () {
        this.tooltipStyles.visibility = 'hidden'
      }
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
    background: #fff;
    padding: 0.8em;
    color: #2c3e50;
    border-radius: 5px;
    min-width: 4em;
    max-width: 30em;
    text-align: center;
    min-height: 1.2em;
    line-height: 1.2em;
    z-index: 2;
    word-wrap: break-word;
    font-size: 1em;
    box-shadow: 1px 1px 1px #eee;
  }
  
  .tooltip:after {
    left: 1em;
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
