<template>
    <form-item :label="$t('ui.contacts.sizeLabel')" inline>
      <input
          v-model="radius"
          type="number"
          step="1"
          min="2"
          max="9"
          />
    </form-item>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'contactsTabSettingsLabelSize',
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
          repr: 'label',
          param: {
            size: val
          }
        })
      },
      get: function () {
        if (this.edit > -1) {
          return this.$store.state.contacts[this.edit].repr.label.size
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
  input {
    width: 3em;
    text-align: center;
    border-radius: 3px;
    line-height: 1.5em;
    font-size: 1em;
    color: #4e5e6f;
    border: 1px solid #dddfe7;
  }
  input:focus {
    outline: none;
    border: #3e9eff 1px solid;
  }
</style>
