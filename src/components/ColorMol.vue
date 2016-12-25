<template>
  <div>
    Colorer
   <el-button-group>
        <el-button v-on:click="color('element')">Atomes</el-button>
        <el-button :disabled="nonPolymer" v-on:click="color('chainname')">Chaînes</el-button>
        <el-button :disabled="nonPolymer" v-on:click="color('resname')">Résidu</el-button>
    </el-button-group>
    <el-popover
      ref="palette"
      placement="right"
      trigger="click">
      <compact-picker v-model="colors" @change-color="pickColor"></compact-picker>
    </el-popover>
    <el-button-group>
        <el-button :disabled="noSStruc" v-on:click="color('sstruc')">Structure</el-button>
        <el-button :disabled="notAll" v-on:click="color('moleculetype')">Nature</el-button>
        <el-button v-popover:palette>Palette</el-button>
    </el-button-group>
  </div>
</template>

<script>
  import { Compact } from 'vue-color'

  export default {
    name: 'ColorMol',
    data () {
      return {
        colors: {hex: '#00ff00'}
      }
    },
    components: {
      'compact-picker': Compact
    },
    computed: {
      nonPolymer: function () {
        let sel = this.$store.state.selection
        return (sel === 'hetero' || sel === 'water' || sel === 'saccharide')
      },
      noSStruc: function () {
        return (this.$store.state.selection !== 'protein' && this.$store.state.display !== 'cartoon')
      },
      notAll: function () {
        return (this.$store.state.selection !== '*')
      }
    },
    methods: {
      color (colorScheme) {
        this.$store.dispatch('color', colorScheme)
      },
      pickColor (val) {
        this.$store.dispatch('color', val.hex)
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