<template>
  <div>{{ description }}
  <!-- ************** file from Libmol ********************** -->
    <p v-if="source.code == 'libmol'">
      Données chargées depuis <a :href="source.href" target="_blank">la Librairie de molécules/Libmol</a>
      <span v-if="molHref !== ''">
         - <a :href="molHref" target="_blank" class="dbid">{{ dbId }}</a> 
      </span>
      <div v-if="meta.modifications !== ''">
        Modification du fichier original : {{ meta.modifications }}
      </div>
    </p>
  <!-- ************** file from local file ********************** -->
    <p v-if="source.code == 'local'">
      Données provenant d'un fichier local 
      <div v-if="molCode === ''">
        Pas d'information sur la banque d'origine du fichier
      </div>
    </p>
  
    <div v-if="isSearching">
      <i class="el-icon-loading" />
    </div>

    <!-- ************ meta from databases *********************** -->
    <div class="section" v-if="meta.source !== ''">
      <h2>Source du modèle</h2>
      <template v-if="meta.source === 'pdb ligand'">
        <a href="https://rcsb.org/pdb" target="_blank">Protein Data Bank - Ligand</a>
        <br>
        <a :href="'http://www4.rcsb.org/ligand/' + molCode" target="_blank"><span class="dbid"> {{ molCode }}</span> {{ meta.title }}</a>
      </template>
      <template v-else-if="meta.source === 'pdb'">
        <a href="https://rcsb.org/pdb" target="_blank"> Protein Data Bank </a> 
        <br>
        <a :href="'http://www.rcsb.org/pdb/explore/explore.do?structureId=' + molCode" target="_blank"><span class="dbid"> {{ molCode }}</span> {{ meta.title }}</a> 
        <br>
        Auteurs : {{ meta.structure_authors }}
      </template>
      <template v-else-if="meta.source === 'pubchem'">
        <a href="https://pubchem.ncbi.nlm.nih.gov" target="_blank"> PubChem </a> 
        <br>
        <a :href="'https://pubchem.ncbi.nlm.nih.gov/compound/' + this.meta.pubchemCID" target="_blank">PubChem CID <span class="dbid"> {{ meta.pubchemCID }}</span></a>
      </template>
      
    </div>
    <div class="section" v-if="meta.source !==''">
      <h2>Référence</h2>
      <div class="section">
        <span v-if="meta.source==='pdb'">
          PDB ID: {{ meta.structureId }}, 
        </span>
        {{ meta.citation_authors }} ({{ meta.year }})
        "<i>{{ meta.articleTitle }}</i>", {{ meta.journal }} {{ meta.volume }}: {{ meta.pages }}
        <a 
          :href="`http://dx.doi.org/${ meta.doi }`" 
          target="_blank" 
          v-if="meta.doi !== ''"
          >
          DOI: {{ meta.doi }}
        </a>
      </div>
      <div class="section" v-if="meta.pubmedId !== ''">
        Pubmed 
          <a 
            :href="`https://www.ncbi.nlm.nih.gov/pubmed/${meta.pubmedId}`" 
            target="_blank"
            class="dbid">
            {{ meta.pubmedId }}
          </a>
        <span v-if="meta.pmc !== ''">
          Article en accès libre sur Pubmed Central 
          <a 
            :href="`https://www.ncbi.nlm.nih.gov/pmc/articles/${meta.pmc}`" 
            target="_blank"
            class="dbid">
            {{ meta.pmc }}
            </a>
        </span>
      </div>
      <div class="section" v-if="meta.abstract !== ''">
        <b>Résumé</b>
        <br/>
        {{ meta.abstract }}
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  const PDBCodeRegEx = /^\d\w{3}$/i
  const PDBHeteroCode = /^[A-Z0-9]{1,3}$/i

  export default {
    name: 'citationsPanel',
    data () {
      return {
        isSearching: false,
        meta: {
          source: '',
          InChlKey: '',
          structureId: '',
          pubchemCID: '',
          title: '',
          pubmedId: '',
          structure_authors: '',
          citation_authors: '',
          pmc: '',
          doi: '',
          volume: '',
          journal: '',
          pages: '',
          year: '',
          month: '',
          day: '',
          articleTitle: '',
          abstract: '',
          modifications: ''
        }
      }
    },
    computed: {
      source: function () {
        return this.getSourceURL(this.$store.state.source)
      },
      dataToUpdate: function () {
        return this.$store.state.dbId + this.$store.state.molCode + this.$store.state.source
      },
      description: function () {
        switch (this.$store.state.source) {
          case 'libmol':
            this.getMetaFromLibmol(this.$store.state.dbId)
            break
          case 'pdb':
            this.getMetaFromPDB(this.$store.state.molCode)
            break
          case 'local':
            if (PDBCodeRegEx.test(this.$store.state.molCode)) {
              this.getMetaFromPDB(this.$store.state.molCode)
            } else {
              this.isSearching = false
            }
            break
          default:
            this.isSearching = false
        }
        return ''
      },
      molCode: function () {
        return this.$store.state.molCode
      },
      dbId: function () {
        return this.$store.state.dbId
      },
      molHref: function () {
        if (this.$store.state.source === 'libmol') {
          if (parseInt(this.$store.state.dbId) < 356) {
            // note: in libmol, records post 355 have no more description on the reference website
            return `http://www.librairiedemolecules.education.fr/molecule.php?idmol=${this.$store.state.dbId}`
          }
        } else if (this.$store.state.molCode !== '') {
          if (PDBCodeRegEx.test(this.molCode)) {
            return `http://www.rcsb.org/pdb/explore/explore.do?structureId=${this.$store.state.molCode.toLowerCase()}`
          } else if (PDBHeteroCode.test(this.$store.state.molCode)) {
            return `http://www4.rcsb.org/ligand/${this.$store.state.molCode.toUpperCase()}`
          }
        }
        return ''
      }
    },
    methods: {
      init () {
        this.meta = {
          source: '',
          InChlKey: '',
          structureId: '',
          pubchemCID: '',
          title: '',
          pubmedId: '',
          structure_authors: '',
          citation_authors: '',
          pmc: '',
          doi: '',
          volume: '',
          journal: '',
          pages: '',
          year: '',
          month: '',
          day: '',
          articleTitle: '',
          abstract: '',
          modifications: ''
        }
      },
      getSourceURL (source) {
        let response = {}
        switch (source) {
          case 'pdb':
            response = {
              href: 'https://www.rcsb.org',
              title: 'Protein Data Bank',
              code: 'pdb'
            }
            break
          case 'libmol':
            response = {
              href: 'http://librairiedemolecules.education.fr',
              title: 'Librairie de molécules',
              code: 'libmol'
            }
            break
          case 'pubchem':
            response = {
              href: 'https://pubchem.ncbi.nlm.nih.gov/',
              title: 'Pubchem',
              code: 'pubchem'
            }
            break
          case 'local':
            response = {
              href: '',
              title: 'Fichier local',
              code: 'local'
            }
            break
          default:
            response = {
              href: '',
              title: '',
              code: ''
            }
        }
        return response
      },
      getMetaFromPDB (pdbCode) {
        console.log(pdbCode)
        axios.get('https://www.rcsb.org/pdb/rest/describePDB', {
          params: {
            structureId: pdbCode
          }
        }).then(function ({data}) {
          this.init()
          /* global DOMParser */
          const parser = new DOMParser()
          const xmlDocument = parser.parseFromString(data, 'application/xml')
          const pdbNode = xmlDocument.getElementsByTagName('PDB')[0]

          this.meta.source = 'pdb'
          this.meta.structureId = pdbNode.getAttribute('structureId')
          this.meta.title = pdbNode.getAttribute('title')
          this.meta.pubmedId = pdbNode.getAttribute('pubmedId')
          this.meta.structure_authors = pdbNode.getAttribute('structure_authors')
          this.meta.citation_authors = pdbNode.getAttribute('citation_authors')

          if (this.meta.pubmedId !== '') {
            this.getMetaFromPubmed(this.meta.pubmedId)
          } else {
            this.isSearching = false
            this.$forceUpdate()
          }
        }.bind(this))
      },
      getMetaFromLibmol (id) {
        const path = (process.env.NODE_ENV !== 'production') ? 'api/recherche.php' : 'https://libmol.org/api/recherche.php'
        axios.get(path, {
          params: {
            meta: id
          }
        }).then(function ({data}) {
          this.init()
          this.meta = Object.assign({}, this.meta, data)
          this.isSearching = false
          // this.$forceUpdate()
        }.bind(this))
      },
      getMetaFromPubmed (pubmedId) {
        axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi', {
          params: {
            db: 'pubmed',
            id: pubmedId,
            retmode: 'xml',
            rettype: 'abstract'
          }
        }).then(function ({data}) {
          /* global DOMParser */
          const parser = new DOMParser()
          const xmlDocument = parser.parseFromString(data, 'application/xml')
          // const root = xmlDocument.getElementsByTagName('PubmedArticle')[0]
          // debugger
          this.meta.pubmedId = pubmedId
          this.meta.pmc = this.getSelectorContent(xmlDocument, 'ArticleId[IdType="pmc"]')
          this.meta.doi = this.getSelectorContent(xmlDocument, 'ArticleId[IdType="doi"]')
          this.meta.articleTitle = this.getSelectorContent(xmlDocument, 'ArticleTitle')
          this.meta.volume = this.getSelectorContent(xmlDocument, 'Volume')
          this.meta.journal = this.getSelectorContent(xmlDocument, 'Title')
          this.meta.pages = this.getSelectorContent(xmlDocument, 'MedlinePgn')
          this.meta.year = this.getSelectorContent(xmlDocument, 'PubDate > Year')
          this.meta.month = this.getSelectorContent(xmlDocument, 'PubDate > Month')
          this.meta.day = this.getSelectorContent(xmlDocument, 'PubDate > Day')
          this.meta.abstract = this.getSelectorContent(xmlDocument, 'AbstractText')

          this.isSearching = false
        }.bind(this))
      },
      getSelectorContent (doc, sel) {
        return (doc.querySelector(sel) === null) ? '' : doc.querySelector(sel).textContent
      }
    }
  }
</script>

<style scoped>
  h2 {
    font-size: 1.1em;
    margin: 0;
  }

  div {
    user-select: text;
  }

  a {
    text-decoration: none;
    color: #87a9d4;
  }

  a:hover {
    color: #03a9f4;
  }

  .dbid {
    font-size: 0.9em;
    background: #87a9d4;
    color: #f9fafc;
    height: 1em;
    padding: 2px;
    border-radius: 3px;
    font-weight: 500;
    line-height: 1em;
    margin-right: 0.5em;
    text-decoration: none;
    display: inline-block;
    transition: 0.4s;
  }

  .dbid:hover {
    background: #03a9f4;
    color: #f9fafc;
  }

  .section {
    margin-bottom: 0.6em;
  }

  
</style>
