<template>
  <div class="settings">
    <form-item :label="$t('ui.toolbar.screen_capture.scale')">
      <el-slider
        v-model="factor"
        :min="1"
        :max="3"
        :step="1"
        :format-tooltip="factorLabel"
        ></el-slider>  
    </form-item>
    <form-item :label="$t('ui.toolbar.screen_capture.trim')" inline>
      <el-switch
        v-model="trim"
        :width="80"
        on-color="#13CE66"
        off-color="#D3DCE6"
        on-text="on"
        off-text="off"
      ></el-switch>
    </form-item>
    <form-item :label="$t('ui.toolbar.screen_capture.transparent')" inline>
      <el-switch
        v-model="transparent"
        :width="80"
        on-color="#13CE66"
        off-color="#D3DCE6"
        on-text="on"
        off-text="off"
      ></el-switch>
    </form-item>
    <form-item :label="$t('ui.toolbar.screen_capture.filename')" inline>
      <input v-model="filename">
      </el-switch>
    </form-item>
    
    <div style="text-align: center">
      <el-button type="primary" @click="screenCapture">
        <i class="icon-camera"></i>
        {{ $t('ui.toolbar.screen_capture.capture') }}
      </el-button>
    </div>
  </div>
</template>

<script>
  import FormItem from './FormItem'
  
  export default {
    name: 'screenCapture',
    components: {
      FormItem
    },
    data () {
      return {
        factor: 2,
        trim: false,
        transparent: true,
        filename: ''
      }
    },
    computed: {
      getFilename: function () {
        this.filename = this.$store.state.name
        return this.$store.state.name
      }
    },
    methods: {
      factorLabel (val) {
        return `× ${val}`
      },
      screenCapture () {
        this.$store.dispatch('screenCapture', {
          factor: this.factor,
          trim: this.trim,
          transparent: this.transparent,
          filename: this.filename
        })
      }
    }
  }
</script>

<style>
  .settings {
    margin: 1em 1em 0.5em 1em
  }
  .settings .form-item {
    margin-bottom: 1em;
  }
  .settings.el-form {
    padding: 1em;
  }
  .settings label {
    font-weight: 500;
  }
  .settings .form-item-slot {
    margin-top: 0;
  }
  .settings select {
    font-size: 1em;
    border: none;
    background: #ddd;
  }
  .settings select:focus {
    outline: none;
  }
  .settings input {
    border-radius: 2px;
    border: 1px solid #d1dbe5;
    height: 1.8em;
    width: 100%;
  }
</style>
