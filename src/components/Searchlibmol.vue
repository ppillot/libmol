<template>
  <base-search-database
    :suggestions="suggestions"
    :label-text="$t('ui.search_libmol_label')"
    placeHolderText="Mot clé"
    :displayMolIdInSuggestions="false"
    @search="getSuggestion"
    @picked="handleSelect"
  />
</template>

<script>
import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import BaseSearchDatabase from './BaseSearchDatabase'

const CancelToken = axios.CancelToken
let source

export default {
  name: 'SearchLibmol',
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

      const sessionStorageValue = window.sessionStorage.getItem(`searchLibmol-${queryString}`)
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
      if (queryString.length === 0) {
        this.suggestions.splice(0)
        return
      }
      source = CancelToken.source()

      const path = (process.env.NODE_ENV !== 'production') ? 'api/recherche.php' : 'https://libmol.org/api/recherche.php'

      axios.get(path, {
        params: {
          txt: queryString
        },
        cancelToken: source.token
      })
        .then((response) => {
          this.suggestions = response.data.map(item => (
            { value: item.label,
              file: ((item.file.indexOf('.cif') > -1) || (item.file.indexOf('.mmtf') > -1) || (item.file.indexOf('.sdf') > -1))
                ? 'static/mol/' + item.file
                : `static/mol/pdb/${item.file}.pdb`,
              molId: item.molId,
              source: 'libmol'
            })
          )

          window.sessionStorage.setItem(`searchLibmol-${queryString}`, JSON.stringify(this.suggestions))
          source = undefined
        })
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
