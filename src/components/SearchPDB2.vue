/* eslint-disable template-curly-spacing */
<template>
  <base-search-database
    :suggestions="suggestions"
    :label-text="$t('ui.search_pdb_label')"
    placeHolderText="Keyword"
    :displayMolIdInSuggestions="true"
    @search="getSuggestion"
    @picked="handleSelect"
    @submitted="handleSubmit"
  />
</template>

<script>
import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import BaseSearchDatabase from './BaseSearchDatabase'

const CancelToken = axios.CancelToken
let source

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
      }
    ),

    querySearchAsync (queryString) {
      if (queryString.length < 2) {
        this.suggestions.splice(0)
        return
      }
      source = CancelToken.source()
      axios.post('https://search.rcsb.org/rcsbsearch/v2/query',
        {
          return_type: 'entry',
          query: {
            type: 'terminal',
            service: 'full_text',
            parameters: {
              value: queryString
            }
          }
        },
        {
          cancelToken: source.token
        }
      )
        .then(function (response) {
        // console.log(response)

          // RCSB Search API returns results in the form
          // {
          //  explain_meta_data:...
          //  query_id: string
          //  result_set: {
          //    identifier: 'PDBID',
          //    score: number
          //    services: [number]
          //  }
          //  result_type: 'entry'
          //  total_count: number
          // }

          if (response.data.result_set && response.data.result_set.length > 0) {
            let listPdbId = response.data.result_set.map(val => val.identifier)

            // Create the GraphQL query
            // This is necessary to fetch multiple results at once.
            // To test, use this playground:
            // https://data.rcsb.org/graphql/index.html?query=%23%20Welcome%20to%20RCSB%20PDB%20Data%20API%3A%20GraphiQL%20interface%0A%23%0A%23%20GraphiQL%20is%20an%20in-browser%20tool%20for%20writing%2C%20validating%2C%20and%0A%23%20testing%20GraphQL%20queries.%0A%23%0A%23%20Type%20queries%20into%20this%20side%20of%20the%20screen%2C%20and%20you%20will%20see%20intelligent%0A%23%20typeaheads%20aware%20of%20the%20RCSB%20PDB%20GraphQL%20type%20schema%20and%20live%20syntax%20and%0A%23%20validation%20errors%20highlighted%20within%20the%20text.%0A%23%0A%23%20The%20%22Docs%22%20link%20on%20top%20right%20allows%20to%20browse%20the%20schema%20and%20its%20%0A%23%20documentation.%0A%23%0A%23%20GraphQL%20queries%20typically%20start%20with%20a%20%22%7B%22%20character.%20Lines%20that%20starts%0A%23%20with%20a%20%23%20are%20ignored.%0A%23%0A%23%20An%20example%20GraphQL%20query%20retrieving%20data%20at%20the%20PDB%20entry%20level%20would%20be%3A%0A%23%0A%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20entries(entry_ids%3A%20%5B%224HHB%22%2C%20%221J77%22%5D)%20%7B%0A%20%20%20%20%20%20%20%20%20struct%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20entry%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%7D%0A%23%0A%23%20Keyboard%20shortcuts%3A%0A%23%0A%23%20%20%20%20%20%20%20Run%20Query%3A%20%20Ctrl-Enter%20(or%20press%20the%20play%20button%20above)%0A%23%0A%23%20%20%20Auto%20Complete%3A%20%20Ctrl-Space%20(or%20just%20start%20typing)%0A%23%0A%23%20This%20tool%20is%20useful%20for%20prototyping%20and%20getting%20a%20feeling%20of%20how%20to%20construct%20%0A%23%20queries%20and%20to%20understand%20the%20schema.%20To%20use%20programmatically%20you%20can%20POST%20%0A%23%20your%20requests%20under%20the%20%2Fgraphql%20endpoint.%20%0A

            let lGraphQLQuery = `{
              entries(entry_ids: ["${listPdbId.join('","')}"]) {
                struct {
                  title
                }
                entry {
                  id
                }
              }
            }`

            // remove blank characters from GraphQL query

            lGraphQLQuery = lGraphQLQuery.replace(/\s/g, '')

            // Note: axios does its own encoding when lGraphQuery is passed as
            // an argument to its `get()` method, and it's corrupted on RCSB's
            // side. Here we provide the URL encoded query directly in the URL.

            return axios.get(
              'https://data.rcsb.org/graphql?query=' + encodeURI(lGraphQLQuery),
              {
                cancelToken: source.token
              }
            )
          } else {
            // self.$message.error(self.$t('messages.no_record_found'))
            throw new Error(this.$t('messages.no_record_found'))
          }
        }.bind(this))
        .then(function ({ data }) {
          console.log(data)

          let rep = data.data.entries.map(e => {
            const pdbid = e.entry.id
            const title = e.struct.title

            return {
              value: title,
              file: 'rcsb://' + pdbid,
              molId: pdbid,
              source: 'pdb'
            }
          })

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
    },

    // user has directly submitted a text. CHeck for PDB code
    handleSubmit (val) {
      if (val.length < 4 && val.length > 0) {
        this.$store.dispatch('loadNewFile', {
          file: `https://files.rcsb.org/ligands/view/${val}.cif`,
          value: '',
          source: 'pdb ligand',
          molId: val
        })
      } else if (val.length === 4) {
        this.$store.dispatch('loadNewFile', {
          file: `rcsb://${val}`,
          value: '',
          source: 'pdb',
          molId: val
        })
      }
      // default case is not valid pdb ref... do nothing!
    }
  }
}
</script>
