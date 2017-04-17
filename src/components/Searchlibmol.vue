<template>
  <form-item :label="$t('ui.search_libmol_label')">
    <el-autocomplete v-model="state" :fetch-suggestions="debouncedQuery" placeholder="Mot clé" @select="handleSelect"></el-autocomplete>
  </form-item>
</template>

<script>
import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import FormItem from './FormItem'

export default {
  name: 'SearchLibmol',
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
      300,
      function (q, c) {
        this.querySearchAsync(q, c)
      }),

    querySearchAsync (queryString, cb) {
      if (queryString.length === 0) {
        this.links.splice(0)
        return
      }
      const path = (process.env.NODE_ENV !== 'production') ? 'api/recherche.php' : 'https://libmol.org/api/recherche.php'

      axios.get(path, {
        params: {
          txt: queryString
        }
      })
      .then(function (response) {
        const rep = response.data.map(item => ({ value: item.label, file: (item.file.indexOf('.cif') > -1) ? 'static/mol/' + item.file : 'static/mol/pdb/' + item.file + '.pdb', molId: item.molId }))
        cb(rep)
      })
      .catch(function (error) {
        console.log(error)
      })
/* fetch('api/recherche.php', {
        method: 'GET',
        body: {
          txt: queryString
        }
      })
      .then(function (response) {
        const data = response.json()
        console.log(data)
        const rep = data.map(item => ({ value: item.label, file: 'static/mol/pdb/' + item.file + '.pdb', molId: item.molId }))
        cb(rep)
      })
      .catch(function (error) {
        console.log(error)
      }) */
    },
    handleSelect (item) {
      this.$store.dispatch('loadNewFile', item)
    }
  }
}
</script>
