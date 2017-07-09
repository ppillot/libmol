<template>
    <div class="container">
        <p>{{ $t('ui.surface.instructions') }}</p>
        <el-button type="primary" @click="createSurface">{{ $t('ui.surface.create') }}</el-button>
        <table class="table-distances">
      <thead>
        <tr>
          <th><el-button type="text" icon="delete" @click="handleDelete" :disabled="surfaces.length===0"></el-button></th>
          <th>{{ $t('ui.surface.list_label') }}</th>
        </tr>
      </thead>
      <tbody v-if="surfaces.length>0">
        <tr v-for="(surface, index) in surfaces" :key="index">
          <td>
            <el-button type="text" icon="delete" @click="handleDelete(index)"></el-button>
          </td>
          <td class="table-surface">
            <i :class="[surfaces[index].visible ? 'icon-eye' : 'icon-eye-off']" 
              @click.stop="toggle('all')"></i>
            <i class="el-icon-caret-right" @click="edit = index"></i>
            {{ `${$t('ui.surface.surface')} ${surface.id} (${$t('ui.commands.select.' + surface.sele)})` }}
            <div v-if="edit === index" class="settings">
              <form-item :label="$t('ui.surface.opacity')">
                <el-slider v-model="opacity" :min="0" :max="1" :step="0.1"></el-slider>  
              </form-item>
              <form-item :label="$t('ui.surface.visibility')" inline>
                <el-switch
                  v-model="visibility">
                </el-switch>
              </form-item>
              <form-item :label="$t('ui.surface.outline')" inline>
                <el-switch
                  v-model="outline">
                </el-switch>
              </form-item>
              <form-item :label="$t('ui.surface.color')">
                <palette v-model="colors" :compact="true"></palette>
              </form-item>
            </div>
          </td>
        </tr>  
      </tbody>
      <tfoot v-else>
        <tr>
          <td colspan="4">{{$t('ui.surface.list.instructions')}}</td>
        </tr>
      </tfoot>
    </table>
    </div>
</template>

<script>
  import Palette from './Palette'
  import FormItem from './FormItem'

  export default {
    name: 'SurfaceTab',
    components: {
      FormItem,
      Palette
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
            id: this.edit,
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
      visibility: {
        set: function (val) {
          this.$store.dispatch('setSurfaceProperty', {
            id: this.edit,
            props: {
              visible: val
            }
          })
        },
        get: function () {
          return this.$store.state.surfaces[this.edit].props.visible
        }
      },
      outline: {
        set: function (val) {
          this.$store.dispatch('setSurfaceProperty', {
            id: this.edit,
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
            id: this.edit,
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
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-height: 100%;
  }

  .table-surface {
    text-align: left;
  }
</style>
