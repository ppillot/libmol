<template>
    <div class="frame">
        Ici s'affichent les interactions qui ont été calculées entre les points d'intérêt choisis par l'utilisateur et le reste du modèle moléculaire.
        Pour ajouter de nouvelles interactions, faire un clic droit sur un résidu ou une sélection et choisir "interactions"
    
      <div class="container no-scroll surface-list"
        v-for="contact in contacts"
        :key="contact.index">
        <div class="surface-list-header">
          Interactions avec {{ contact.pivot.name }}
          <el-button
            type="text"
            icon="el-icon-delete"
            class="button align-right"
            size="large"
            @click="handleDelete(contact.index)">
          </el-button>
        </div>
        <div class="surface-list-body"
          v-if="contacts.length>0"
          @mouseout="highlight('none')">
          <div class="surface-list-item"
            :class="pair.type"
            @mouseover="highlight(pair.seleString)"
            v-for="(pair, index) in contact.contactsList" 
            :key="index">
            <div >
              <!--<i 
                class="el-icon-caret-right"
                :class="[index === edit ? 'rotate' : 'unrotate']"
                @click="edit = (index === edit)? -1 : index"></i>-->
              {{ pair.res1.resname }}{{ pair.res1.resno }}:{{ pair.res1.chainname }}
                /
              {{ pair.res2.resname }}{{ pair.res2.resno }}:{{ pair.res2.chainname }}
               -
              {{ $t('ui.contacts.' + pair.type)}}
            </div>
          </div>
        </div>  
        <div class="surface-list-item" v-else>
          {{$t('ui.surface.list_instructions')}}
        </div>
      </div>
    </div>
</template>

<script>
import Help from './Help'
import FormItem from './FormItem'
// import {contactTypesIndices} from '../utils/contacts'

export default {
  name: 'contactsTab',
  components: {
    FormItem,
    Help
  },
  data () {
    return {

    }
  },
  computed: {
    contacts: function () {
      return this.$store.state.contacts
    }
  },
  methods: {
    highlight: function (selector) {
      console.log(selector)
      this.$store.dispatch('highlightSelectHovered', selector)
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
