<template>
  <div>
    <hr class="shadow">
    <div class="help" v-html="text">
    </div>
  </div>
</template>

<script>
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

  export default {
    name: 'Help',
    computed: {
      text: function () {
        let helpKey = this.$store.state.help
        return (this.$te('help.' + helpKey))
          ? Marked(this.$t('help.' + helpKey))
          : ''
      }
    },
    methods: {
      loadHelp: function (helpKey) {
        const reg = /(\w+)-(\w+)/g
        const results = reg.exec(helpKey)
        const subject = {
          action: results[1],
          attribute: results[2],
          active: true
        }
        let self = this
        return function () {
          self.$store.dispatch('help', subject)
        }
      }
    },
    updated () {
      // check if there are any internal links...
      const links = this.$el.getElementsByTagName('a')
      const reg = /^#\w+-\w+$/
      for (let i = 0; i < links.length; i++) {
        let href = links[i].getAttribute('href')
        if (reg.test(href)) {
          let helpHandler = this.loadHelp(href.substring(1))
          helpHandler.bind(this)
          links[i].addEventListener('click', helpHandler)
        }
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
