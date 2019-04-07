<template>
  <div class="container">
    <h2>{{ $t('ui.contacts.createHeader') }}</h2>
    <el-tabs v-model="interactionType">
<!-- ligand pane -->
      <el-tab-pane 
      :label="$t('ui.contacts.ligandTabHeader')" 
      name="ligand"
      :disabled="ligands.length===0"
      >
        <p class="objectives">
          {{ $t('ui.contacts.ligandManifest')}}
        </p>
        <p class="instructions">
          {{ $t('ui.contacts.ligandInstructions')}}
        </p>
        <el-select 
          v-model="pickedLigand" 
          filterable 
          :placeholder="$t('ui.contacts.ligandPlaceholder')"
        >
          <el-option v-for="item in ligands"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            @hover="highlight(item.param.resnum + ':' + item.param.chainId)"
          >
          </el-option>
        </el-select>
      </el-tab-pane>
<!-- chain pane -->
      <el-tab-pane 
        :label="$t('ui.contacts.chainTabHeader')" 
        :disabled="chains.length<2"
        name="chain">
        <p class="objectives">{{ $t('ui.contacts.chainManifest') }}</p>
        <p class="instructions">{{ $t('ui.contacts.chainTargetInstructions') }}</p>
        
        <el-select 
          v-model="pickedChain" 
          clearable 
          :placeholder="$t('ui.contacts.chainTargetPlaceholder')"
        >
          <el-option 
            v-for="item in chains"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          <span style="float:left">{{ item.label}}</span>
          <span style="float: right; margin-left: 1em;">{{ item.entity }}</span>
          </el-option>
        </el-select>
        <p class="instructions">
          {{ $t('ui.contacts.chainFilterInstructions') }}
        </p>
        <el-select 
          v-model="filterChains" 
          multiple 
          :placeholder="$t('ui.contacts.chainFilterPlaceholder')"
        >
          <el-option 
            v-for="item in filteredChains"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            >
          </el-option>
        </el-select>
      </el-tab-pane>
<!-- custom pane -->
      <!--
      <el-tab-pane label="Personnalisée" name="custom">
        Visualiser les liaisons entre la sélection définie et les résidus voisins.<br/>
        Sélectionner en utilisant le langage de sélection.<br/>

      </el-tab-pane>
      -->
    </el-tabs>
    
    <el-button 
      type="primary"
      class="fullwidth"
      @click="createContact"
      :disabled="pickedLigand === '' && pickedChain === ''"
    >
      {{ $t('ui.contacts.makeContactRepresentation') }}
    </el-button>
  </div>
</template>

<script>

export default {
  name: 'contactsTabCreateWidget',
  data () {
    return {
      pickedLigand: '',
      pickedChain: '',
      filterChains: [],
      interactionType: 'ligand'
    }
  },
  computed: {
    contacts: function () {
      return this.$store.state.contacts
    },
    ligands: function () {
      if (this.$store.state.mol.hetero.length === 0) {
        this.interactionType = 'chain'
      }
      return this.$store.state.mol.hetero.map((res, id) => {
        return {
          label: res.resname + ' ' + res.resno + ' (' + res.entity + ') ' +
            this.$t('tooltips.chain') + ' ' + res.chainname,
          param: {
            resnum: res.resno,
            chainId: res.chainname
          },
          value: id
        }
      })
    },
    chains: function () {
      return this.$store.state.mol.chains.map((ch, id) => {
        return {
          label: this.$t('tooltips.chain') + ' ' + ch.name,
          param: {
            chainId: ch.name
          },
          entity: ch.entity,
          value: id
        }
      })
    },
    filteredChains: function () {
      return this.chains.filter((c) => {
        return c.value !== this.pickedChain
      })
    }
  },
  methods: {
    createContact: function () {
      switch (this.interactionType) {
        case 'ligand':
          if (this.pickedLigand !== '') {
            this.$store.dispatch(
              'focusContact', {
                target: this.ligands[this.pickedLigand].param
              }
            )
          }
          break
        case 'chain':
          if (this.pickedChain !== '') {
            let fChains = this.filterChains.map((val) => {
              return ':' + this.chains[val].param.chainId
            }).join(' ')
            let filter = (fChains.length === 0) ? {} : {filter: fChains}
            this.$store.dispatch(
              'focusContact', {
                target: this.chains[this.pickedChain].param,
                ...filter
              }
            )
          }
          break
      }
    },
    highlight: function (selector) {
      console.log(selector)
      this.$store.dispatch('highlightSelectHovered', selector)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .el-tab-pane {
      font-size: 0.9em;
    }
    .container {
      border: solid 1px #e2e7ec;
      border-radius: 0px;
      flex: none;
    }

    .el-tabs {
      padding: 0.3em;
    }
    h2 {
      font-size: 0.9em;
      margin: 0;
      height: 3em;
      line-height: 3em;
      background: #ecf1f5;
      color: #283e52;
      text-align: center;
      white-space: nowrap;
      overflow-x: hidden;
      text-overflow: ellipsis;
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
    }

    .fullwidth {
      width: calc(100% - 0.6em);
      margin: 0.3em;
    }

    input.el-input__inner {
      height: 30px;
    }

    .objectives {
      margin: 0;
      color: #8e9398;
      padding: 2px 6px;
      font-style: italic;
    }

    .instructions {
      margin-top: 0.6em;
    }

    p {
      margin: 0;
    }
    
</style>
<style>
  .contact-tab--container .el-tabs .el-tabs__header {
    margin-bottom: 0.2em;
  }
</style>
