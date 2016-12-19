<template>
  <div>
    Sélectionner
    <el-button-group>
        <el-button size="large">Tout</el-button>
        <el-button size="large" :disabled="unselectables.protein">Protéines</i></el-button>
        <el-button size="large" :disabled="unselectables.nucleic">ADN/ARN</i></el-button>
    </el-button-group>

    <el-button-group>
        <el-button size="large" :disabled="unselectables.saccharide">Glucides</i></el-button>
        <el-button size="large" :disabled="unselectables.water">Eau</i></el-button>
        <el-button size="large" :disabled="unselectables.hetero">Autres</i></el-button>
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
      handleSelect (item) {
        this.$store.dispatch('loadNewFile', item)
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