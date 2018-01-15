<template>
  <div class="interaction_panel">
    Réglages
    <el-tabs v-model="activeName" 
    tab-position="left">
      <el-tab-pane label="Contact" name="contact">User</el-tab-pane>
      <el-tab-pane label="Cible" name="target">
        <el-popover
          ref="pcontact"
          placement="right"
          trigger="click">
          <palette v-model="colors" @color="pickColor"></palette>
        </el-popover>
        <div class="contact-settings">
          Apparence de la cible ({{ ($te('biochem.pdb_res_name.' + contact.target.res.resname)) ? $t('biochem.pdb_res_name.' + contact.target.res.resname) : contact.target.res.resname }}
      {{ contact.target.res.resno }} chaîne {{ contact.target.res.chainname }})
          <form-item :label="$t('ui.commands.representation.label')">
            <el-select v-model="targetRepresentation">
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
            <!-- <button-group :active-value="targetRepresentationMode" @change="display">
              <radio-button value="spacefill">{{ $t('ui.commands.representation.spacefill') }}</radio-button>
              <radio-button value="ball+stick">{{ $t('ui.commands.representation.balls_and_sticks') }}</radio-button>
              <radio-button value="licorice">{{ $t('ui.commands.representation.sticks') }}</radio-button>
            </button-group>-->
          </form-item>
          <form-item :label="$t('ui.commands.color.label')">
            <el-select v-model="targetColor">
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
            <!-- <button-group :active-value="targetColor" @change="changeColor">
              <radio-button value="element">{{ $t('ui.commands.color.cpk') }}</radio-button>
              <radio-button value="default">Par défaut</radio-button>
              <radio-button value="palette" v-popover:pcontact>{{ $t('ui.commands.color.pick_color') }}</radio-button>
            </button-group> -->
          </form-item>
          
        </div>
      </el-tab-pane>
      <el-tab-pane label="Entourage" name="third">Role</el-tab-pane>
      <el-tab-pane label="Etiquettes" name="fourth">Task</el-tab-pane>
    </el-tabs>
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
      colors: '#ff00ff',
      activeName: 'Contact'
    }
  },
  computed: {
    contact: function () {
      return this.$store.state.contacts[this.edit]
    },
    targetRepresentation: {
      set: function (val) {
        this.$store.dispatch('updateDisplayContact', {
          index: this.edit,
          repr: 'target',
          param: {
            reprName: val
          }
        })
      },
      get: function () {
        if (this.edit > -1) {
          return this.contact.repr.target.reprName
        } else {
          return undefined
        }
      }
    },
    targetRepresentationMode: function () {
      if (this.edit > -1) {
        return this.contact.repr.target.reprName
      } else {
        return undefined
      }
    },
    targetColor: {
      set: function (val) {
        this.changeColor(val)
      },
      get: function () {
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
    .interaction_panel {
      padding-top: 1em;
    }

    .contact-settings {
      padding: 0 5px;
    }
</style>
