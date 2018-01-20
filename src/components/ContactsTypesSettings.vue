<template>
    <div>
        <div class="instructions">
          {{ $t('ui.contacts.selectInteraction') }}
        </div>
        <el-checkbox 
          :indeterminate="isIndeterminate" 
          :value="checkAllHbonds" 
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
                  <el-checkbox label="hydrogenBond">{{ $t('ui.contacts.hydrogenBond') }}</el-checkbox>
                </li>
                <li>
                  <el-checkbox label="backboneHydrogenBond">{{ $t('ui.contacts.backboneHydrogenBond') }}</el-checkbox>
                </li>
                <li>
                  <el-checkbox label="waterHydrogenBond">{{ $t('ui.contacts.waterHydrogenBond') }}</el-checkbox>
                </li>
                <li>
                  <el-checkbox label="weakHydrogenBond">{{ $t('ui.contacts.weakHydrogenBond') }}</el-checkbox>
                </li>
              </ul>   
            </li>
            <li>
              <el-checkbox label="hydrophobic">{{ $t('ui.contacts.hydrophobic') }}</el-checkbox>
            </li>
            <li>
              <el-checkbox label="ionicInteraction">{{ $t('ui.contacts.ionicInteraction') }}</el-checkbox>
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
import FormItem from './FormItem'
const hb = ['hydrogenBond', 'backboneHydrogenBond', 'waterHydrogenBond', 'weakHydrogenBond']

export default {
  name: 'contactsTypesSettings',
  components: {
    FormItem
  },
  props: {
    edit: {
      default: -1,
      type: Number
    }
  },
  data () {
    return {
      hbondsTypesDisplayed: false
    }
  },
  computed: {
    isIndeterminate () {
      return (this.nbHbonds > 0 && this.nbHbonds < 4)
    },
    checkAllHbonds () {
      return (this.nbHbonds === 4)
    },
    nbHbonds () {
      let total = 0
      this.contactsList.forEach(item => {
        total += (hb.includes(item)) ? 1 : 0
      })
      return total
    },
    contactsList: {
      set: function (value) {
        if (value === undefined || value === false) {
          value = []
        }

        if (this.edit === -1) {
          this.$store.dispatch('displayContacts', value)
        } else {
          this.$store.dispatch('updateDisplayContact', {
            index: this.edit,
            repr: 'contact',
            param: {
              contactsTypes: value
            }
          })
        }
      },
      get: function () {
        let contactsList = (this.edit === -1)
          ? this.$store.state.wholeMoleculeContacts
          : this.$store.state.contacts[this.edit].repr.contact.contactsTypes

        return (contactsList)
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
    },
    handleDisplayHbondsTypes (event) {
      this.hbondsTypesDisplayed = !this.hbondsTypesDisplayed
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
