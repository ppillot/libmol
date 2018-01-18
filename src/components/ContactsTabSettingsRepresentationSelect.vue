<template>
    <form-item :label="$t('ui.commands.representation.label')">
      <el-select v-model="representation">
        <el-option
          :label="$t('ui.commands.representation.spacefill')"
          value="spacefill">
        </el-option>
        <el-option
          :label="$t('ui.commands.representation.balls_and_sticks')"
          value="ball+stick" >
        </el-option>
        <el-option
          :label="$t('ui.commands.representation.sticks')"
          value="licorice">
        </el-option>
      </el-select>
    </form-item>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'contactsTabSettingsRepresentationSelect',
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
    representation: {
      set: function (val) {
        this.$store.dispatch('updateDisplayContact', {
          index: this.edit,
          repr: this.repr,
          param: {
            reprName: val
          }
        })
      },
      get: function () {
        if (this.edit > -1) {
          return this.$store.state.contacts[this.edit].repr[this.repr].reprName
        } else {
          return undefined
        }
      }
    }
  }
}
</script>
