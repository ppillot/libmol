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

<script lang="ts">
import ajax, { LibmolQueryResponse } from '../utils/queryLibmolAjax'
import { debounce } from 'throttle-debounce'
import BaseSearchDatabase from './BaseSearchDatabase.vue'
import { LibmolResponse } from '../utils/queryLibmolElectron'

// this replaces the webapp ajax call by a DB query in electron app
let query = ajax
if (process.env.IS_ELECTRON) {
  import('../utils/queryLibmolElectron').then(mod => {
    query = mod.default
  })
}

export default {
  name: 'SearchLibmol',
  components: {
    BaseSearchDatabase
  },
  data () {
    return {
      suggestions: [] as any[]
    }
  },
  methods: {
    getSuggestion: function (queryString: string) {
      query.cancelRequest()

      const sessionStorageValue = window.sessionStorage.getItem(`searchLibmol-${queryString}`)
      if (sessionStorageValue !== null) {
        this.suggestions = JSON.parse(sessionStorageValue)
      } else {
        this.debouncedQuery(queryString)
      }
    },

    debouncedQuery: debounce(
      300, false,
      function (q: string) {
        this.querySearchAsync(q)
      }),

    querySearchAsync (queryString: string) {
      if (queryString.length === 0) {
        this.suggestions.splice(0)
        return
      }

      query.query(queryString)
        .then((sug: LibmolResponse[]) => {
          this.suggestions = sug

          window.sessionStorage.setItem(`searchLibmol-${queryString}`, JSON.stringify(this.suggestions))
        })
        .catch(function (error: string) {
          if (query.isCancel(error) && process.env.NODE_ENV !== 'production') {
            console.log('Request canceled', error)
          } else {
            console.log(error)
          }
        })
    },
    handleSelect (index: number) {
      this.$store.dispatch('loadNewFile', this.suggestions[index])
    }
  }
}
</script>
