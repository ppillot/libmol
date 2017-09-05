<template>
  <form-item :label="$t('ui.export.label')">
    <el-dialog
      :title="$t('ui.export.label')"
      :visible.sync="dialogVisible"
      size="medium">
      <div>
        {{ $t('ui.export.instructions')}}
      </div>
      <form-item :label="$t('ui.export.hide_sidebar')" inline>
        <el-switch
          v-model="sidebar"
        >
        </el-switch>
      </form-item>
      <form-item :label="$t('ui.export.content_setting_label')">
        <button-group @change="startContent" :active-value="content">
          <radio-button value="default">{{ $t('ui.export.content_setting_default') }}
          </radio-button>
          <radio-button value="molecule">{{ $t('ui.export.content_setting_molecule') }}
          </radio-button>
          <radio-button value="state">{{ $t('ui.export.content_setting_state') }}
          </radio-button>
        </button-group>
      </form-item>
      <form-item :label="$t('ui.export.embed_code_label')">
        <textarea :value="integrationCode" id="integration-code"></textarea>
      </form-item>
      <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false" type="primary" icon="close">{{ $t('ui.about.close') }}</el-button>
      </span>
    </el-dialog>
    <el-button
      type="primary"
      @click="dialogVisible = true"
      >
      {{ $t('ui.embed')}}  
    </el-button>
  </form-item>
</template>

<script>
  import FormItem from './FormItem'
  import ButtonGroup from './ButtonGroup'
  import RadioButton from './RadioButton'

  export default {
    name: 'Export',
    components: {
      FormItem,
      ButtonGroup,
      RadioButton
    },
    data () {
      return {
        dialogVisible: false,
        sidebar: false,
        content: 'default'
      }
    },
    computed: {
      integrationCode: function () {
        let params = []
        if (this.sidebar) params.push('embedded')
        switch (this.content) {
          case 'molecule':
            params.push(`file=${encodeURI(this.$store.state.fileName)}`)
            params.push(`value=${encodeURI(this.$store.state.name)}`)
            break
          case 'state':
            if (this.$store.state.stateID > -1) params.push(`state=${this.$store.state.stateID}`)
            break
          default:
            params.push('default')
            break
        }
        this.selectArea()
        return `<iframe src="https://libmol.org?${params.join('&')}" allowfullscreen height="600" width="800">
        </iframe>`
      }
    },
    methods: {
      getEmbedCode () {
        this.$store.dispatch('getEmbedCode')
      },
      startContent (val) {
        this.content = val
        if (val === 'state') {
          this.$store.dispatch('getEmbedCode')
          this.$nextTick(function () {
            this.$forceUpdate()
          })
        }
      },
      selectArea () {
        let el = document.getElementById('integration-code')
        if (el) {
          el.select()
          document.execCommand('copy')
        }
      }
    },
    updated: function () {
      // console.log(this.$root)
      this.selectArea()
    }
  }
</script>

<style scoped>
  textarea {
    width: 100%;
    font-size: 0.9em;
    border: solid 1px #D3DCE6;
    height: 4em;
  }
</style>
