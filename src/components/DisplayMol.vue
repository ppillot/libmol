<template>
  <div>
    Afficher
   <el-button-group>
        <el-button v-on:click="display('spacefill')">Sphères</el-button>
        <el-button v-on:click="display('ball+stick')">Boules et bâtonnets</el-button>
        <el-button v-on:click="display('licorice')">Bâtonnets</el-button>
    </el-button-group>

    <el-button-group v-if="complete">
        <el-button :disabled="nonPolymer" v-on:click="display('cartoon')">Rubans</el-button>
        <el-button :disabled="nonPolymer" v-on:click="display('tube')">Squelette</el-button>
        <el-button v-on:click="display('hide')">Cacher/Montrer</el-button>
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
        this.$store.dispatch('display', displayType)
      }
    },
    props: {
      // wether we display the full component or not
      complete: {
        type: Boolean,
        default: true,
        required: false
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