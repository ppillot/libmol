<template>
  <form-item :label="$t('ui.search_libmol_label')"
    @blur="activate(false)">
    <div class="input-text" >
      <input type="text"
        spellcheck="false"
        :value="state"
        placeholder="Mot clé"
        @keyup="getSuggestion"
        @focus="activate(true)"
      >
      <div class="suggest" :style="suggestStyles" v-if="isFocused">
        <ul>
          <li v-for="(suggestion, index) in suggestions" @click="handleSelect(index)">
            {{ suggestion.value }}
          </li>
        </ul>
      </div>
    </div>
    <!--<el-autocomplete
      v-model="state"
      :fetch-suggestions="debouncedQuery"
      placeholder="Mot clé"
      @select="handleSelect">
    </el-autocomplete>-->
  </form-item>
</template>

<script>
// import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import FormItem from './FormItem'

export default {
  name: 'SearchLibmol',
  components: {
    FormItem
  },
  data () {
    return {
      suggestions: [],
      timeout: null,
      isFocused: false,
      state: ''
    }
  },
  computed: {
    suggestStyles: function () {
      let rect = this.$el.getBoundingClientRect()
      return {
        top: rect.bottom + 'px',
        left: rect.left + 'px',
        'min-width': rect.width + 'px',
        visibility: (this.suggestions.length === 0) ? 'hidden' : 'visible'
      }
    }
  },
  methods: {
    activate: function (val = true) {
      this.isFocused = val
    },
    getSuggestion: function (event) {
      this.state = event.target.value
      this.debouncedQuery(this.state)
    },
    debouncedQuery: debounce(
      300,
      function (q, c) {
        this.querySearchAsync(q, c)
      }),

    querySearchAsync (queryString, cb) {
      if (queryString.length === 0) {
        this.suggestions.splice(0)
        return
      }
      const path = (process.env.NODE_ENV !== 'production') ? 'api/recherche.php' : 'https://libmol.org/api/recherche.php'

      /*  axios.get(path, {
        params: {
          txt: queryString
        }
      })
      .then(function (response) {
        const rep = response.data.map(item => (
          { value: item.label,
            file: ((item.file.indexOf('.cif') > -1) || (item.file.indexOf('.mmtf') > -1) || (item.file.indexOf('.sdf') > -1))
            ? 'static/mol/' + item.file
            : `static/mol/pdb/${item.file}.pdb`,
            molId: item.molId }))
        cb(rep)
      })
      .catch(function (error) {
        console.log(error)
      }) */
      window.fetch(path, {
        method: 'POST',
        body: JSON.stringify({
          txt: queryString
        })
      })
      .then(response => {
        return response.json()
      })
      .then(data => {
        this.suggestions = data.map(item => ({ value: item.label,
          file: ((item.file.indexOf('.cif') > -1) || (item.file.indexOf('.mmtf') > -1) || (item.file.indexOf('.sdf') > -1))
            ? 'static/mol/' + item.file
            : `static/mol/pdb/${item.file}.pdb`,
          molId: item.molId }))
        // cb(rep)
      })
      .catch(function (error) {
        console.log(error)
      })
    },
    handleSelect (index) {
      this.$store.dispatch('loadNewFile', this.suggestions[index])
    }
  }
}
</script>

<style>
  .input-text {
    width: 100%;
    display: inline-block;
    border-radius: 3px;
    border: 1px solid #D3DCE6;
    font-size: 1em;
    box-sizing: border-box;
    padding: 0.5em;
  }
  .input-text input::placeholder {
    color: #99A9BF;
  }
  .input-text input {
    box-sizing: border-box;
    font-size: 1em;
    outline: none;
    width: 100%;
    border: none;
  }
  .suggest {
    position: fixed;
    width: 30em;
    background: white;
    /* border: 1px solid #d1dbe5; */
    z-index: 3;
    border-radius: 3px;
    max-height: 15em;
    overflow: scroll;
    box-shadow: 0 1px 3px #aaa;
  }

  .suggest .category {
    background: #324057;
    font-weight: 600;
    color: #fff;
    padding: 0.2em 0.5em 0.2em 0.5em;
  }

  .suggest ul {
    width: 100%;
    margin: 0 0 0.5em 0;
    list-style: none;
    padding: 0;
    overflow: hidden;
  }
  .suggest ul li {
    width: 100%;
    padding: 0.5em 0.5em 0.5em 1em;
    cursor: pointer;
    color: #8492a6;
    box-sizing: border-box;
    line-height: 1.5em;
  }
  .suggest ul li:hover {
    background: #20A0FF;
    color: #FFF;
  }
</style>

