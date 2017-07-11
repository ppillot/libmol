/*
* TODO : prevent another surface with same selection
*/

<template>
    <div class="container">
        <p>{{ $t('ui.surface.instructions') }}</p>
        <el-button type="primary" @click="createSurface">{{ $t('ui.surface.create') }}</el-button>

        <table class="table-surfaces">
          <thead>
            <tr>
              <th>
                {{ $t('ui.surface.list_label') }}
                <el-button
                  type="text"
                  icon="delete"
                  class="button align-right"
                  size="large"
                  @click="handleDelete(-1)" v-if="surfaces.length > 0"></el-button>
              </th>
            </tr>
          </thead>
      <tbody v-if="surfaces.length>0">
        <tr v-for="(surface, index) in surfaces" :key="index">
          <td>
            <div class="surface-header">
              <i 
                class="el-icon-caret-right"
                :class="[index === edit ? 'rotate' : 'unrotate']"
                @click="edit = (index===edit)? -1 : index"></i>
              <div class="surface-title">
              {{ `${$t('ui.surface.surface')} ${surface.id} (${$t('ui.commands.select.' + surface.sele)})` }}
              </div>
              <visible :value="visibility[index]" @input="val => {handleVisibility(val, surface.id)}"></visible>
              <el-button type="text" icon="delete" @click="handleDelete(surface.id)"></el-button>
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
                  <palette v-model="colors" :compact="true"></palette>
                </form-item>
                <div style="text-align: right">
                  <el-button type="primary" @click="downloadSTL(surface.id)">{{ $t('ui.surface.export_as_stl') }}</el-button>
                </div>
              </div>
            </transition>
          </td>
        </tr>  
      </tbody>
      <tfoot v-else>
        <tr>
          <td colspan="4">{{$t('ui.surface.list_instructions')}}</td>
        </tr>
      </tfoot>
    </table>
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
      colors: {
        set: function (val) {
          console.log(val)
          this.$store.dispatch('setSurfaceProperty', {
            id: this.surfaces[this.edit].id,
            props: {
              colorValue: parseInt(val.substr(1), 16)
            }
          })
        },
        get: function () {
          return {
            hex: `#${this.$store.state.surfaces[this.edit].props.colorValue.toString(16)}`
          }
        }
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

  .table-surfaces {
    width: 100%;
    border-collapse: collapse;
    border: solid 1px #dfe6ec;
    margin: 1em 0;
    font-size: 0.9em;
  }

  .table-surfaces td {
    padding: 1em;
    border: 1px solid #dfe6ec;
  }

  .table-surfaces i {
    color: #88a9d4;
  }

  .table-surfaces i:hover {
    color: #20a0ff;
    cursor: pointer;
  }

  .table-surfaces th {
    line-height: 2.5em;
    background: #eef1f6;
    position: relative;
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
