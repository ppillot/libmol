<template>
    <form-item :label="$t('ui.commands.color.label')">
      <el-popover
        trigger="manual"
        placement="right"
        v-model="palette">
        <palette 
          v-model="colors" 
          @color="changeColor"
          @mouseleave="closePalette"
        />
        <el-select 
          v-model="color"
          :disabled="disabled"
          slot="reference"
          >
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
            >
          </el-option>
        
          
        </el-select>
      </el-popover>
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
      colors: '#ff00ff',
      palette: false
    }
  },
  computed: {
    disabled: function () {
      return !this.$store.state.contacts[this.edit].repr[this.repr].visible
    },
    color: {
      set: function (val) {
        this.changeColor(val)
      },
      get: function () {
        if (this.palette) return 'palette'
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
      if (val === 'palette') {
        this.palette = true
        return
      }
      this.palette = false
      this.$store.dispatch('updateDisplayContact', {
        index: this.edit,
        repr: this.repr,
        param: {
          color: val
        }
      })
    },
    closePalette: function () {
      this.palette = false
    }
  }
}
</script>
