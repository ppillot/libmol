<template>
  <div>
    {{ $t('ui.commands.display.label') }}
   <el-button-group>
        <el-button v-on:click="display('spacefill')">{{ $t('ui.commands.display.spacefill') }}</el-button>
        <el-button v-on:click="display('ball+stick')">{{ $t('ui.commands.display.balls_and_sticks') }}</el-button>
        <el-button v-on:click="display('licorice')">{{ $t('ui.commands.display.sticks') }}</el-button>
    </el-button-group>

    <el-button-group v-if="complete">
        <el-button :disabled="nonPolymer" v-on:click="display('cartoon')">{{ $t('ui.commands.display.cartoon') }}</el-button>
        <el-button :disabled="nonPolymer" v-on:click="display('tube')">{{ $t('ui.commands.display.backbone') }}</el-button>
        <el-button v-on:click="hide">{{ $t('ui.commands.display.hide') }}</el-button>
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
      },
      hide () {
        this.$store.dispatch('hide')
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
