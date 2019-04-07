<template>
  <div class="container">
    <p>{{ $t('ui.surface.instructions') }}</p>
    <el-button 
      type="primary"
      @click="createSurface"
      :disabled="this.$store.state.selection==='none'"
    >
      {{ $t('ui.surface.create') }}
    </el-button>

    <div class="container no-scroll surface-list">
      <div class="surface-list-header">
        {{ $t('ui.surface.list_label') }}
        <el-button
          type="text"
          icon="delete"
          class="button align-right"
          size="large"
          @click="handleDelete(-1)" v-if="surfaces.length > 0">
        </el-button>
      </div>
      <div class="surface-list-body" v-if="surfaces.length>0">
        <div class="surface-list-item" v-for="(surface, index) in surfaces" :key="index">
          <div class="surface-header">
            <i 
              class="el-icon-caret-right"
              :class="[index === edit ? 'rotate' : 'unrotate']"
              @click="edit = (index === edit)? -1 : index"></i>
            <div class="surface-title">
            {{ `${$t('ui.surface.surface')} ${surface.id} (${
              $t((surface.sele === 'user' || surface.sele === '')? 
                'ctxMenu.user_selection' 
                :
                'tooltips.' + surface.sele
              )})` }}
            </div>
            <visible :value="visibility[index]" @input="val => {handleVisibility(val, surface.id)}"></visible>
            <el-button type="text" icon="el-icon-delete" @click="handleDelete(surface.id)"></el-button>
          </div>
          <transition appear>
            <div v-if="edit === index" class="surface-settings">
              <form-item :label="$t('ui.surface.opacity')">
                <el-slider v-model="opacity" :min="0" :max="1" :step="0.1"></el-slider>  
              </form-item>
              <form-item :label="$t('ui.surface.outline')" inline>
                <el-switch
                  v-model="outline">
                </el-switch>
              </form-item>
              <form-item :label="$t('ui.surface.color')">
                <palette :value="colors" @color="pickColor" :compact="true"></palette>
              </form-item>
              <div style="text-align: right">
                <el-button type="primary" @click="downloadSTL(surface.id)">{{ $t('ui.surface.export_as_stl') }}</el-button>
              </div>
            </div>
          </transition>
        </div>
      </div>  
      <div class="surface-list-item" v-else>
        {{$t('ui.surface.list_instructions')}}
      </div>
    </div>
  </div>
</template>

<script>
  import Palette from './Palette'
  import FormItem from './FormItem'
  import Visible from './Visible'

  export default {
    name: 'SurfaceTab',
    components: {
      FormItem,
      Palette,
      Visible
    },
    data () {
      return {
        /* colors: {
          hex: '#00ff00'
        }, */
        edit: -1
      }
    },
    computed: {
      surfaces: function () {
        if (this.$store.state.surfaces.length === 0) this.edit = -1
        return this.$store.state.surfaces
      },
      opacity: {
        set: function (val) {
          this.$store.dispatch('setSurfaceProperty', {
            id: this.surfaces[this.edit].id,
            props: {
              opacity: val,
              side: 'front'
            }
          })
        },
        get: function () {
          return this.$store.state.surfaces[this.edit].props.opacity
        }
      },
      visibility: function () {
        return this.$store.state.surfaces.map(val => {
          return val.props.visible
        })
      },
      outline: {
        set: function (val) {
          this.$store.dispatch('setSurfaceProperty', {
            id: this.surfaces[this.edit].id,
            props: {
              background: val
            }
          })
        },
        get: function () {
          return this.$store.state.surfaces[this.edit].props.background
        }
      },
      colors: function () {
        return `#${this.$store.state.surfaces[this.edit].props.colorValue.toString(16)}`
      }
    },
    methods: {
      createSurface: function () {
        this.$store.dispatch('createSurface')
      },
      handleDelete: function (index) {
        this.$store.dispatch('deleteSurface', index)
      },
      handleVisibility: function (val, index) {
        this.$store.dispatch('setSurfaceProperty', {
          id: index,
          props: {
            visible: val
          }
        })
      },
      downloadSTL: function (index) {
        this.$store.dispatch('downloadSurface', index)
      },
      pickColor: function (val) {
        this.$store.dispatch('setSurfaceProperty', {
          id: this.surfaces[this.edit].id,
          props: {
            colorValue: parseInt(val.substr(1), 16)
          }
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .button.align-right {
    position: absolute;
    right: 0;
    padding: 0 1em;
    line-height: 2em;
  }
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }

  .no-scroll {
    overflow: hidden;
  }

  .surface-list {
    margin-top: 1em;
    font-size: 0.9em;
  }

  .surface-list i {
    color: #88a9d4;
  }

  .surface-list i:hover {
    color: #20a0ff;
    cursor: pointer;
  }

  .surface-list-header {
    line-height: 2.5em;
    background: #eef1f6;
    position: relative;
    border: 1px solid #dfe6ec;
    text-align: center;
    font-weight: 500;
  }

  .surface-list-body {
    flex:1;
    overflow: auto;
    max-height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    width: 100%;
  }

  .surface-list-item {
    border: solid 1px #dfe6ec;
    padding: 1em;
    margin-top: -1px;
  }

  .rotate {
    transition: color 500ms, transform 500ms;
    transform: rotate(90deg);
    color: #20a0ff
  }
  .unrotate {
    transition: color 500ms, transform 500ms;
    transform: rotate(0deg);
  }

  .surface-settings {
    padding: 1em;
    margin-top: 0.5em;
    border-top: solid 1px #dfe6ec;
  }

  .surface-header {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .surface-header i {
    padding-right: 0.5em
  }

  .surface-title {
    flex: 1;
  }
</style>
