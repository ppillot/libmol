<template>
  <form-item :label="$t('ui.export')">
    <el-button
      type="primary"
      @click="getEmbedCode"
      >
      {{ $t('ui.embed')}}  
    </el-button>
  </form-item>
</template>

<script>
  import FormItem from './FormItem'

  export default {
    name: 'Export',
    components: {
      FormItem
    },
    data () {
      return {
        fileList: []
      }
    },
    methods: {
      getEmbedCode () {
        this.$store.dispatch('getEmbedCode')
      }
    }
  }
</script>
