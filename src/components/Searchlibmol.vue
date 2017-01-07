<template>
  <el-form-item :label="$t('ui.search_libmol_label')">
    <el-autocomplete v-model="state" :fetch-suggestions="debouncedQuery" placeholder="Mot clé" @select="handleSelect"></el-autocomplete>
  </el-form-item>
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
    debouncedQuery: _.debounce(
      function (q, c) {
        this.querySearchAsync(q, c)
      }, 300),

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
        const rep = response.data.map(item => ({ value: item.label, file: 'static/mol/pdb/' + item.file + '.pdb', molId: item.molId }))
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