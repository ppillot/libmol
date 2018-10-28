<template>
  <div class="contact-tab--container">
    <template v-if="activeContact===null">
      <contacts-tab-create-widget/>
      <contacts-tab-list/>
    </template>
    <contact-details v-else
      :contactNum="activeContact"
    />
  </div>
</template>

<script>
import ContactsTabList from './ContactsTabList'
import ContactsTabCreateWidget from './ContactsTabCreateWidget'
import ContactDetails from './ContactDetails'

export default {
  name: 'contactsTab',
  components: {
    ContactsTabList,
    ContactsTabCreateWidget,
    ContactDetails
  },
  computed: {
    activeContact: function () {
      return this.$store.state.activeContact
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .contact-tab--container {
      overflow: hidden;
      flex: 1;
      max-height: 100%;
      display: flex;
      flex-direction: column;
    }
       
</style>

