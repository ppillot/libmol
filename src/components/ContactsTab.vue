<template>
  <div class="contact-tab--container">
    <contacts-tab-create-widget />
    <contacts-tab-list />
  </div>
</template>

<script>
import ContactsTabList from './ContactsTabList'
import ContactsTabCreateWidget from './ContactsTabCreateWidget'

export default {
  name: 'contactsTab',
  components: {
    ContactsTabList,
    ContactsTabCreateWidget
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .contact-tab--container {
      overflow: hidden;
      flex: 1;
      max-height: 100%;
    }
       
</style>

