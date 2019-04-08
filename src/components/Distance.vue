<template>
  <div class="settings">
    <form-item :label="$t('ui.toolbar.distance.activate_label')" inline>
      <el-switch
        v-model="mouseDistance"
        :width="80"
        on-color="#13CE66"
        off-color="#D3DCE6"
        :on-text="$t('ui.toolbar.distance.activate')"
        :off-text="$t('ui.toolbar.distance.deactivate')"
        @change="switchDistance">
      </el-switch>
    </form-item>

    <table class="table-distances">
      <thead>
        <tr>
          <th><el-button type="text" icon="delete" @click="handleDelete" :disabled="measures.length===0"></el-button></th>
          <th>{{ $t('ui.toolbar.distance.atom1') }}</th>
          <th>{{ $t('ui.toolbar.distance.atom2') }}</th>
          <th>{{ $t('ui.toolbar.distance.distance') }}</th>
        </tr>
      </thead>
      <tbody v-if="measures.length>0">
        <tr v-for="(measure, index) in measures" :key="index">
          <td>
            <el-button type="text" icon="delete" @click="handleDelete(index)"></el-button>
          </td>
          <td>
            {{ measure.atom1.atomname }} {{ measure.atom1.serial }} | {{ measure.atom1.resname }}{{ measure.atom1.resno }}
          </td>
          <td>
            {{ measure.atom2.atomname }} {{ measure.atom2.serial }} | {{ measure.atom2.resname }}{{ measure.atom2.resno }}
          </td>
          <td>
            {{ measure.distance/10 | round }} nm
          </td>
        </tr>
      </tbody>
      <tfoot v-else>
        <tr>
          <td colspan="4">{{ $t('ui.toolbar.distance.instructions') }}</td>
        </tr>
      </tfoot>
    </table>

    <form-item :label="$t('ui.toolbar.distance.activate_label')" inline>
      <el-switch
        v-model="mouseDistance"
        :width="80"
        on-color="#13CE66"
        off-color="#D3DCE6"
        :on-text="$t('ui.toolbar.distance.activate')"
        :off-text="$t('ui.toolbar.distance.deactivate')"
        @change="switchDistance">
      </el-switch>
    </form-item>

    <table class="table-distances">
      <thead>
        <tr>
          <th><el-button type="text" icon="delete" @click="handleDelete" :disabled="measures.length===0"></el-button></th>
          <th>{{ $t('ui.toolbar.distance.atom1') }}</th>
          <th>{{ $t('ui.toolbar.distance.atom2') }}</th>
          <th>{{ $t('ui.toolbar.distance.distance') }}</th>
        </tr>
      </thead>
      <tbody v-if="measures.length>0">
        <tr v-for="(measure, index) in measures" :key="index">
          <td>
            <el-button type="text" icon="delete" @click="handleDelete(index)"></el-button>
          </td>
          <td>
            {{ measure.atom1.atomname }} {{ measure.atom1.serial }} | {{ measure.atom1.resname }}{{ measure.atom1.resno }}
          </td>
          <td>
            {{ measure.atom2.atomname }} {{ measure.atom2.serial }} | {{ measure.atom2.resname }}{{ measure.atom2.resno }}
          </td>
          <td>
            {{ measure.distance/10 | round }} nm
          </td>
        </tr>
      </tbody>
      <tfoot v-else>
        <tr>
          <td colspan="4">{{ $t('ui.toolbar.distance.instructions') }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
import FormItem from './FormItem'

export default {
  name: 'Distance',
  components: {
    FormItem
  },
  computed: {
    measures () {
      return this.$store.state.distances
    },
    mouseDistance: {
      get () {
        return this.$store.state.isMeasuringDistances
      },
      set (value) {
        this.$store.commit('isMeasuringDistances', value)
      }
    }
  },
  filters: {
    round: function (value) {
      return value.toFixed(2)
    }
  },
  methods: {
    switchDistance (isMeasuringDistances) {
      const mouseMode = (isMeasuringDistances) ? 'distance' : 'pick'
      this.$store.dispatch('setMouseMode', mouseMode)
    },
    handleDelete (value) {
      this.$store.dispatch('deleteDistance', value)
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
