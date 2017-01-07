<template>
  <div>
    {{ $t('ui.commands.color.label') }}
   <el-button-group>
        <el-button v-on:click="color('element')">{{ $t('ui.commands.color.cpk') }}</el-button>
        <el-button :disabled="nonPolymer" v-on:click="color('chainname')">{{ $t('ui.commands.color.by_chain') }}</el-button>
        <el-button :disabled="nonPolymer" v-on:click="color('resname')">{{ $t('ui.commands.color.by_res') }}</el-button>
    </el-button-group>
    <el-popover
      ref="palette"
      placement="right"
      trigger="click">
      <compact-picker v-model="colors" @change-color="pickColor"></compact-picker>
    </el-popover>
    <el-button-group>
        <el-button :disabled="noSStruc" v-on:click="color('sstruc')">{{ $t('ui.commands.color.by_secondary_structure') }}</el-button>
        <el-button :disabled="notAll" v-on:click="color('moleculetype')">{{ $t('ui.commands.color.by_biochemical_nature') }}</el-button>
        <el-button v-popover:palette>{{ $t('ui.commands.color.pick_color') }}</el-button>
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