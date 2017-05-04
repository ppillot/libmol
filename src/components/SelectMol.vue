<template>
  <div class="button-panel">
    <div class="header-search">
      <span>{{$t('ui.commands.select.label')}}</span>
      <div class="text-search" @mouseover="highlightUserSelection" @mouseout="highlightUserSelection(false)">
        <input type="text"
          spellcheck="false"
          v-model="selectionText"
          @keyup.enter="selectUserSelection"
          @focus="help('command-line', true)"
          :class="{ invalid: isNotValid }">
        <span class="counter" v-if="userSelectionSize > 0">{{ userSelectionSize }}</span>
        <i class="el-icon-search"></i></div>
    </div>
    <button-group :active-value="selected" @change="sel" @hover="highlight">
      <radio-button value="all">{{ $t('ui.commands.select.all') }}
        <i :class="[visible['all'] ? 'icon-eye' : 'icon-eye-off']" 
        @click.stop="toggle('all')"></i>
      </radio-button>
      <radio-button value="protein" :disabled="unselectables.protein">
        {{ $t('ui.commands.select.protein') }} 
        <i :class="[visible['protein'] ? 'icon-eye' : 'icon-eye-off']" 
        v-if="!unselectables.protein" 
        @click.stop="toggle('protein')"></i>
      </radio-button>
      <radio-button value="nucleic" :disabled="unselectables.nucleic">
        {{ $t('ui.commands.select.nucleic') }}
        <i :class="[visible['nucleic'] ? 'icon-eye' : 'icon-eye-off']" 
        v-if="!unselectables.nucleic"
        @click.stop="toggle('nucleic')"></i>
      </radio-button>
      <radio-button value="saccharide" :disabled="unselectables.saccharide">
        {{ $t('ui.commands.select.carbohydrate') }}
        <i :class="[visible['saccharide'] ? 'icon-eye' : 'icon-eye-off']" 
        v-if="!unselectables.saccharide"
        @click.stop="toggle('saccharide')"></i>
      </radio-button>
      <radio-button value="water" :disabled="unselectables.water">
        {{ $t('ui.commands.select.water') }}
        <i :class="[visible['water'] ? 'icon-eye' : 'icon-eye-off']" 
        v-if="!unselectables.water"
        @click.stop="toggle('water')"></i>
      </radio-button>
      <radio-button value="hetero" :disabled="unselectables.hetero">
        {{ $t('ui.commands.select.hetero') }}
        <i :class="[visible['hetero'] ? 'icon-eye' : 'icon-eye-off']" 
        v-if="!unselectables.hetero"
        @click.stop="toggle('hetero')"></i>
      </radio-button>
    </button-group>
   </form-item>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'
  function fixHetero (val) {
    return (val.indexOf('hetero') > -1) ? val.replace('hetero', 'hetero and not (water or saccharide)') : val
  }
  export default {
    name: 'SelectMol',
    components: {
      FormItem,
      ButtonGroup,
      RadioButton
    },
    data: function () {
      return {
        selectionText: ''
      }
    },
    computed: {
      unselectables: function () {
        let absent = {}
        for (let item in this.$store.state.mol.molTypes) {
          if (this.$store.state.mol.molTypes.hasOwnProperty(item)) {
            absent[item] = !this.$store.state.mol.molTypes[item]
          }
        }
        return absent
      },
      selected: function () {
        return this.$store.state.selection
      },
      visible: function () {
        return this.$store.state.visible
      },
      isNotValid: function () {
        return (this.$store.state.isUserSelectionValid === false && this.selectionText.length > 0)
      },
      userSelectionSize: function () {
        return (this.$store.state.userSelectionSize)
      }
    },
    methods: {
      sel (selector) {
        this.$store.dispatch('selection', fixHetero(selector))
        this.help(selector, true)
      },
      highlight (selector) {
        this.help(selector, false)
        if (selector === undefined) selector = 'none'
        this.$store.dispatch('highlightSelectHovered', fixHetero(selector))
      },
      highlightUserSelection (go = true) {
        if (this.$store.state.isUserSelectionValid && this.selectionText !== '') {
          this.$store.dispatch('highlightUserSelection', (go) ? this.selectionText : 'none')
        }
        if (go) {
          this.help('command-line', false)
        }
      },
      selectUserSelection () {
        if (this.$store.state.isUserSelectionValid && this.selectionText !== '') {
          this.$store.dispatch('selection', this.selectionText)
        }
      },
      help (selector, active) {
        this.$store.dispatch('help', {
          action: 'select',
          attribute: selector,
          active: active
        })
      },
      toggle (selector) {
        this.$store.dispatch('togglePresetVisibility', fixHetero(selector))
      }
    },
    watch: {
      selectionText: function (value) {
        if (value !== '') this.$store.dispatch('userSelection', value)
      }
    }
  }
</script>

<style scoped>
  .radio-button {
    position: relative;
  }
  .active i {
    color: #fff;
  }
  .active i:hover {
    background: white;
    color: #20A0FF;
  }
  i {
    display: inline-block;
    border-radius: 100px;
    position: absolute;
    color: #8492A6;
    right: 0;
    padding: 0 4px;
  }
  i:hover {
    background: #20A0FF;
    color: #fff;
  }

  .button-panel {
    margin-bottom: 1.2em;
    font-size: 14px;
  }
  .header-search {
    display: inline-flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
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
  }
  .text-search input:focus {
    box-shadow: none;
    outline: none;
  }
  .text-search input.invalid {
    color: #FF4949;
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
</style>
