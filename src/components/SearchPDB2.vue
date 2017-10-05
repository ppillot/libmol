<template>
  <form-item :label="$t('ui.search_pdb_label')"
    @blur="activate(false)">
    <div class="input-text" >
      <input type="text"
        spellcheck="false"
        :value="state"
        placeholder="Keyword"
        @keyup="getSuggestion"
        @focus="activate(true)"
      >
      <span v-if="this.suggestions.length > 0" class="suggest-counter">
        {{ suggestions.length }}{{(suggestions.length >= 50) ? '+' : ''}}
      </span>
      <div class="suggest" :style="suggestStyles" v-if="isFocused">
        <ul>
          <li 
            :title="suggestion.value" 
            v-for="(suggestion, index) in suggestions" 
            @click="handleSelect(index)"
            :key="suggestion.molId">
            <div class="pdb-title">{{ suggestion.value }}</div>
            <div class="pdb-code">
                {{ suggestion.molId }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </form-item>
</template>

<script>
// import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import FormItem from './FormItem'

export default {
  name: 'SearchPdb',
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
      if (val) {
        window.addEventListener('mousedown', this.checkClick.bind(this))
      } else {
        window.removeEventListener('mousedown', this.checkClick)
        this.$el.getElementsByTagName('input')[0].blur()
      }
    },
    checkClick: function (event) {
      if (!this.hasRootAsParent(event.target)) {
        this.activate(false)
      }
    },
    hasRootAsParent: function (node) {
      do {
        if (node === this.$el) return true
        // debugger
        node = node.parentNode
      } while (node !== document.body)
      return false
    },
    getSuggestion: function (event) {
      this.isFocused = true
      this.state = event.target.value
      this.debouncedQuery(this.state)
    },
    debouncedQuery: debounce(
      600,
      function (q, c) {
        this.querySearchAsync(q, c)
      }),

    querySearchAsync (queryString, cb) {
      if (queryString.length === 0) {
        this.suggestions.splice(0)
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
      const path = (process.env.NODE_ENV !== 'production') ? 'api/jsmol.php' : 'https://libmol.org/api/jsmol.php'

      window.fetch(path, {
        method: 'POST',
        body: JSON.stringify({
          call: 'getInfoFromDatabase',
          database: '=',
          query: queryString
        })
      })
      .then(function (response) {
        return response.text()
      })
      /* axios.get('https://libmol.org/api/jsmol.php',
        {
          params: {
            call: 'getInfoFromDatabase',
            database: '=',
            query: queryString
          }
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
      .then(response => {
        /* global DOMParser */
        const parser = new DOMParser()
        const xmlDocument = parser.parseFromString(response, 'application/xml')
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

<style scoped>
  .input-text {
    width: 100%;
    display: inline-flex;
    flex-direction: row;
    border-radius: 3px;
    border: 1px solid #D3DCE6;
    font-size: 1em;
    box-sizing: border-box;
    padding: 0.5em;
    align-items: center;
  }
  .input-text input::placeholder {
    color: #99A9BF;
  }
  .input-text input {
    font-size: 1em;
    outline: none;
    border: none;
    flex: 1;
  }
  .suggest-counter {
    font-size: 0.9em;
    font-weight: bold;
    color: #fff;
    background: #8492a6;
    border-radius: 10px;
    padding: 2px 5px;
    min-width: initial;
  }

  .pdb-code {
    font-size: 0.8em;
    font-weight: bold;
    color: #fff;
    background: #1D8CE0;
    border-radius: 2px;
    min-width: 3em;
    text-align: center;
    line-height: 1.2em;
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
    display: inline-flex;
    align-items: center;
  }
  .suggest ul li:hover {
    background: #20A0FF;
    color: #FFF;
  }
  .suggest ul li:hover .pdb-code {
      background: white;
      color: #1D8CE0;
  }
  .pdb-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

