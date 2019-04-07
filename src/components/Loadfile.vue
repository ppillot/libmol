<template>
  <form-item :label="$t('ui.load_local_file_label')">
    <input type="file" id="fileElem" style="display:none" @change="getFiles($event)">
    <label for="fileElem" class="loadfile" 
      @dragenter.prevent
      @dragover.prevent
      @drop.prevent="dropFile($event)">
      <i class="el-icon-upload"></i>
      {{ $t('ui.load_local_file_instructions') }}
    </label>
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
        const item = {
          file: file,
          value: file.name,
          molId: '',
          source: 'local'
        }
        this.$store.dispatch('loadNewFile', item)
        return false
      },
      dropFile (ev) {
        const dt = ev.dataTransfer
        const file = dt.files[0]
        this.getFile(file)
      },
      getFiles (ev) {
        this.getFile(ev.target.files[0])
        ev.target.value = null
      }
    },
    mounted () {
      window.addEventListener('dragenter', ev => {
        ev.preventDefault()
      })
      window.addEventListener('dragover', ev => {
        ev.preventDefault()
      })
      window.addEventListener('drop', function (ev) {
        ev.preventDefault()
        if (ev.target.files) this.dropFile(ev)
      }.bind(this))
    }
  }
</script>

<style>
  .loadfile {
    min-height: 170px;
    border-radius: 5px;
    border: dashed 1px #d9d9d9;
    vertical-align: middle;
    text-align: center;
  }
  .loadfile:hover {
    border-color: #4db1fd;
  }
  .loadfile .el-icon-upload {
    display: block;
    font-size: 4em;
    margin: 40px 0 10px 0;
    color: #97a8be;
  }
</style>
