<template>
    <form-item :label="$t('ui.contacts.displayLabels')">
      Off
      <el-switch
        v-model="labelVisibility" />
      On
    </form-item>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'contactsTabContactsSettingsLabels',
  components: {
    FormItem
  },
  props: {
    edit: {
      default: -1,
      type: Number
    }
  },
  computed: {
    labelVisibility: {
      set: function (val) {
        this.$store.dispatch('updateDisplayContact', {
          index: this.edit,
          repr: 'label',
          param: {
            visible: val
          }
        })
      },
      get: function () {
        if (this.edit > -1) {
          return this.$store.state.contacts[this.edit].repr.label.visible
        } else {
          return undefined
        }
      }
    }
  }
}
</script>
