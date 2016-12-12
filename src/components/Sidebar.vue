<template>
    <div class="side-bar full-height">
        <h1>{{ msg }}</h1>
        <el-tabs type="border-card" class="tab-card">
            <el-tab-pane label="Fichier">
                <el-form label-position="top">
                    <search-libmol></search-libmol>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="Commande">Commande</el-tab-pane>
            <el-tab-pane label="Séquence">Séquence</el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import SearchLibmol from './Searchlibmol'

export default {
  name: 'sidebar',
  components: {
    SearchLibmol
  },
  /* data () {
    return {
      msg: 'Librairie de molécules'
    }
  } */
  computed: {
    msg () {
      return this.$store.state.name
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1,
    h2 {
        font-weight: normal;
    }
    
    .tab-card {
        width: 100%;
        height: calc(100% - 6em);
        display: flex;
        flex-direction: column;
    }

    .el-tabs__content {
        flex: 1;
    }

    .side-bar {
        margin: 5px
    }
</style>
<style>
    .el-tabs__content {
        flex: 1;
    }
</style>