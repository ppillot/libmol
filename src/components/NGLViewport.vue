<template>
    <div class="ngl full-height" id="viewport">
        <div></div>
    </div>
</template>

<script>
// import * as NGL from 'ngl'

export default {
  name: 'ngl',
  data () {
    return {
      msg: 'Librairie de molécules'
    }
  },
  computed () {
    return {
      fileName () {
        return this.$store.state.fileName
      }
    }
  },
  mounted () {
    this.$store.dispatch('createNewStage', {id: 'viewport'})
    // let stage = new NGL.Stage('viewport', { backgroundColor: 'white' })
    // stage.loadFile('rcsb://1crn', { defaultRepresentation: true })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1,
    h2 {
        font-weight: normal;
    }
    
    ul {
        list-style-type: none;
        padding: 0;
    }
    
    li {
        display: inline-block;
        margin: 0 10px;
    }
    
    a {
        color: #42b983;
    }
</style>