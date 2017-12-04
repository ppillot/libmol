<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="isPanelVisible"
      :modal-append-to-body="false"
      size="mini">
      <!--<el-tabs>
        <el-tab-pane label="Citation" name="citation">-->
          <citations-panel/>
        <!--</el-tab-pane>
        <el-tab-pane label="Statistiques" name="stats" disabled>Config</el-tab-pane>
        <el-tab-pane label="Constituants" name="comps" disabled>Role</el-tab-pane>
      </el-tabs>-->
      
    </el-dialog>
    <el-button 
      class="pdb-code" 
      type="text" 
      size="large" 
      @click="isPanelVisible = true"
      v-if="molCode.length > 0">
      {{ molCode.toUpperCase() }}
    </el-button>
  </div>
</template>

<script>
  import citationsPanel from './CitationsPanel'

  export default {
    name: 'citationButton',
    components: {
      citationsPanel
    },
    data () {
      return {
        isPanelVisible: false,
        activeName: 'citation'
      }
    },
    computed: {
      title: function () {
        return this.$store.state.name
      },
      molCode: function () {
        return this.$store.state.molCode
      }
    }
  }
</script>

<style>
  .pdb-code {
    font-size: 0.8em;
    background: #87a9d4;
    color: #f9fafc;
    height: 1.3em;
    padding: 2px;
    border-radius: 3px;
    font-weight: 500;
    line-height: 1.1em;
    margin-right: 0.5em;
    text-decoration: none;
    display: inline-block;
  }

  .pdb-code:hover, .pdb-code:focus {
    background: #03a9f4;
    color: #f9fafc;
  }

  .el-dialog__wrapper {
    overflow: hidden;
  }

  .el-dialog {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .el-dialog__body {
    flex: 1;
    overflow: auto;
  }

</style>
