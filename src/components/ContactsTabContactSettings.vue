<template>
  <div class="interaction_panel">
    <!-- Réglages -->
    <el-tabs v-model="activeName" 
    tab-position="left">
      <el-tab-pane label="Contacts" name="contact">
        Interactions à afficher<br>
        Inclure les interactions avec les molécules d'eau <br>
        Afficher les résidus autour de la cible dans un rayon de 

      </el-tab-pane>
      <el-tab-pane label="Cible" name="target">
        <div class="contact-settings">
          <contacts-tab-settings-representation-select 
            :edit="edit"
            repr="target"/>

          <contacts-tab-settings-color-select
            :edit="edit"
            repr="target"/>

        </div>
      </el-tab-pane>
      <el-tab-pane label="Entourage" name="third">
        Afficher/Cacher 
        <contacts-tab-settings-representation-select 
            :edit="edit"
            repr="vicinity"/>
            
        <contacts-tab-settings-color-select
          :edit="edit"
          repr="vicinity"/>

      </el-tab-pane>
      <el-tab-pane label="Etiquettes" name="fourth">
        <contacts-tab-contact-settings-labels
          :edit="edit" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import FormItem from './FormItem'
import ContactsTabContactSettingsLabels from './ContactsTabContactSettingsLabels'
import ContactsTabSettingsRepresentationSelect from './ContactsTabSettingsRepresentationSelect'
import ContactsTabSettingsColorSelect from './ContactsTabSettingsColorSelect'

// import {contactTypesIndices} from '../utils/contacts'

export default {
  name: 'contactsTabContactsSettings',
  components: {
    FormItem,
    ContactsTabContactSettingsLabels,
    ContactsTabSettingsRepresentationSelect,
    ContactsTabSettingsColorSelect
  },
  props: {
    edit: {
      default: -1,
      type: Number
    }
  },
  data () {
    return {
      activeName: 'contact'
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .interaction_panel {
      padding-top: 1em;
      border: 2px solid #f5f7fa;
    }

    .contact-settings {
      padding: 0 5px;
    }
</style>
