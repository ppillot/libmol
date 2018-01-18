<template>
    <form-item :label="$t('ui.commands.color.label')">
      <el-popover
        ref="pcontact"
        placement="right"
        trigger="click">
        <palette v-model="colors" @color="changeColor"></palette>
      </el-popover>
      <el-select v-model="color">
        <el-option
          :label="$t('ui.commands.color.cpk')"
          value="element">
        </el-option>
        <el-option
          :label="$t('ui.commands.color.by_res')"
          value="resname">
        </el-option>
        <el-option
          :label="$t('ui.commands.color.default')"
          value="default" >
        </el-option>
        <el-option
          :label="$t('ui.commands.color.pick_color')"
          value="palette"
          v-popover:pcontact>
        </el-option>
      </el-select>
    </form-item>
</template>

<script>
import FormItem from './FormItem'
import Palette from './Palette'

export default {
  name: 'contactsTabSettingsColorSelect',
  components: {
    FormItem,
    Palette
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
  data () {
    return {
      colors: '#ff00ff'
    }
  },
  computed: {
    color: {
      set: function (val) {
        this.changeColor(val)
      },
      get: function () {
        if (this.edit > -1) {
          if (this.$store.state.contacts[this.edit].repr[this.repr].color.charAt(0) === '#') {
            return 'palette'
          } else {
            return this.$store.state.contacts[this.edit].repr[this.repr].color
          }
        } else {
          return undefined
        }
      }
    }
  },
  methods: {
    changeColor: function (val) {
      if (val === 'palette') return
      this.$store.dispatch('updateDisplayContact', {
        index: this.edit,
        repr: this.repr,
        param: {
          color: val
        }
      })
    }
  }
}
</script>
