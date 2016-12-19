<template>
    <div class="side-bar full-height">
        <h1>Librairie de Molécules</h1>
        <el-tabs type="border-card" class="tab-card">
            <el-tab-pane label="Fichier">
                <el-form label-position="top">
                    <search-libmol></search-libmol>
                    <search-pdb></search-pdb>
                    <load-file></load-file>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="Commandes">
                <select-mol></select-mol>
            </el-tab-pane>
            <el-tab-pane label="Séquence">Séquence</el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import SearchLibmol from './Searchlibmol'
import SearchPdb from './SearchPdb'
import LoadFile from './Loadfile'
import SelectMol from './SelectMol'

export default {
  name: 'sidebar',
  components: {
    SearchLibmol,
    SearchPdb,
    LoadFile,
    SelectMol
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