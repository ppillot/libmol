<template>
  <div class="container surface-list">
    <div class="surface-list-header">
        {{ $t('ui.contacts.list_label') }}
        <el-button
          type="text"
          icon="delete"
          class="button align-right"
          size="large"
          @click="handleDelete(-1)" v-if="contacts.length > 0">
        </el-button>
    </div>
    <div
      id="contact-tab--list"
      class="surface-list-body"
      v-if="contacts.length > 0"
      >
        <contact-header-list-item
          v-for="(contact, index) in contacts"
          :key="index"
          :contact-num="index"
          link
        />

    </div>
        <!-- No contact created yet -->
    <div v-else
      class="surface-list-item"
    >
      {{ $t('ui.contacts.list_instructions') }}

    </div>
  </div>
</template>

<script>
import ContactHeaderListItem from './ContactHeaderListItem'

// import {contactTypesIndices} from '../utils/contacts'

export default {
  name: 'ContactsTabList',
  components: {
    ContactHeaderListItem
  },
  data () {
    return {
      edit: -1
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
    contacts: function () {
      return this.$store.state.contacts
    },
    visibility: function () {
      return this.$store.state.contacts.map(val => {
        return val.visible
      })
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
      this.$store.dispatch('deleteContact', contactNum)
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
      color: #505b68;
      transition: all 0.4s ease;
    }

    i:hover {
      cursor: pointer;
      color: #20a0ff;
    }

    .el-button.el-button--text {
      margin: 0;
    }

    .surface-list-item {
      background: none;
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
