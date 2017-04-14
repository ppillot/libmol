<template>
  <div class="shadow">
    <div class="help" v-html="text" @click.stop.prevent="getLink">
    </div>
    <div class="navigation">
      <i class="el-icon-caret-left" v-if="helpHistory" @click="stepBackHistory"></i>
      <i class="el-icon-caret-right" v-if="helpHistoryForward" @click="stepForwardHistory"></i>
      <i class="el-icon-circle-close" @click="toggle"></i>
    </div>
  </div>
</template>

<script>
  import getHelp from 'utils/help'
  import Marked from 'marked'
  let renderer = new Marked.Renderer()

  renderer.link = function (href, title, text) {
    let txt = ''
    if (/^\w+-\w+$/.test(href)) { // custom libmol link
      txt = '<a href="#' + href + '" '
      txt += (title) ? 'title="' + title + '"' : ''
      txt += '>' + text + '</a>'
    } else {
      txt = '<a href="' + href + '" '
      txt += (title !== '') ? 'title="' + title + '"' : ''
      txt += ' target="_blank">' + text + '</a>'
    }
    return txt
  }

  Marked.setOptions({
    renderer: renderer,
    sanitize: true
  })

  function getHelpSubject (token) {
    const reg = /^#(\w+)-(\w+)$/ // internal links are based on the hash #action-attribute
    if (reg.test(token)) {
      const results = reg.exec(token)
      const subject = {
        token: getHelp(results[1], results[2]),
        active: true
      }
      return subject
    } else {
      return null
    }
  }

  export default {
    name: 'Help',
    computed: {
      text: function () {
        return (this.$te('help.' + this.helpToken))
          ? Marked(this.$t('help.' + this.helpToken))
          : ''
      },
      helpHistory: function () {
        return this.$store.state.helpHistory.length > 0
      },
      helpHistoryForward: function () {
        return this.$store.state.helpHistoryForward.length > 0
      },
      helpToken: function () {
        return this.$store.state.help
      }
    },
    methods: {
      getLink: function (event) {
        const href = event.target.getAttribute('href')
        if (href) {
          const subject = getHelpSubject(href)
          if (subject !== null) {
            this.$store.dispatch('help', subject)
          }
        }
      },

      stepBackHistory: function () {
        this.$store.dispatch('helpNavigate', 'backward')
      },

      stepForwardHistory: function () {
        this.$store.dispatch('helpNavigate', 'forward')
      },

      toggle: function () {

      }
    }
  }
</script>

<style>
  .shadow {
    border-top: solid 1px #eee;
    border-bottom: none;
    /* box-shadow: #bbb 0px 4px 10px; */
    margin: 8px 0 0 0;
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 2em;
  }
  .navigation {
    position: absolute;
    top: 5px;
    right: 5px;
    color: #8492a6;
  }
  .help {
    overflow-y: auto;
    font-size: 0.9em;
    flex: 1;
  }
  .help h1 {
    font-size: 1.1em;
    margin: 0.3em 0;
  }
  .help p {
    margin-top: 0.3em;
  }
  .help a {
    background: #EFF2F7;
    color: #20A0FF;
    text-decoration-style: dotted;
    text-decoration-line: underline;
  }
  .help a:hover {
    text-decoration-line: none;
    background: none;
  }
</style>
