<template>
    <div class="statusbar">
        <ul>
          <el-tooltip v-for="token in colorScheme" class="item" effect="dark" :content="token.tooltip" placement="top">
            <li :style="token.css">
              {{ token.text }}
            </li>
          </el-tooltip>
        </ul>
        <span>{{ atomHovered.symbol }}</span>
    </div>
</template>

<script>
  import {getColor} from '../utils/colors'

  export default {
    name: 'statusbar',
    computed: {
      atomHovered: function () {
        return this.$store.state.atomHovered
      },
      colorScheme: function () {
        var cs = []
        switch (this.$store.state.color) {
          case 'element':
            this.$store.state.mol.elements.forEach(
              item => {
                cs.push({
                  text: item,
                  css: 'color: #' + getColor('element', item).toString(16),
                  tooltip: this.$t('biochem.el_name.' + item)
                })
              }
            )
            break
          case 'resname':
            this.$store.state.mol.residues.forEach(
              item => {
                cs.push({
                  text: item,
                  css: 'color: #' + getColor('resname', item).toString(16),
                  tooltip: this.$t('biochem.pdb_res_name.' + item)
                })
              }
            )
            break
          default :
            cs = {
              text: 'coucou',
              css: 'color: #00ff00'
            }
        }
        return cs
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

  .statusbar ul {
    margin:0 0.5em;
    padding: 0;
    display: inline;
    font-weight: bold;
    -webkit-text-stroke: 1px #888;
    -moz-text-stroke: 1px #888;
    -ms-text-stroke: 1px #888;
  }

  .statusbar ul li {
    display: inline;
    cursor: help;
  }
</style>