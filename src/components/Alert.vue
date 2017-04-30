<template>
  <el-dialog
    :title="$t('ui.alert.error')"
    v-model="dialogVisible"
    size="small">
    <template v-if="type === 'old_file'">
      <span>{{ $t('ui.alert.old_file_msg') }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('ui.alert.cancel')}}</el-button>
        <el-button type="primary" @click="downloadPDB(token.molId)">
          {{ $t('ui.alert.old_file_download') }} {{ token.molId }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
  export default {
    name: 'Alert',
    computed: {
      type: function () {
        return (this.$store.state.alert.type)
      },
      token: function () {
        return (this.$store.state.alert.token)
      },
      dialogVisible: {
        get () {
          return (this.$store.state.alert.type !== '')
        },
        set (value) {
          if (!value) this.$store.commit('alert', {type: '', token: {}})
        }
      }
    },
    methods: {
      handleClose (done) {
        this.$confirm('Are you sure to close this dialog?')
          .then(_ => {
            done()
          })
          .catch(_ => {})
      },
      downloadPDB (molId) {
        this.$store.dispatch('loadNewFile', {
          value: molId,
          file: 'rcsb://' + molId,
          molId: molId
        })
        this.dialogVisible = false
      }
    }
  }
</script>

<style>
  
</style>
