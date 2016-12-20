<template>
  <div>
    Afficher
   <el-button-group>
        <el-button v-on:click="display('sphere')">Sphères</el-button>
        <el-button v-on:click="display('hyperball')">Hyperball</i></el-button>
        <el-button v-on:click="display('licorice')">Bâtonnets</i></el-button>
    </el-button-group>

    <el-button-group>
        <el-button :disabled="nonPolymer" v-on:click="display('ribbon')">Rubans</i></el-button>
        <el-button :disabled="nonPolymer" v-on:click="display('tube')">Squelette</i></el-button>
        <el-button v-on:click="display('hide')">Cacher/Montrer</i></el-button>
    </el-button-group>
  </div>
</template>

<script>
  export default {
    name: 'DisplayMol',
    computed: {
      nonPolymer: function () {
        let sel = this.$store.state.selection
        return (sel === 'hetero' || sel === 'water' || sel === 'saccharide')
      }
    },
    methods: {
      display (displayType) {
        this.$store.dispatch('display', 'displayType')
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