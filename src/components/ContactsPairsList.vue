<template>
  <div class="surface-list-body"
    v-if="contactsList.length > 0"

  >
    <ul>
      <li
        v-for="(contactTypes, index) in contactsListPerType"
        :key="index"
      >
        <span :class="`${contactTypes[0].type}-border dashed`">
        </span>
        {{ $t(`ui.contacts.${contactTypes[0].type}`) }}
        <context-help :subject="contactTypes[0].type" namespace="contacts"/>

        <ul
          @mouseout="highlight('none')"
        >
          <li v-for="(pair, index) in contactTypes"
            @mouseover="highlight(pair.seleString)"
            class="linkLike"
            :key="index"
          >
            {{ pair.res1.resname }}{{ pair.res1.resno }}:{{ pair.res1.chainname }}
              /
            {{ pair.res2.resname }}{{ pair.res2.resno }}:{{ pair.res2.chainname }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import ContextHelp from './ContextHelp'

// import {contactTypesIndices} from '../utils/contacts'

export default {
  name: 'ContactsPairsList',
  components: {
    ContextHelp
  },
  props: {
    contactNum: {
      type: Number,
      required: true
    }
  },
  computed: {
    contactsList: function () {
      return this.$store.state.contacts[this.contactNum].contactsList
    },
    contactsListPerType: function () {
      let contactTypes = []
      let contactsPerType = []
      this.contactsList.forEach(contact => {
        let id = contactTypes.findIndex((val) => {
          return contact.type === val
        })
        if (id === -1) {
          contactTypes.push(contact.type)
          id = contactTypes.length - 1
          contactsPerType[id] = []
        }
        contactsPerType[id].push(contact)
      })
      return contactsPerType
    }
  },
  methods: {
    highlight: function (selector) {
      this.$store.dispatch('highlightSelectHovered', selector)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .surface-list-body {
      margin-top: -1px;
      padding: 0 1em;
      border: 1px solid #dee6ed;
      width: unset;
      flex: 1;
    }

    ul {
      list-style-type: none;
      margin-bottom: 1em;
      padding: 0;
    }
    .linkLike:hover {
      cursor: pointer;
      color: #20a0ff;
    }
    li {
      margin-top: 5px;
    }

    li ul {
      padding-left: 25px;
    }

    i {
      color: #505b68;
      transition: all 0.4s ease;
    }

    i:hover {
      cursor: pointer;
      color: #20a0ff;
    }

    .display-sub {
      transform: rotate(90deg);
    }

    @keyframes rotating {

    }

    .el-button.el-button--text {
      margin: 0;
    }

</style>
