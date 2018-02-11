<template>
    <form-item :label="$t('ui.contacts.includeWater')" inline>
      <el-switch
        v-model="included" />
    </form-item>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'contactsTabSettingsWaterSwitch',
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
    included: {
      set: function (val) {
        this.$store.dispatch('updateDisplayContact', {
          index: this.edit,
          param: {
            isWaterExcluded: !val
          }
        })
      },
      get: function () {
        if (this.edit > -1) {
          return !this.$store.state.contacts[this.edit].params.isWaterExcluded
        } else {
          return undefined
        }
      }
    }
  }
}
</script>
