<template>
    <div class="statusbar">
        <span>{{ atomHovered.symbol }}</span>
        <span>{{ colorScheme }}</span>
    </div>
</template>

<script>
  export default {
    name: 'statusbar',
    computed: {
      atomHovered: function () {
        return this.$store.state.atomHovered
      },
      colorScheme: function () {
        return this.$store.state.color
      }
    }
  }
</script>

<style>
  .statusbar {
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 2;
    background: rgba(249, 250, 252, 0.95);
    vertical-align: middle;
  }

  .statusbar span {
    font-size: 1.5em
  }

</style>