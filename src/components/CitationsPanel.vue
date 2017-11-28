<template>
  <div>
    <p v-if="source.code == 'libmol'">
      Librairie de molécules
    </p>
    <div class="section" v-if="source.code !== ''">
      <h2>Source du modèle</h2>
      <a :href="source.href" target="_blank">{{ source.title }}</a> 
      Identifiant : 
      <a :href="molHref" target="_blank" class="dbid">{{ molCode }}</a>
      <br>
      Auteurs : {{ citation.structure_authors }}
    </div>
    <div v-else-if="citation.structureId == molCode">
      Banque de données du modèle moléculaire : 
      <a :href="source.href" target="_blank"> Protein Data Bank </a> 
      <a :href="source.href" target="_blank"> {{ molCode }} </a>
    </div>
    <div class="section">
      <h2>Référence</h2>
      <div class="section">
        PDB ID: {{ molCode }}, {{ citation.citation_authors }} ({{ pubmed.year }})
        "<i>{{ pubmed.articleTitle }}</i>", {{ pubmed.journal }} {{ pubmed.volume }}: {{ pubmed.pages }}
        <a 
          :href="`http://dx.doi.org/${ pubmed.doi }`" 
          target="_blank" 
          v-if="pubmed.doi !== ''"
          >
          DOI: {{ pubmed.doi }}
        </a>
      </div>
      <div class="section">
        Pubmed 
          <a 
            :href="`https://www.ncbi.nlm.nih.gov/pubmed/${pubmed.pubmedId}`" 
            target="_blank"
            class="dbid">
            {{ pubmed.pubmedId }}
          </a>
        <span v-if="pubmed.pmc !== ''">
          Article complet sur Pubmed Central 
          <a 
            :href="`https://www.ncbi.nlm.nih.gov/pmc/articles/${pubmed.pmc}`" 
            target="_blank"
            class="dbid">
            {{ pubmed.pmc }}
            </a>
        </span>
      </div>
      <div class="section">
        <b>Résumé</b>
        <br/>
        {{ pubmed.abstract }}
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  const PDBCodeRegEx = /^\d\w{3}$/i
  const PDBHeteroCode = /^\w{3}$/i

  export default {
    name: 'citationsPanel',
    data () {
      return {
        citation: {
          structureId: '',
          title: '',
          pubmedId: '',
          citation_authors: ''
        },
        pubmed: {
          pmc: '',
          doi: '',
          volume: '',
          journal: '',
          pages: '',
          year: '',
          month: '',
          day: '',
          articleTitle: '',
          abstract: ''
        }
      }
    },
    computed: {
      source: function () {
        let response = {}
        switch (this.$store.state.source) {
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
            this.getDescriptionFromLibmol(this.$store.data.dbId)
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
      molCode: function () {
        this.citation = {
          structureId: '',
          title: '',
          pubmedId: '',
          citation_authors: ''
        }

        this.pubmed = {
          pubmedId: '',
          pmc: '',
          doi: '',
          volume: '',
          journal: '',
          pages: '',
          year: '',
          month: '',
          day: '',
          articleTitle: '',
          abstract: ''
        }

        if (PDBCodeRegEx.test(this.$store.state.molCode)) {
          this.getDescriptionFromPDB(this.$store.state.molCode)
        }
        return this.$store.state.molCode
      },
      molHref: function () {
        if (this.molCode !== '') {
          if (PDBCodeRegEx.test(this.molCode)) {
            return `http://www.rcsb.org/pdb/explore/explore.do?structureId=${this.molCode.toLowerCase()}`
          } else if (PDBHeteroCode.test(this.molCode)) {
            return `http://www4.rcsb.org/ligand/${this.molCode.toUpperCase()}`
          } else if (this.$store.state.source === 'libmol') {
            return `http://www.librairiedemolecules.education.fr/molecule.php?idmol=${this.$store.state.dbId}`
          }
        }
        return ''
      }
    },
    methods: {
      getDescriptionFromPDB (pdbCode) {
        console.log(pdbCode)
        axios.get('https://www.rcsb.org/pdb/rest/describePDB', {
          params: {
            structureId: pdbCode
          }
        }).then(function ({data}) {
          /* global DOMParser */
          const parser = new DOMParser()
          const xmlDocument = parser.parseFromString(data, 'application/xml')
          const pdbNode = xmlDocument.getElementsByTagName('PDB')[0]
          console.log(pdbNode)
          let response = {
            structureId: pdbNode.getAttribute('structureId'),
            title: pdbNode.getAttribute('title'),
            pubmedId: pdbNode.getAttribute('pubmedId'),
            structure_authors: pdbNode.getAttribute('structure_authors'),
            citation_authors: pdbNode.getAttribute('citation_authors')
          }

          this.citation = response

          if (response.pubmedId) {
            this.getAbstractFromPubmed(response.pubmedId)
          }
        }.bind(this))
      },
      getDescriptionFromLibmol (id) {

      },
      getAbstractFromPubmed (pubmedId) {
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
          let response = {
            pubmedId: pubmedId,
            pmc: this.getSelectorContent(xmlDocument, 'ArticleId[IdType="pmc"]'),
            doi: this.getSelectorContent(xmlDocument, 'ArticleId[IdType="doi"]'),
            articleTitle: this.getSelectorContent(xmlDocument, 'ArticleTitle'),
            volume: this.getSelectorContent(xmlDocument, 'Volume'),
            journal: this.getSelectorContent(xmlDocument, 'Title'),
            pages: this.getSelectorContent(xmlDocument, 'MedlinePgn'),
            year: this.getSelectorContent(xmlDocument, 'PubDate > Year'),
            month: this.getSelectorContent(xmlDocument, 'PubDate > Month'),
            day: this.getSelectorContent(xmlDocument, 'PubDate > Day'),
            abstract: this.getSelectorContent(xmlDocument, 'AbstractText')
          }

          this.pubmed = response
          this.citation.title = response.articleTitle
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
