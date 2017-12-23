<template>
    <div class="frame">
        <div class="instructions">
          {{ $t('ui.contacts.selectInteraction') }}
        </div>
        <el-checkbox 
          :indeterminate="isIndeterminate" 
          v-model="checkAllHbonds" 
          @change="handleCheckAllHbondsChange"
          label="allHbonds">
          {{ $t('ui.contacts.allHbonds') }}
        </el-checkbox>
        <i class="el-icon-arrow-right " @click="handleDisplayHbondsTypes" :class="{'display-sub': hbondsTypesDisplayed}"></i>
        <el-checkbox-group v-model="contactsList">
          <ul>
            <li v-if="hbondsTypesDisplayed">
              <ul>
                <li>
                  <el-checkbox label="hydrogenBond">{{ $t('ui.contacts.hbond') }}</el-checkbox>
                </li>
                <li>
                  <el-checkbox label="backboneHydrogenBond">{{ $t('ui.contacts.backboneHbond') }}</el-checkbox>
                </li>
                <li>
                  <el-checkbox label="waterHydrogenBond">{{ $t('ui.contacts.waterHbond') }}</el-checkbox>
                </li>
                <li>
                  <el-checkbox label="weakHydrogenBond">{{ $t('ui.contacts.weakHbond') }}</el-checkbox>
                </li>
              </ul>   
            </li>
            <li>
              <el-checkbox label="hydrophobic">{{ $t('ui.contacts.hydrophobic') }}</el-checkbox>
            </li>
            <li>
              <el-checkbox label="ionicInteraction">{{ $t('ui.contacts.ionic') }}</el-checkbox>
            </li>
            <li>
              <el-checkbox label="metalCoordination">{{ $t('ui.contacts.metalCoordination') }}</el-checkbox>
            </li>
            <li>
              <el-checkbox label="piStacking">{{ $t('ui.contacts.piStacking') }}</el-checkbox>
            </li>
            <!-- <el-checkbox label="cationPi">{{ $t('ui.contacts.cationPi') }}</el-checkbox> -->
          </ul>
        </el-checkbox-group>
    </div>
</template>

<script>
import Help from './Help'
import FormItem from './FormItem'
const hb = ['hydrogenBond', 'backboneHydrogenBond', 'waterHydrogenBond', 'weakHydrogenBond']

export default {
  name: 'contactsTab',
  components: {
    FormItem,
    Help
  },
  data () {
    return {
      isIndeterminate: false,
      checkAllHbonds: false,
      hbondsTypesDisplayed: false
    }
  },
  computed: {
    contactsList: {
      set: function (value) {
        let nbMatches = 0

        if (value !== undefined) {
          value.forEach(item => {
            nbMatches += (hb.includes(item)) ? 1 : 0
          })
        } else {
          value = []
        }

        if (nbMatches === 0) {
          this.checkAllHbonds = false
          this.isIndeterminate = false
        } else if (nbMatches === hb.length) {
          this.checkAllHbonds = true
          this.isIndeterminate = false
        } else {
          this.checkAllHbonds = false
          this.isIndeterminate = true
        }

        this.$store.dispatch('displayContacts', value)
      },
      get: function () {
        return (this.$store.state.contacts)
      }
    }
  },
  methods: {
    handleCheckAllHbondsChange (val) {
      let list = this.contactsList.slice()

      if (val) {
        // add all hbonds types to the list of contacts to display
        hb.forEach(element => {
          if (!list.includes(element)) {
            list.push(element)
          }
        })
        this.contactsList = list
      } else {
        this.contactsList = list.reduce((l, element) => {
          if (!hb.includes(element)) {
            l.push(element)
          }
          return l
        }, [])
      }

      this.isIndeterminate = false
    },
    handleDisplayHbondsTypes (event) {
      this.hbondsTypesDisplayed = !this.hbondsTypesDisplayed
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
