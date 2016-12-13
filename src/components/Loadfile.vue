<template>
  <el-form-item label="Charger un fichier local">
    <el-upload
      action=""
      type="drag"
      :multiple="false"
      :before-upload="getFile"
    >
      <i class="el-icon-upload"></i>
      <div class="el-dragger__text">Déposer un fichier ici ou <em>cliquer pour charger</em></div>
    </el-upload>
  </el-form-item>
</template>

<script>
  export default {
    name: 'LoadFile',
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