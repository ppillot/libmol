<template>
    <div class="side-bar full-height">
        <h1>LibMol</h1>
        <el-tabs value="files" type="border-card" class="tab-card" @tab-click="switchTab">
            <el-tab-pane :label="$t('ui.files_tab_label')" name="files">
                <search-libmol></search-libmol>
                <search-pdb></search-pdb>
                <load-file></load-file>
            </el-tab-pane>
            <el-tab-pane :label="$t('ui.commands_tab_label')" name="commands">
                <select-mol></select-mol>
                <display-mol></display-mol>
                <color-mol></color-mol>
                <!--<help></help>-->
            </el-tab-pane>
            <el-tab-pane :label="$t('ui.sequences_tab_label')" name="sequences">
                <sequence-tab :active="isSequenceTabActive"></sequence-tab>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import SearchLibmol from './Searchlibmol'
import SearchPdb from './SearchPdb'
import LoadFile from './Loadfile'
import SelectMol from './SelectMol'
import DisplayMol from './DisplayMol'
import ColorMol from './ColorMol'
import SequenceTab from './SequenceTab'
// import Help from './Help'

export default {
  name: 'sidebar',
  components: {
    SearchLibmol,
    SearchPdb,
    LoadFile,
    SelectMol,
    DisplayMol,
    ColorMol,
    SequenceTab
  },
  data () {
    return {
      isSequenceTabActive: false
    }
  },
  methods: {
    switchTab (tabClicked) {
      this.isSequenceTabActive = (tabClicked.name === 'sequences')
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

    .side-bar {
        margin: 0 5px 5px 5px
    }
</style>
<style>
    .el-tabs__content {
        display: flex;
        flex-direction: column;
        max-height: 100%;
    }
    
    .el-tab-pane {
        flex: 1;
        display: flex;
        flex-direction: column;
        max-height: 100%;
    }

    .el-tab-pane__content {
        display: flex;
        flex-direction: column;
        max-height: 100%;
        flex: 1;
    }

    .el-autocomplete {
        width: 100%
    }
</style>
