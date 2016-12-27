<template>
    <div class="container">
        <div class="header">
          <ul>
            <li v-for="chain in chains">
              {{ chain.id }}
            </li>
          </ul>
        </div>
        <div class="tab-body">
          <ul v-for="chain in chains">
            <li v-for="residu in chain.sequence">
              {{ residu.resname }}
            </li>
          </ul>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'SequenceWidget',
    computed: {
      chains: function () {
        return this.$store.state.mol.chains
      }
    },
    methods: {
      pickColor (val) {
        this.$store.dispatch('color', val.hex)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .header ul {
    margin: 0;
    padding: 0;
    white-space: nowrap;
  }

  .header ul li {
    display: inline-block;
    margin: 0;
    padding: 0;
    width: 3em;
    text-align: center;
    background: #AAA;
  }
  
  .tab-body {
    flex: 1;
    overflow: auto;
    white-space: nowrap;
  }

  .tab-body ul {
    display: inline-table;
    margin: 0;
    padding: 0;
    width: 3em;
  }

  .tab-body ul li {
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: center;
    cursor: pointer;
    background: none;
  }

  li:hover {
    background: green;
  }
</style>