<template>         
  <div class="surface-list-item">
    <div class="surface-header">
      <div class="surface-title"
        :class="{linkLike: link}"
        @click="getDetails"
      >
        {{ $t('ui.contacts.contactHeader') }}
        <span v-if="contact.target.type === 'res'">
          {{ ($te('biochem.pdb_res_name.' + contact.target.res.resname)) ? $t('biochem.pdb_res_name.' + contact.target.res.resname) : contact.target.res.resname }}
          {{ contact.target.res.resno }}
        </span>
        {{ $t('tooltips.chain') }} {{ contact.target.chain }}
      </div>
      <visible :value="visibility" @input="val => {handleVisibility(val, contactNum)}"></visible>
      <el-button type="text" icon="el-icon-delete" @click="handleDelete(contactNum)"></el-button>
      <el-button 
        icon="icon-sliders" 
        class="button large" 
        type="text"
        @click="edit = (edit === -1) ? contactNum : -1"
        v-popover:settings
        />
    </div>
    <!-- Contacts settings -->
    <el-popover
      ref="settings"
      placement="right-start"
      title="Paramètres de la représentation"
      width="400"
      trigger="manual"
      v-model="isEditing">
      <contacts-tab-contact-settings :edit="edit" v-if="edit !== -1"/>
    </el-popover>
    
    <!-- End Contacts settings -->
  </div>
</template>

<script>
import Visible from './Visible'
import ContactsTabContactSettings from './ContactsTabContactSettings'

// import {contactTypesIndices} from '../utils/contacts'

export default {
  name: 'contactsTabList',
  components: {
    Visible,
    ContactsTabContactSettings
  },
  data () {
    return {
      edit: -1
    }
  },
  props: {
    contactNum: {
      type: Number,
      required: true
    },
    link: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isEditing: {
      get: function () {
        return this.edit > -1
      },
      set: function (val) {
        if (val === false) this.edit = -1
      }
    },
    contact: function () {
      return this.$store.state.contacts[this.contactNum]
    },
    visibility: function () {
      return this.contact.visible
    }
  },
  methods: {
    handleVisibility: function (val, contactNum) {
      this.$store.dispatch('updateDisplayContact', {
        index: contactNum,
        param: {
          visible: val
        }
      })
    },
    handleDelete: function (contactNum) {
      this.$store.commit('setActiveContact', null)
      this.$store.dispatch('deleteContact', contactNum)
    },
    getDetails: function () {
      this.$store.commit('setActiveContact', this.contactNum)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .container {
      flex: 1;
    }

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    li ul {
      padding-left: 25px;
    }

    i {
      color: #88a9d4;
      transition: all 0.4s ease;
    }

    i:hover {
      cursor: pointer;
      color: #20a0ff;
    }

    .el-button.el-button--text {
      margin: 0;
    }

    .linkLike:hover {
      color: #20a0ff;
      cursor: pointer;
    }
    
</style>
<style>
    .list-header--card {
      background: #f5f7fa;
      border: solid 2px #f5f7fa;
    }
    .list-item--card {
      border: solid 2px #f5f7fa;
      margin-top: -2px;
    }
    .list-item--card:hover {
      opacity: 0.75;
    }
    .settings--card {
      border: solid 1px #f5f7fa;
    }
</style>
