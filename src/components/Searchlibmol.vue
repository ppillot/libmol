<template>
    <el-autocomplete v-model="state" :fetch-suggestions="querySearchAsync" placeholder="Mot clé" @select="handleSelect"></el-autocomplete>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'

export default {
  name: 'SearchLibmol',
  data () {
    return {
      links: [],
      state: '',
      timeout: null
    }
  },
  methods: {
    debouncedQuery (queryString, callBack) {
      console.log(_.debounce)
      _.debounce(function () {
        this.querySearchAsync(queryString, callBack)
      }, 10)
    },
    querySearchAsync (queryString, cb) {
      if (queryString.length === 0) {
        this.links.splice(0)
        return
      }

      axios.get('www/recherche.php', {
        params: {
          txt: queryString
        }
      })
      .then(function (response) {
        const rep = response.data.map(item => ({value: item.label, file: item.file, molId: item.molId}))
        console.log(rep)
        cb(rep)
      })
      .catch(function (error) {
        console.log(error)
      })
          // this.results.push(this.query);

    /* var links = this.links
    var results = queryString ? links.filter(this.createFilter(queryString)) : links

    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
        cb(results)
    }, 3000 * Math.random()) */
    },
    handleSelect (item) {
      console.log(item)
    }
  }
}
</script>