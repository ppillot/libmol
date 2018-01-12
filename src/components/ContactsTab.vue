<template>
    <div class="frame">
        Ici s'affichent les interactions qui ont été calculées entre les points d'intérêt choisis par l'utilisateur et le reste du modèle moléculaire.
        Pour ajouter de nouvelles interactions, faire un clic droit sur un résidu ou une sélection et choisir "interactions"
                
      <div class="container no-scroll surface-list"
        v-for="(contact, index) in contacts"
        :key="index">
        <div class="surface-header list-header--card">
          <i 
            class="el-icon-caret-right"
            :class="[contact.index === edit ? 'rotate' : 'unrotate']"
            @click="edit = (index === edit)? -1 : index">
          </i>
          <div class="surface-title">
            Interactions avec {{ contact.target.name }}
          </div>
          <visible :value="visibility[index]" @input="val => {handleVisibility(val, index)}"></visible>
          <el-button type="text" icon="el-icon-delete" @click="handleDelete(index)"></el-button>
        </div>

        <!-- Contacts settings -->
        <contacts-tab-contact-settings :edit="index" v-if="edit === index"/>
        <!-- End Contacts settings -->

        <div class="surface-list-body"
          v-if="contact.contactsList.length>0"
          @mouseout="highlight('none')">
          <div class="surface-list-item list-item--card"
            :class="pair.type"
            @mouseover="highlight(pair.seleString)"
            v-for="(pair, i) in contact.contactsList" 
            :key="i">
            <div >
              {{ pair.res1.resname }}{{ pair.res1.resno }}:{{ pair.res1.chainname }}
                /
              {{ pair.res2.resname }}{{ pair.res2.resno }}:{{ pair.res2.chainname }}
               -
              {{ $t('ui.contacts.' + pair.type)}}
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import Help from './Help'
import FormItem from './FormItem'
import Visible from './Visible'
import ButtonGroup from './ButtonGroup'
import RadioButton from './RadioButton'
import ContactsTabContactSettings from './ContactsTabContactSettings'

// import {contactTypesIndices} from '../utils/contacts'

export default {
  name: 'contactsTab',
  components: {
    FormItem,
    Help,
    Visible,
    ButtonGroup,
    RadioButton,
    ContactsTabContactSettings
  },
  data () {
    return {
      edit: -1,
      colors: '#ff00ff'
    }
  },
  computed: {
    contacts: function () {
      return this.$store.state.contacts
    },
    visibility: function () {
      return this.$store.state.contacts.map(val => {
        return val.visible
      })
    },
    targetRepresentationMode: function () {
      if (this.edit > -1) {
        return this.contacts[this.edit].repr.target.reprName
      } else {
        return undefined
      }
    },
    targetColor: function () {
      if (this.edit > -1) {
        return this.contacts[this.edit].repr.target.color
      } else {
        return undefined
      }
    }
  },
  methods: {
    highlight: function (selector) {
      this.$store.dispatch('highlightSelectHovered', selector)
    },
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
    },
    changeColor: function (val) {
      console.log(val)
    },
    pickColor (val) {
      if (val !== 'palette') this.changeColor(val)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .help {
        font-size: 1em;
    }
    .frame {
        flex: 1;
        overflow: hidden;
    }
    #commands-tab--commands {
        overflow-y: auto;
        padding-left: 1px;
    }
    #commands-tab--help {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
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

    .display-sub {
      transform: rotate(90deg);
    }

    @keyframes rotating {

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
    .help h3 {
        font-size: 0.95em;
        margin: 0 0.5em;
        font-weight: 500;
    }

    .gutter.gutter-vertical {
        border-top: 1px solid #eee;
        /*border-bottom: 1px solid #eee;*/
        margin: 0 0 0 0;
        cursor: ns-resize;
        /*box-shadow: #e8e8e8 0px 1px 2px 0px;*/
        
    }
    .gutter.gutter-vertical:hover {
        border-color: #ccc;
        transition: border-color 0.3s ease-in-out 0.1s;
        /* background-image:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
        transition: background-image 0.5s ease-in-out 0.3s; */
        
    }
</style>
