<template>
  <div>
    {{ $t('ui.commands.select.label') }}
   <el-button-group>
        <el-button  @mouseover="highlight('*')" 
                    @mouseout="highlight('none')" 
                    @click="sel('*')">
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
                    @click="sel('hetero')"
                    @mouseenter="highlight('hetero')" 
                    @mouseleave="highlight('none')">
          {{ $t('ui.commands.select.hetero') }}
        </el-button>
    </el-button-group>
  </div>
</template>

<script>
  export default {
    name: 'SelectMol',
    computed: {
      unselectables: function () {
        let absent = {}
        for (let item in this.$store.state.mol.molTypes) {
          if (this.$store.state.mol.molTypes.hasOwnProperty(item)) {
            absent[item] = !this.$store.state.mol.molTypes[item]
          }
        }
        return absent
      }
    },
    methods: {
      sel (selector) {
        this.$store.dispatch('selection', selector)
      },
      highlight (selector) {
        console.log(selector)
        this.$store.dispatch('highlightSelectHovered', selector)
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
</style>