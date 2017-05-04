<template>
  <div class="shadow" :class="{'border-top': active}">
    <div class="help" v-html="text" @click.stop.prevent="getLink" :style="{ display: (active) ? 'block' : 'none'}">
    </div>
    <div class="navigation" :style="navigationStyle">
      <template v-if="active">
        <i class="el-icon-caret-left" v-if="helpHistory" @click="stepBackHistory"></i>
        <i class="el-icon-caret-right" v-if="helpHistoryForward" @click="stepForwardHistory"></i>
        <i class="el-icon-circle-close close" @click.stop="toggle"></i>
      </template>
      <template v-else>
        <span class="open" @click.stop="toggle">
          <i class="el-icon-information"></i> 
          {{ $t('ui.help.open_help') }}
        </span>
      </template>
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
        active: true
      }
    },
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
      },
      navigationStyle: function () {
        return this.active ? { right: '5px', left: 'auto' } : { left: '5px', right: 'auto' }
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
        this.active = !this.active
      }
    }
  }
</script>

<style>
  .shadow {
    /* box-shadow: #bbb 0px 4px 10px; */
    margin: 8px 0 0 0;
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 2em;
  }
  .border-top {
    border-top: solid 1px #eee;
  }
  .navigation {
    position: absolute;
    top: 5px;
    right: 5px;
    color: #8492a6;
    font-size: 0.9em;
  }
  .navigation i {
    font-size: 1.1em;
  }
  .navigation i:hover {
    color: #20A0FF;
    cursor: pointer;
  }
  .navigation i.close:hover {
    color: #FF4949;
  }
  .navigation .open:hover {
    color: #20A0FF;
    cursor: pointer;
  }
  .help {
    overflow-y: auto;
    font-size: 0.9em;
    flex: 1;
    cursor: text;
    user-select: text;
  }
  .help h1 {
    font-size: 1.1em;
    margin: 0.3em 0;
  }
  .help h2 {
    font-size: 1em;
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
  .help img {
    max-width: 100%;
  }
  .help table {
    border-collapse: collapse;
    border-color: #ddd;
  }
  .help td {
    border: solid 1px;
    border-color: inherit;
    padding: 0 0.5em;
  }
</style>
