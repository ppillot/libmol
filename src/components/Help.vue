<template>
  <div class="shadow">
    <div class="help" v-html="text" @click.stop.prevent="getLink">
    </div>
    <div class="navigation">
      <i class="el-icon-caret-left" v-if="history.length > 0" @click="stepBackHistory"></i>
      <i class="el-icon-caret-right" v-if="forwardHistory.length > 0" @click="stepForwardHistory"></i>
      <i class="el-icon-circle-close"></i>
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
    data: function () {
      return {
        history: [],
        forwardHistory: []
      }
    },
    computed: {
      text: function () {
        return (this.$te('help.' + this.helpToken))
          ? Marked(this.$t('help.' + this.helpToken))
          : ''
      },
      helpToken: function () {
        const help = this.$store.state.help
        // console.log(help, this.history, this.forwardHistory)
        if (!help.link) {
          this.history.splice(0)
          this.forwardHistory.splice(0)
        }
        return help.token
      }
    },
    methods: {
      getLink: function (event) {
        const href = event.target.getAttribute('href')
        if (href) {
          const subject = getHelpSubject(href)
          if (subject !== null) {
            this.newHistory(this.helpToken)
            this.$store.dispatch('help', subject)
          }
        }
      },

      newHistory: function (token) {
        this.history.push(token)
        this.forwardHistory.splice(0)
      },

      stepBackHistory: function () {
        const token = this.history.pop()
        this.forwardHistory.push(this.helpToken)
        this.$store.dispatch('help', {token: token, active: true})
      },

      stepForwardHistory: function () {
        const token = this.forwardHistory.pop()
        this.history.push(this.$store.state.help)
        this.$store.dispatch('help', {token: token, active: true})
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
  }
  .navigation {
    position: absolute;
    top: 5px;
    right: 5px;
  }
  .help {
    flex: 1;
    overflow-y: auto;
    font-size: 0.9em;
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
