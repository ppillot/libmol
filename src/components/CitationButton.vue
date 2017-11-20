<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="isPanelVisible"
      :modal-append-to-body="false"
      size="mini">
      <citations-panel/>
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
        isPanelVisible: false
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
</style>
