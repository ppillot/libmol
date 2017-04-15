<template>
  <form-item :label="$t('ui.search_pdb_label')">
    <el-autocomplete v-model="state" :fetch-suggestions="debouncedQuery" placeholder="Keyword" @select="handleSelect"></el-autocomplete>
  </form-item>
</template>

<script>
import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import FormItem from './FormItem'

export default {
  name: 'SearchPdb',
  components: {
    FormItem
  },
  data () {
    return {
      links: [],
      state: '',
      timeout: null
    }
  },
  methods: {
    debouncedQuery: debounce(
      600,
      function (q, c) {
        this.querySearchAsync(q, c)
      }),

    querySearchAsync (queryString, cb) {
      if (queryString.length === 0) {
        this.links.splice(0)
        return
      }
      /* var xml = `<orgPdbQuery>
        <queryType>org.pdb.query.simple.AdvancedKeywordQuery</queryType>
        <description>Text Search</description>
        <keywords>${queryString}</keywords>
      </orgPdbQuery>` */
      // var self = this
      /* axios.post('http://www.rcsb.org/pdb/rest/search',
        xml
      , {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }
      ) */
      axios.get('api/jsmol.php',
        {
          params: {
            call: 'getInfoFromDatabase',
            database: '=',
            query: queryString
          }
        }
      , {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }
      )
      /* .then(function (response) {
        console.log(response)
        if (response.data.length > 0) {
          let listPdbId = response.data.split('\n').join(',')
          return axios.get('http://www.rcsb.org/pdb/rest/customReport', {
            params: {
              pdbids: listPdbId,
              customReportColumns: 'structureId,structureTitle'
            }
          })
        } else {
          // self.$message.error(self.$t('messages.no_record_found'))
          throw new Error(self.$t('messages.no_record_found'))
        }
      }) */
      .then(function (response) {
        const xmlDocument = response.request.responseXML
        const recordNodelist = xmlDocument.getElementsByTagName('record')

        let rep = []
        for (var item of recordNodelist) {
          rep.push({
            value: item.children[1].textContent,
            file: 'rcsb://' + item.children[0].textContent,
            molId: item.children[0].textContent
          })
        }
        cb(rep)
      })
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
