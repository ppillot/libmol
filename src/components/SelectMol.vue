<template>
  <div>
   <form-item :label="$t('ui.commands.select.label')">
   <!--<el-button-group>
        <el-button  @mouseover="highlight('all')" 
                    @mouseout="highlight('none')" 
                    @click="sel('all')">
          {{ $t('ui.commands.select.all') }}
        </el-button>
        <el-button :disabled="unselectables.protein" 
                    @click="sel('protein')" 
                    @mouseenter="highlight('protein')" 
                    @mouseleave="highlight('none')">
          {{ $t('ui.commands.select.protein') }}
        </el-button>
        <el-button :disabled="unselectables.nucleic" 
                    @click="sel('nucleic')"
                    @mouseenter="highlight('nucleic')" 
                    @mouseleave="highlight('none')">
          {{ $t('ui.commands.select.nucleic') }}
        </el-button>
    </el-button-group>

    <el-button-group>
        <el-button :disabled="unselectables.saccharide" 
                    @click="sel('saccharide')"
                    @mouseenter="highlight('saccharide')" 
                    @mouseleave="highlight('none')">
          {{ $t('ui.commands.select.carbohydrate') }}
        </el-button>
        <el-button :disabled="unselectables.water" 
                    @click="sel('water')"
                    @mouseenter="highlight('water')" 
                    @mouseleave="highlight('none')">
          {{ $t('ui.commands.select.water') }}
        </el-button>
        <el-button :disabled="unselectables.hetero" 
                    @click="sel('hetero and not water')"
                    @mouseenter="highlight('hetero and not water')" 
                    @mouseleave="highlight('none')">
          {{ $t('ui.commands.select.hetero') }}
        </el-button>
    </el-button-group>-->
    <button-group :active-value="selected" @change="sel">
      <radio-button value="all">{{ $t('ui.commands.select.all') }}</radio-button>
      <radio-button value="protein" :disabled="unselectables.protein">{{ $t('ui.commands.select.protein') }}</radio-button>
      <radio-button value="nucleic" :disabled="unselectables.nucleic">{{ $t('ui.commands.select.nucleic') }}</radio-button>
      <radio-button value="carbohydrate" :disabled="unselectables.saccharide">{{ $t('ui.commands.select.carbohydrate') }}</radio-button>
      <radio-button value="water" :disabled="unselectables.water">{{ $t('ui.commands.select.water') }}</radio-button>
      <radio-button value="hetero" :disabled="unselectables.hetero">{{ $t('ui.commands.select.hetero') }}</radio-button>
    </button-group>
   </form-item>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'

  export default {
    name: 'SelectMol',
    components: {
      FormItem,
      ButtonGroup,
      RadioButton
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
      }
    },
    methods: {
      sel (selector) {
        console.log(selector)
        this.$store.dispatch('selection', selector)
      },
      highlight (selector) {
        console.log(selector)
        this.$store.dispatch('highlightSelectHovered', selector)
      },
      h (event) {
        console.log('coucou', event)
      }
    }
  }
</script>

<style scoped>
  div.el-button-group {
    width: 100%
  }
  .el-button {
    width: 33%
  }
  .button-group {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .radio-button {
    flex-basis: 9em;
    flex-grow: 1;
    line-height: 2em;
    border: solid #d1dbe5 1px;
    margin: 0 0 -1px -1px;
    padding: 0;
    text-align: center;
  }
</style>
