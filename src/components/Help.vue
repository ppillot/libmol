<template>
  <div class="shadow">
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
          <i class="el-icon-info"></i>
          {{ $t('ui.help.open_help') }}
        </span>
      </template>
    </div>
  </div>
</template>

<script>
import { getHelpSubject } from '../utils/help.ts'
import Marked from '../utils/markedWrapper'

export default {
  name: 'Help',
  props: {
    namespace: {
      default: 'commands',
      type: String
    },
    start: {
      default: '',
      type: String
    }
  },
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
      return this.$store.state.helpHistory[this.namespace].length > 0
    },
    helpHistoryForward: function () {
      return this.$store.state.helpHistoryForward[this.namespace].length > 0
    },
    helpToken: function () {
      const helpFilename = this.$store.state.help[this.namespace]
      return (helpFilename === '') ? this.start : helpFilename
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
          this.$store.dispatch('help', {
            namespace: this.namespace,
            ...subject
          })
        }
      }
    },

    stepBackHistory: function () {
      this.$store.dispatch('helpNavigate', {
        step: 'backward',
        namespace: this.namespace
      })
    },

    stepForwardHistory: function () {
      this.$store.dispatch('helpNavigate', {
        step: 'forward',
        namespace: this.namespace
      })
    },

    toggle: function () {
      this.active = !this.active
    }
  },
  updated: function () {
    this.$el.firstChild.scrollTop = 0
  }
}
</script>

<style>
  .shadow {
    /* box-shadow: #bbb 0px 4px 10px; */
    margin: 0;
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
    transition: color 0.3s cubic-bezier(.645,.045,.355,1);
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
    margin: 1em 0 0.5em 0;
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
    margin: 1em 0
  }
  .help th {
    border: none;
    border-bottom: solid 1px #607d88;
    padding: 0.4em 0.5em;
  }
  .help tr {
    border-bottom: solid 1px #ddd;
  }
  .help td {
    padding: 0.4em 0.5em;
  }
  code {
    font-size: 1.2em;
    color: #8492a6;
}
</style>
