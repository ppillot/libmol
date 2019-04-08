<!-- Note about the dialog component: according to docs it should trigger a close
event, but instead triggers a 'visible-change' event which is useless
I plugged the open/close emission with the update:visible event-->
<template>
    <el-dialog
        :title="$t('ui.about.title')"
        :visible="visible"
        width="70%"
        @update:visible="val => $emit((val === true) ? 'open' : 'close')">
        <div v-html="about" class="help"></div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="$emit('close')" type="primary" icon="close">{{ $t('ui.about.close') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Marked from 'marked'

export default {
  name: 'AboutPanel',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    about: function () {
      return Marked(this.$t('help.about'))
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    .el-dialog {
        height: 80%;
        overflow: auto;
        padding: 1em;
    }
</style>
