<template>
  <div>
    Sélectionner
   <el-button-group>
        <el-button size="large" v-on:click="sel('*')">Tout</el-button>
        <el-button size="large" :disabled="unselectables.protein" v-on:click="sel('protein')">Protéines</i></el-button>
        <el-button size="large" :disabled="unselectables.nucleic" v-on:click="sel('nucleic')">ADN/ARN</i></el-button>
    </el-button-group>

    <el-button-group>
        <el-button size="large" :disabled="unselectables.saccharide" v-on:click="sel('saccharide')">Glucides</i></el-button>
        <el-button size="large" :disabled="unselectables.water" v-on:click="sel('water')">Eau</i></el-button>
        <el-button size="large" :disabled="unselectables.hetero" v-on:click="sel('hetero')">Autres</i></el-button>
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
        console.log(selector)
        this.$store.dispatch('selection', 'coucou')
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