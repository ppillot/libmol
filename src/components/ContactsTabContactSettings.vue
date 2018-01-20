<template>
  <div class="interaction_panel">
    <!-- Réglages -->
    <el-tabs v-model="activeName" 
    tab-position="left">
      <el-tab-pane label="Contacts" name="contact">
        <contacts-types-settings
          :edit="edit" />
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
        <contacts-tab-settings-visibility-switch
          :edit="edit"
          repr="vicinity" />

        <contacts-tab-settings-representation-select 
            :edit="edit"
            repr="vicinity"/>

        <contacts-tab-settings-color-select
          :edit="edit"
          repr="vicinity"/>

      </el-tab-pane>
      <el-tab-pane label="Etiquettes" name="fourth">
        <contacts-tab-settings-visibility-switch
          :edit="edit"
          repr="label" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ContactsTabSettingsRepresentationSelect from './ContactsTabSettingsRepresentationSelect'
import ContactsTabSettingsColorSelect from './ContactsTabSettingsColorSelect'
import ContactsTabSettingsVisibilitySwitch from './ContactsTabSettingsVisibilitySwitch'
import ContactsTypesSettings from './ContactsTypesSettings'

export default {
  name: 'contactsTabContactsSettings',
  components: {
    ContactsTabSettingsRepresentationSelect,
    ContactsTabSettingsColorSelect,
    ContactsTabSettingsVisibilitySwitch,
    ContactsTypesSettings
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .interaction_panel {
      padding-top: 1em;
      border: 2px solid #f5f7fa;
      box-shadow: inset 0 1px 3px #afb2b3;
    }

    .contact-settings {
      padding: 0 5px;
    }
</style>
