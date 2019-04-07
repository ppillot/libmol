<template>
    <form-item :label="$t('ui.contacts.displayRadius')">
      <div class="wrapper">
        <el-slider
          v-model="radius"
          :step="0.01"
          :min="0.35"
          :max="0.8"
          />
      </div>
    </form-item>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'contactsTabSettingsWithinRadius',
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
    radius: {
      set: function (val) {
        this.$store.dispatch('updateDisplayContact', {
          index: this.edit,
          param: {
            radius: val * 10
          }
        })
      },
      get: function () {
        if (this.edit > -1) {
          return this.$store.state.contacts[this.edit].repr.vicinity.radius / 10
        } else {
          return undefined
        }
      }
    }
  },
  methods: {
    formatTooltip: function (val) {
      return val
    }
  }
}
</script>

<style scoped>
  .wrapper {
    padding: 0 1em;
  }
</style>
