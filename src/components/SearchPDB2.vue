<template>
  <base-search-database 
    :suggestions="suggestions"
    :label-text="$t('ui.search_pdb_label')"
    placeHolderText="Keyword"
    :displayMolIdInSuggestions="true"
    @search="getSuggestion"
    @picked="handleSelect"
  />
</template>

<script>
// import axios from 'axios'
import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import BaseSearchDatabase from './BaseSearchDatabase'

const CancelToken = axios.CancelToken
let source
// let _cancel

export default {
  name: 'SearchPdb',
  components: {
    BaseSearchDatabase
  },
  data () {
    return {
      suggestions: []
    }
  },
  methods: {
    getSuggestion: function (queryString) {
      this.isFocused = true
      if (source !== undefined) {
        source.cancel()
      }

      const sessionStorageValue = window.sessionStorage.getItem(`searchPDB-${queryString}`)
      if (sessionStorageValue !== null) {
        this.suggestions = JSON.parse(sessionStorageValue)
      } else {
        this.debouncedQuery(queryString)
      }
    },
    debouncedQuery: debounce(
      300,
      function (q) {
        this.querySearchAsync(q)
      }),

    querySearchAsync (queryString) {
      if (queryString.length < 2) {
        this.suggestions.splice(0)
        return
      }
      const xml = `<orgPdbQuery>
        <queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType>
        <description>Text Search</description>
        <keywords>${queryString}</keywords>
      </orgPdbQuery>`
      source = CancelToken.source()
      axios.post('https://www.rcsb.org/pdb/rest/search',
        xml, {
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          cancelToken: source.token
        }
      )
      /*
      const path = (process.env.NODE_ENV !== 'production') ? 'api/jsmol.php' : 'https://libmol.org/api/jsmol.php'

      axios.get(path,
        {
          params: {
            call: 'getInfoFromDatabase',
            database: '=',
            query: queryString
          },
          cancelToken: source.token
        }
      ) */
      .then(function (response) {
        // console.log(response)
        if (response.data.length > 0) {
          let listPdbId = response.data.split('\n').slice(0, 100).join(',')
          return axios.get('https://www.rcsb.org/pdb/rest/customReport', {
            params: {
              pdbids: listPdbId,
              customReportColumns: 'structureId,structureTitle'
            },
            cancelToken: source.token
          })
        } else {
          // self.$message.error(self.$t('messages.no_record_found'))
          throw new Error(this.$t('messages.no_record_found'))
        }
      }.bind(this))
      .then(function ({data}) {
        /* global DOMParser */
        const parser = new DOMParser()
        const xmlDocument = parser.parseFromString(data, 'application/xml')
        const recordNodelist = xmlDocument.getElementsByTagName('record')

        let rep = []
        for (var item of recordNodelist) {
          rep.push({
            value: item.children[1].textContent,
            file: 'rcsb://' + item.children[0].textContent,
            molId: item.children[0].textContent,
            source: 'pdb'
          })
        }
        this.suggestions = rep

        window.sessionStorage.setItem(`searchPDB-${queryString}`, JSON.stringify(rep))
        source = undefined
      }.bind(this))
      .catch(function (error) {
        if (axios.isCancel(error) && process.env.NODE_ENV !== 'production') {
          console.log('Request canceled', error)
        } else {
          console.log(error)
        }
      })
    },
    handleSelect (index) {
      this.$store.dispatch('loadNewFile', this.suggestions[index])
    }
  }
}
</script>
