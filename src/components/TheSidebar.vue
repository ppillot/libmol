<template>
    <div class="side-bar full-height">
        <h1 @click="dialogVisible = true">LibMol<span> {{$t('ui.about.title')}}...</span></h1>
        
        <about-panel :visible="dialogVisible" @close="dialogVisible = false"/>

        <el-tabs value="files" type="border-card" class="tab-card" @tab-click="switchTab">
            <el-tab-pane :label="$t('ui.files_tab_label')" name="files">
                <search-libmol/>
                <search-pdb/>
                <load-file/>
            </el-tab-pane>
            <el-tab-pane :label="$t('ui.commands_tab_label')" name="commands">
                <commands-tab/>
            </el-tab-pane>
            <el-tab-pane :label="$t('ui.sequences_tab_label')" name="sequences" :disabled="noSequence">
                <sequence-tab :active="isSequenceTabActive"/>
            </el-tab-pane>
            <el-tab-pane :label="$t('ui.contacts_tab_label')" name="contacts" :disabled="noSequence">
                <contacts-tab/>
            </el-tab-pane>
            
            <el-tab-pane :label="$t('ui.surfaces_tab_label')" name="surfaces">
                <surface-tab/>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import SearchLibmol from './Searchlibmol'
import SearchPdb from './SearchPDB2'
import LoadFile from './Loadfile'
import SequenceTab from './SequenceTab'
import SurfaceTab from './SurfaceTab'
import CommandsTab from './CommandsTab'
import AboutPanel from './AboutPanel'
import ContactsTab from './ContactsTab'

export default {
  name: 'theSidebar',
  components: {
    SearchLibmol,
    SearchPdb,
    LoadFile,
    SequenceTab,
    SurfaceTab,
    CommandsTab,
    ContactsTab,
    AboutPanel
  },
  data () {
    return {
      isSequenceTabActive: false,
      dialogVisible: false
    }
  },
  computed: {
    noSequence: function () {
      return this.$store.state.mol.noSequence
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

    h1 {
        cursor: help;
    }
    
    h1:hover {
        color: #1D8CE0;
        transition: color 0.5s ease-in-out 0.2s;
    }

    h1 span {
        opacity: 0;
        font-size: 0.5em;
    }

    h1:hover span {
        opacity: 1;
        transition: opacity 1s ease-in-out 0.2s;
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
        flex: 1;
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

</style>
