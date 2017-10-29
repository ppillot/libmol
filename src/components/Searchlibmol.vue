<template>
  <form-item :label="$t('ui.search_libmol_label')"
    @blur="activate(false)">
    <div class="input-text" >
      <input type="text"
        spellcheck="false"
        placeholder="Mot clé"
        @keyup="getSuggestion"
        @keydown.down.prevent="highlightSuggestion(1)"
        @keydown.up.prevent="highlightSuggestion(-1)"
        @keydown.enter="handleSelect(highlightedSuggestion)"
        @focus="activate(true)"
      >
      <span v-if="this.suggestions.length > 0" class="suggest-counter">
        {{ suggestions.length }}
      </span>
      <div class="suggest" :style="suggestStyles" v-if="isFocused">
        <ul>
          <li v-for="(suggestion, index) in suggestions" 
          @click="handleSelect(index)" 
          @mouseover="highlightedSuggestion = index"
          :class="{highlight: (highlightedSuggestion === index)}"
          :key="suggestion.molId">
            {{ suggestion.value }}
          </li>
        </ul>
      </div>
    </div>
  </form-item>
</template>

<script>
import axios from 'axios'
import debounce from 'throttle-debounce/debounce'
import FormItem from './FormItem'

const CancelToken = axios.CancelToken
const source = CancelToken.source()

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
      state: '',
      highlightedSuggestion: -1
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

      const queryString = event.target.value

      source.cancel()
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
      const path = (process.env.NODE_ENV !== 'production') ? 'api/recherche.php' : 'https://libmol.org/api/recherche.php'

      axios.get(path, {
        params: {
          txt: queryString,
          cancelToken: source.token
        }
      })
      .then(function (response) {
        this.suggestions = response.data.map(item => (
          { value: item.label,
            file: ((item.file.indexOf('.cif') > -1) || (item.file.indexOf('.mmtf') > -1) || (item.file.indexOf('.sdf') > -1))
            ? 'static/mol/' + item.file
            : `static/mol/pdb/${item.file}.pdb`,
            molId: item.molId,
            source: 'libmol'
          }))

        window.sessionStorage.setItem(`searchLibmol-${queryString}`, JSON.stringify(this.suggestions))
      }.bind(this))
      .catch(function (error) {
        console.log(error)
      })
    },
    handleSelect (index) {
      this.$store.dispatch('loadNewFile', this.suggestions[index])
    },
    highlightSuggestion (delta) {
      if (this.isFocused && this.suggestions.length > 0) {
        this.highlightedSuggestion += delta
        if (this.highlightedSuggestion <= -1) this.highlightedSuggestion = -1
        else this.checkVisibility(delta)
      }
    },
    checkVisibility (delta) {
      let suggestionsListNode = this.$el.getElementsByClassName('suggest')[0]
      let focusedResult = suggestionsListNode.firstChild.children[this.highlightedSuggestion]
      switch (delta) {
        case 1:
          if (suggestionsListNode.scrollTop + suggestionsListNode.offsetHeight - 10 < focusedResult.offsetTop) {
            focusedResult.scrollIntoView(false)
          }
          break
        case -1:
          if (suggestionsListNode.scrollTop > focusedResult.offsetTop) {
            focusedResult.scrollIntoView()
          }
          break
      }
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
  .suggest li.highlight  {
    background: #20A0FF;
    color: #FFF;
  }
</style>

