<template>
  <el-form-item label="Rechercher dans la Protein Data Bank">
    <el-autocomplete v-model="state" :fetch-suggestions="debouncedQuery" placeholder="Keyword" @select="handleSelect"></el-autocomplete>
  </el-form-item>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'

export default {
  name: 'SearchPdb',
  data () {
    return {
      links: [],
      state: '',
      timeout: null
    }
  },
  methods: {
    debouncedQuery: _.debounce(
      function (q, c) {
        this.querySearchAsync(q, c)
      }, 600),

    querySearchAsync (queryString, cb) {
      if (queryString.length === 0) {
        this.links.splice(0)
        return
      }
      var xml = `<orgPdbQuery>
        <queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType>
        <description>Text Search</description>
        <keywords>${queryString}</keywords>
      </orgPdbQuery>`
      axios.post('http://www.rcsb.org/pdb/rest/search',
        xml
      , {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }
      )
      .then(function (response) {
        console.log(response)
        if (response.data.length > 0) {
          let listPdbId = response.data.split('\n').join(',')
          axios.get('http://www.rcsb.org/pdb/rest/customReport', {
            params: {
              pdbids: listPdbId,
              customReportColumns: 'structureId,structureTitle'
            }
          })
          .then(function (response) {
            console.log(response)
            const xmlDocument = response.request.responseXML
            window.xmlDocument = xmlDocument
            const recordNodelist = xmlDocument.getElementsByTagName('record')
            let rep = []
            for (var item of recordNodelist) {
              rep.push({
                value: item.children[1].textContent,
                file: `rcsb://${item.children[0].textContent}`
              })
            }
            cb(rep)
          })
          .catch(function (error) {
            console.log(error)
          })
        }
      })
      /* .then(function (response) {
        const rep = response.data.map(item => ({ value: item.label, file: 'static/mol/pdb/' + item.file + '.pdb', molId: item.molId }))
        cb(rep)
      }) */
      .catch(function (error) {
        console.log(error)
      })
    },
    handleSelect (item) {
      this.$store.dispatch('loadNewFile', item)
    }
  }
}
</script>