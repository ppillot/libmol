<template>
  <div class="button-panel">
    <div class="header-search">
      <span>{{$t('ui.commands.select.label')}}</span>
      <select-cli></select-cli>
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
  </div>
</template>

<script>
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'
  import SelectCli from './SelectCLI'
  function fixHetero (val) {
    return (val.indexOf('hetero') > -1) ? val.replace('hetero', 'hetero and not (water or saccharide)') : val
  }
  export default {
    name: 'SelectMol',
    components: {
      ButtonGroup,
      RadioButton,
      SelectCli
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
      help (selector, active) {
        this.$store.dispatch('help', {
          action: 'select',
          attribute: selector,
          active: active,
          namespace: 'commands'
        })
      },
      toggle (selector) {
        this.$store.dispatch('togglePresetVisibility', fixHetero(selector))
      }
    }
  }
</script>

<style scoped>
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
  }
  .radio-button i {
    display: inline-block;
    border-radius: 100px;
    position: absolute;
    color: #8492A6;
    right: 0;
    padding: 0 4px;
    transition: all 0.3s cubic-bezier(.645,.045,.355,1);
  }
  .radio-button i:hover {
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
    height: 2em;
  }
</style>
