<template>
  <div class="container">
    <h2>Créer la représentation d'une zone d'interaction</h2>
    <el-tabs v-model="interactionType">
      <el-tab-pane label="Avec un ligand" name="ligand">
        <p>
          Visualiser les liaisons entre un ligand et une protéine.<br/>
          Sélectionner le ligand voulu dans la liste et créer la représentation.
        </p>
        <el-select v-model="pickedLigand" filterable placeholder="Nom du ligand">
          <el-option v-for="item in ligands"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-tab-pane>
      <el-tab-pane label="Entre chaînes" name="chain">
        
        Visualisers les liaisons entre une chaîne et ses voisines.<br/>
        Sélectionner la chaîne voulue
        
        <el-select v-model="pickedChain" clearable placeholder="Chaîne">
          <el-option v-for="item in chains"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          <span style="float:left">{{ item.label}}</span>
          <span style="float: right; margin-left: 1em;">{{ item.entity }}</span>
          </el-option>
        </el-select>
        <p>
          Option : limiter la représentation aux contacts avec les chaînes suivantes
        </p>
        <el-select v-model="filterChains" multiple placeholder="Limiter aux chaînes...">
          <el-option v-for="item in filteredChains"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            >
          </el-option>
        </el-select>
      </el-tab-pane>
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
      Créer une nouvelle représentation
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
    createInterChainContact: function () {
      if (this.pickedChain !== '') {
        const target = this.chains[this.pickedChain].param
        const filter = this.filterChains.map((val) => {
          return ':' + val
        }).join(' || ')

        this.$store.dispatch('focusContact', {
          target: target,
          filter: filter
        })
      }
    },
    highlight: function (selector) {
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
    }

    .el-tabs {
      height: 15em;
      padding: 0.3em;
    }
    h2 {
      font-size: 0.9em;
      margin: 0;
      height: 3em;
      line-height: 3em;
      background: #f5f7fa;
      padding-left: 1em;
      color: #303133;
    }

    .fullwidth {
      width: calc(100% - 0.6em);
      margin: 0.3em;
    }

    input.el-input__inner {
      height: 30px;
    }

    
    
</style>
