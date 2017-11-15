<template>
  <!--<div class="settings">-->
  <el-tabs type="card">
  <el-tab-pane :label="$t('ui.toolbar.measures.distance')">
    <form-item :label="$t('ui.toolbar.measures.activate_distance_label')" inline>
      <el-switch
        v-model="mouseDistance"
        :width="80"
        on-color="#13CE66"
        off-color="#D3DCE6"
        :on-text="$t('ui.toolbar.measures.activate')"
        :off-text="$t('ui.toolbar.measures.deactivate')"
        @change="switchDistance">
      </el-switch>
    </form-item>
   
    <table class="table-distances">
      <thead>
        <tr>
          <th><el-button type="text" icon="delete" @click="handleDeleteDistances" :disabled="distances.length===0"></el-button></th>
          <th>{{ $t('ui.toolbar.measures.atom1') }}</th>
          <th>{{ $t('ui.toolbar.measures.atom2') }}</th>
          <th>{{ $t('ui.toolbar.measures.distance') }}</th>
        </tr>
      </thead>
      <tbody v-if="distances.length>0">
        <tr v-for="(measure, index) in distances" :key="index">
          <td>
            <el-button type="text" icon="delete" @click="handleDeleteDistances(index)"></el-button>
          </td>
          <td>
            {{ measure.atom1.atomname}} {{ measure.atom1.serial }} | {{ measure.atom1.resname}}{{ measure.atom1.resno}}
          </td>
          <td>
            {{ measure.atom2.atomname}} {{ measure.atom2.serial }} | {{ measure.atom2.resname}}{{ measure.atom2.resno}}
          </td>
          <td>
            {{ measure.distance/10 | round(2)}} nm
          </td>
        </tr>  
      </tbody>
      <tfoot v-else>
        <tr>
          <td colspan="4">{{$t('ui.toolbar.measures.instructions_distances')}}</td>
        </tr>
      </tfoot>
    </table>
  </el-tab-pane>

  
  <el-tab-pane :label="$t('ui.toolbar.measures.angle')">
    <form-item :label="$t('ui.toolbar.measures.activate_angle_label')" inline>
      <el-switch
        v-model="mouseAngle"
        :width="80"
        on-color="#13CE66"
        off-color="#D3DCE6"
        :on-text="$t('ui.toolbar.measures.activate')"
        :off-text="$t('ui.toolbar.measures.deactivate')"
        @change="switchAngle">
      </el-switch>
    </form-item>
   
    <table class="table-distances">
      <thead>
        <tr>
          <th><el-button type="text" icon="delete" @click="handleDeleteAngles" :disabled="angles.length===0"></el-button></th>
          <th>{{ $t('ui.toolbar.measures.atom1') }}</th>
          <th>{{ $t('ui.toolbar.measures.atom2') }}</th>
          <th>{{ $t('ui.toolbar.measures.atom3') }}</th>
          <th>{{ $t('ui.toolbar.measures.angle') }}</th>
        </tr>
      </thead>
      <tbody v-if="angles.length>0">
        <tr v-for="(measure, index) in angles" :key="index">
          <td>
            <el-button type="text" icon="delete" @click="handleDeleteAngles(index)"></el-button>
          </td>
          <td>
            {{ measure.atom1.atomname}} {{ measure.atom1.serial }} | {{ measure.atom1.resname}}{{ measure.atom1.resno}}
          </td>
          <td>
            {{ measure.atom2.atomname}} {{ measure.atom2.serial }} | {{ measure.atom2.resname}}{{ measure.atom2.resno}}
          </td>
          <td>
            {{ measure.atom3.atomname}} {{ measure.atom3.serial }} | {{ measure.atom3.resname}}{{ measure.atom3.resno}}
          </td>
          <td>
            {{ measure.angle | round(1)}} °
          </td>
        </tr>  
      </tbody>
      <tfoot v-else>
        <tr>
          <td colspan="5">{{$t('ui.toolbar.measures.instructions_angles')}}</td>
        </tr>
      </tfoot>
    </table>
  </el-tab-pane>
</el-tabs>
  <!--</div>-->
</template>

<script>
  import FormItem from './FormItem'

  export default {
    name: 'measuresPanel',
    components: {
      FormItem
    },
    computed: {
      distances () {
        return this.$store.state.distances
      },
      angles () {
        return this.$store.state.angles
      },
      mouseDistance: {
        get () {
          return this.$store.state.isMeasuringDistances
        },
        set (value) {
          // this.$store.commit('isMeasuringDistances', value)
        }
      },
      mouseAngle: {
        get () {
          return this.$store.state.isMeasuringAngles
        },
        set (value) {
          // this.$store.commit('isMeasuringAngles', value)
        }
      }
    },
    filters: {
      round: function (value, dec) {
        return value.toFixed(dec)
      }
    },
    methods: {
      switchDistance (isMeasuringDistances) {
        const mouseMode = (isMeasuringDistances) ? 'distance' : 'pick'
        this.$store.dispatch('setMouseMode', mouseMode)
      },
      handleDeleteDistances (value) {
        this.$store.dispatch('deleteMeasure', {type: 'distance', index: value})
      },
      switchAngle (isMeasuringAngles) {
        const mouseMode = (isMeasuringAngles) ? 'angle' : 'pick'
        this.$store.dispatch('setMouseMode', mouseMode)
      },
      handleDeleteAngles (value) {
        this.$store.dispatch('deleteMeasure', {type: 'angle', index: value})
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
  .settings label {
    font-weight: 500;
  }
  .settings .form-item-slot {
    margin-top: 0;
  }
  .table-distances {
    width: 100%;
    border: solid 1px #dfe6ec;
    color: #1f2d3d;
    border-collapse:collapse;
  }
  .table-distances td,th {
    text-align: center;
    border: solid 1px #dfe6ec;
  }
  .table-distances th {
    background: #eef1f6
  }
  .table-distances tfoot td {
    padding: 1em;
    color: #99A9BF
  }
</style>
