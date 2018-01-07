<template>
    <div>
      <el-popover
        ref="pcontact"
        placement="right"
        trigger="click">
        <palette v-model="colors" @color="pickColor"></palette>
      </el-popover>

      <div class="surface-settings settings--card">
        Apparence de la cible ({{ contact.target.name }})
        <form-item :label="$t('ui.commands.representation.label')">
          <button-group :active-value="targetRepresentationMode" @change="display">
            <radio-button value="spacefill">{{ $t('ui.commands.representation.spacefill') }}</radio-button>
            <radio-button value="ball+stick">{{ $t('ui.commands.representation.balls_and_sticks') }}</radio-button>
            <radio-button value="licorice">{{ $t('ui.commands.representation.sticks') }}</radio-button>
          </button-group>
        </form-item>
        <form-item :label="$t('ui.commands.color.label')">
          <button-group :active-value="targetColor" @change="changeColor">
            <radio-button value="element">{{ $t('ui.commands.color.cpk') }}</radio-button>
            <radio-button value="default">Par défaut</radio-button>
            <radio-button value="palette" v-popover:pcontact>{{ $t('ui.commands.color.pick_color') }}</radio-button>
          </button-group>
        </form-item>
        
      </div>
    </div>
</template>

<script>
import FormItem from './FormItem'
import Palette from './Palette'
import ButtonGroup from './ButtonGroup'
import RadioButton from './RadioButton'

// import {contactTypesIndices} from '../utils/contacts'

export default {
  name: 'contactsTabContactsSettings',
  components: {
    FormItem,
    Palette,
    ButtonGroup,
    RadioButton
  },
  props: {
    edit: {
      default: -1,
      type: Number
    }
  },
  data () {
    return {
      colors: '#ff00ff'
    }
  },
  computed: {
    contact: function () {
      return this.$store.state.contacts[this.edit]
    },
    targetRepresentationMode: function () {
      if (this.edit > -1) {
        return this.contact.repr.target.reprName
      } else {
        return undefined
      }
    },
    targetColor: function () {
      if (this.edit > -1) {
        if (this.contact.repr.target.color.charAt(0) === '#') {
          return 'palette'
        } else {
          return this.contact.repr.target.color
        }
      } else {
        return undefined
      }
    }
  },
  methods: {
    display: function (val) {
      this.$store.dispatch('updateDisplayContact', {
        index: this.edit,
        repr: 'target',
        param: {
          reprName: val
        }
      })
    },
    handleEdit: function (contactNum) {
      console.log(contactNum)
    },
    changeColor: function (val) {
      if (val === 'palette') return
      this.$store.dispatch('updateDisplayContact', {
        index: this.edit,
        repr: 'target',
        param: {
          color: val
        }
      })
    },
    pickColor (val) {
      console.log(val)
      if (val !== 'palette') this.changeColor(val)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    
</style>
