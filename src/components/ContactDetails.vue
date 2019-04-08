<template>
  <div class="container surface-list">
    <el-button
      type="text"
      icon="el-icon-arrow-left"
      class="toLeft"
      @click="back()">
      {{ $t('general.back') }}
    </el-button>
    <contact-header-list-item
      :contact-num="contactNum" />
    <contacts-pairs-list
      :contact-num="contactNum" />
  </div>
</template>

<script>
import ContactsPairsList from './ContactsPairsList'
import ContactHeaderListItem from './ContactHeaderListItem'

export default {
  name: 'ContactsTabList',
  components: {
    ContactsPairsList,
    ContactHeaderListItem
  },
  props: {
    contactNum: {
      type: Number,
      required: true
    }
  },
  methods: {
    back: function () {
      this.$store.commit('setActiveContact', null)
    }
  }
}
</script>

<style scoped>
.container {
  flex:1;
  display: flex;
  flex-direction: vertical;
}
.surface-list {
  margin: 0;
}
.surface-list-item {
  padding: 5px;
  background: #f5f7fa;
}
.toLeft {
  text-align: left;
}
</style>
