<template>
  <form-item :label="$t('ui.load_local_file_label')">
    <el-upload
      action=""
      drag
      :multiple="false"
      :before-upload="getFile">
      <i class="el-icon-upload"></i>
      <div class="el-dragger__text" v-html="$t('ui.load_local_file_instructions_HTML')"></div>
    </el-upload>
  </form-item>
</template>

<script>
  import FormItem from './FormItem'

  export default {
    name: 'LoadFile',
    components: {
      FormItem
    },
    data () {
      return {
        fileList: []
      }
    },
    methods: {
      getFile (file) {
        console.log(file)
        const item = {
          file: file,
          value: file.name
        }
        this.$store.dispatch('loadNewFile', item)
        return false
      }
    }
  }
</script>

<style>
  .el-upload, .el-upload-dragger {
    width: 100%
  } 
</style>
