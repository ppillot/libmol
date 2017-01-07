<template>
  <div>
    {{ $t('ui.commands.select.label') }}
   <el-button-group>
        <el-button v-on:click="sel('*')">{{ $t('ui.commands.select.all') }}</el-button>
        <el-button :disabled="unselectables.protein" v-on:click="sel('protein')">{{ $t('ui.commands.select.protein') }}</el-button>
        <el-button :disabled="unselectables.nucleic" v-on:click="sel('nucleic')">{{ $t('ui.commands.select.nucleic') }}</el-button>
    </el-button-group>

    <el-button-group>
        <el-button :disabled="unselectables.saccharide" v-on:click="sel('saccharide')">{{ $t('ui.commands.select.carbohydrate') }}</el-button>
        <el-button :disabled="unselectables.water" v-on:click="sel('water')">{{ $t('ui.commands.select.water') }}</el-button>
        <el-button :disabled="unselectables.hetero" v-on:click="sel('hetero')">{{ $t('ui.commands.select.hetero') }}</el-button>
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