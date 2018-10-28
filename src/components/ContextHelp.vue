<template>
  <span>
    <el-popover
      ref="help"
      :placement="placement"
      width="400"
      :trigger="triggerEvent">
      <div class="help" v-html="text" @click.stop.prevent="getLink">
      </div>
    </el-popover>
    <span v-popover:help >
      <slot>
        <i class="el-icon-info"></i>
      </slot>
    </span>
  </span>
</template>

<script>
  import {getHelp, getHelpSubject} from '../utils/help.ts'
  import Marked from '../utils/markedWrapper'

  export default {
    name: 'ContextHelp',
    props: {
      subject: {
        default: '',
        type: String
      },
      namespace: {
        default: 'contacts',
        type: String
      },
      placement: {
        default: 'right',
        type: String
      },
      triggerEvent: {
        default: 'click',
        type: String
      }
    },
    data: function () {
      return {
        helpToken: ''
      }
    },
    computed: {
      text: function () {
        return (this.$te('help.' + this.helpToken))
          ? Marked(this.$t('help.' + this.helpToken))
          : ''
      }
    },
    methods: {
      getLink: function (event) {
        const href = event.target.getAttribute('href')
        if (href) {
          const subject = getHelpSubject(href)
          if (subject !== null) {
            this.helpToken = subject.token
          }
        }
      }
    },
    mounted: function () {
      this.helpToken = getHelp(this.namespace, this.subject)
    }
  }
</script>

<style scoped>
  i {
    color: #88a9d4;
    line-height: 1.4em;
  }
  i:hover {
    color: #20a0ff;
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
