<template>
  <form-item :label="labelText"
    @blur="activate(false)">
    <div class="input-text" >
      <input type="text"
        spellcheck="false"
        :placeholder="placeHolderText"
        @keyup="getSuggestion"
        @keydown.down.prevent="highlightSuggestion(1)"
        @keydown.up.prevent="highlightSuggestion(-1)"
        @keydown.enter="handleSelect(highlightedSuggestion)"
        @focus="activate(true)"
        v-model="queryString"
      >
      <span v-if="suggestions.length > 0" class="suggest-counter">
        {{ suggestions.length }}
      </span>
      <div class="suggest" :style="suggestStyles" v-if="isFocused">
        <ul>
          <li v-for="(suggestion, index) in suggestions"
          @click="handleSelect(index)"
          @mouseover="highlightedSuggestion = index"
          :class="{highlight: (highlightedSuggestion === index)}"
          :key="suggestion.molId">
            <template v-if="displayMolIdInSuggestions">
              <div class="database-title">
                {{ suggestion.value }}
              </div>
              <div class="database-code">
                  {{ suggestion.molId }}
              </div>
            </template>
            <template v-else>
            {{ suggestion.value }}
            </template>

          </li>
        </ul>
      </div>
    </div>
  </form-item>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'BaseSearchDatabase',
  components: {
    FormItem
  },
  props: {
    labelText: {
      type: String,
      required: true
    },
    placeHolderText: {
      type: String,
      required: true
    },
    suggestions: {
      type: Array,
      required: true
    },
    displayMolIdInSuggestions: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isFocused: false,
      highlightedSuggestion: -1,
      queryString: ''
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
      this.$emit('search', this.queryString)
    },
    handleSelect: function (index) {
      if (index > -1 && this.suggestions[index] !== undefined) this.$emit('picked', index)
      else this.$emit('submitted', this.queryString)
    },
    highlightSuggestion (delta) {
      if (this.isFocused && this.suggestions.length > 0) {
        this.highlightedSuggestion += delta
        if (this.highlightedSuggestion <= -1) {
          this.highlightedSuggestion = -1
        } else if (this.highlightedSuggestion >= this.suggestions.length) {
          this.highlightedSuggestion = this.suggestions.length - 1
        } else {
          this.checkVisibility(delta)
        }
      } else if (this.suggestions.length === 0) {
        this.highlightedSuggestion = -1
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
    line-height: 1.5em;
    display: inline-flex;
    align-items: center;
  }
  .suggest li.highlight  {
    background: #20A0FF;
    color: #FFF;
  }
  .suggest ul li.highlight .database-code {
      background: white;
      color: #1D8CE0;
  }
  .database-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .database-code {
    font-size: 0.8em;
    font-weight: bold;
    color: #fff;
    background: #1D8CE0;
    border-radius: 2px;
    min-width: 3em;
    text-align: center;
    line-height: 1.2em;
  }
</style>
