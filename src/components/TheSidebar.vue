<template>
    <div class="side-bar full-height">
        <h1>LibMol</h1>
        <div class="info-links">
            <a href="#"  @click="dialogVisible = true">{{ $t('ui.about.title') }}</a>
            -
            <a href="#"  @click="dialogVisible = true">Conditions générales</a>
        </div>

        <about-panel :visible="dialogVisible" @close="dialogVisible = false"/>

        <el-tabs v-model="activeTab" type="border-card" class="tab-card">
            <el-tab-pane :label="$t('ui.files_tab_label')" name="files">
                <search-libmol/>
                <search-pdb/>
                <load-file/>
            </el-tab-pane>
            <el-tab-pane :label="$t('ui.commands_tab_label')" name="commands">
                <commands-tab/>
            </el-tab-pane>
            <el-tab-pane :label="$t('ui.sequences_tab_label')" name="sequences" :disabled="noSequence">
                <sequence-tab :active="activeTab === 'sequences'"/>
            </el-tab-pane>

            <el-tab-pane :label="$t('ui.surfaces_tab_label')" name="surfaces">
                <surface-tab/>
            </el-tab-pane>

            <el-tab-pane :label="$t('ui.contacts_tab_label')" name="contacts" :disabled="noSequence">
                <contacts-tab/>
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
  name: 'TheSidebar',
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
      dialogVisible: false
    }
  },
  computed: {
    noSequence: function () {
      return this.$store.state.mol.noSequence
    },
    activeTab: {
      get: function () {
        return this.$store.state.activeTab
      },
      set: function (val) {
        this.$store.commit('setActiveTab', val)
      }
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
        margin-bottom: -5px;
        margin-top: 0.8rem;
    }

    .tab-card {
        flex: 1 1 auto;
        margin-bottom: 5px;
        display: flex;
        flex-direction: column;
    }

    .side-bar {
        margin: 0 5px 5px 5px;
        display: flex;
        flex-direction: column;
    }

    .info-links {
        margin-bottom: 5px;
        color: #87a9d4;
    }
    .info-links a {
        color: #87a9d4;
        text-decoration: none;
        font-size: 0.8rem;
    }

    .info-links a:hover {
        color: #1D8CE0;
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
