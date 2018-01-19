<template>
    <form-item :label="$t(label)" inline>
      <el-switch
        v-model="visibility" />
    </form-item>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'contactsTabContactsSettingsVisibilitySwitch',
  components: {
    FormItem
  },
  props: {
    edit: {
      default: -1,
      type: Number
    },
    repr: {
      type: String,
      required: true
    }
  },
  computed: {
    label: function () {
      let l = 'ui.contacts.display'
      l += this.repr.charAt(0).toUpperCase()
      l += this.repr.substring(1)
      return l
    },
    visibility: {
      set: function (val) {
        this.$store.dispatch('updateDisplayContact', {
          index: this.edit,
          repr: this.repr,
          param: {
            visible: val
          }
        })
      },
      get: function () {
        if (this.edit > -1) {
          return this.$store.state.contacts[this.edit].repr[this.repr].visible
        } else {
          return undefined
        }
      }
    }
  }
}
</script>
