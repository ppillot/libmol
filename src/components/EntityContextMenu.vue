<template>
    <div v-if="showContextMenu" class="context-menu-backdrop" @click.self="hideContextMenu">
        <div class="context-menu" :style="contextMenuStyles">
        <template v-if="ctxMProp.type==='chain'">
            <div>{{ $t('tooltips.chain') }} {{ ctxMProp.chain }}</div>
            <ul>
            <li @click="hide(':' + ctxMProp.chain, $event)"
                :class="{disabled: !ctxMProp.isMaskable}">
                <i class="icon-eye-off"></i>
                {{ $t('ctxMenu.mask') }}
            </li>
            <li @click="show(':' + ctxMProp.chain, $event)"
                :class="{disabled: !ctxMProp.isUnMaskable}">
                <i class="icon-eye"></i>
                {{ $t('ctxMenu.unmask') }}
            </li>
            <li @click="hide('not :' + ctxMProp.chain, $event)"
                :class="{disabled: !ctxMProp.isRestMaskable}"
                v-if="ctxMProp.isRestPresent">
                <i class="icon-eye-off"></i> 
                {{ $t('ctxMenu.mask_rest') }}
            </li>
            <li @click="show('not :' + ctxMProp.chain, $event)" 
                :class="{disabled: !ctxMProp.isRestUnMaskable}"
                v-if="ctxMProp.isRestPresent">
                <i class="icon-eye"></i> 
                {{ $t('ctxMenu.unmask_rest') }}
            </li>
            <li @click="contact({chainId: ctxMProp.chain}, $event)">
                <i class="el-icon-share"></i> 
                {{ $t('ctxMenu.contact') }}
            </li>
            </ul>
        </template>
        <template v-else-if="ctxMProp.type==='res'">
            <div>{{ ctxMProp.name }} {{ ctxMProp.num }} - {{ $t('tooltips.chain') }} {{ ctxMProp.chain }}</div>
            <ul>
            <li @click="hide(ctxMProp.num + ':' + ctxMProp.chain, $event)"
                :class="{disabled: !ctxMProp.isMaskable}">
                <i class="icon-eye-off"></i>
                {{ $t('ctxMenu.mask') }}
            </li>
            <li @click="show(ctxMProp.num + ':' + ctxMProp.chain, $event)"
                :class="{disabled: !ctxMProp.isUnMaskable}">
                <i class="icon-eye"></i>
                {{ $t('ctxMenu.unmask') }}
            </li>
            <li @click="hide('not ' + ctxMProp.num + ':' + ctxMProp.chain, $event)"
                :class="{disabled: !ctxMProp.isRestMaskable}"
            >
                <i class="icon-eye-off"></i> 
                {{ $t('ctxMenu.mask_rest') }}
            </li>
            <li @click="show('not ' + ctxMProp.num + ':' + ctxMProp.chain, $event)" 
                :class="{disabled: !ctxMProp.isRestUnMaskable}"
            >
                <i class="icon-eye"></i> 
                {{ $t('ctxMenu.unmask_rest') }}
            </li>
            <li @click="contact({resnum: ctxMProp.num, chainId: ctxMProp.chain}, $event)">
                <i class="el-icon-share"></i> 
                {{ $t('ctxMenu.contact') }}
            </li>
            </ul>
        </template>
        </div>
    </div>
</template>

<script>
  function getTooltipStyles (target) {
    let rect = (target.left === undefined)
    ? target.getBoundingClientRect() || {top: 0, right: 0}
    : {
      top: target.top - 10,
      right: target.left
    }
    return {
      top: rect.top - 5 + 'px',
      left: rect.right + 5 + 'px',
      visibility: 'visible'
    }
  }

  export default {
    name: 'EntityContextMenu',
    props: {
      showContextMenu: {
        type: Boolean,
        required: false,
        default: false
      },
      target: { // HTMLElement or position object (top, left)
        required: true
      }
    },
    computed: {
      ctxMProp: function () {
        return this.$store.state.anchor
      },
      contextMenuStyles () {
        const pos = getTooltipStyles(this.target)
        return pos
      }
    },
    methods: {
      hideContextMenu () {
        this.$emit('hide')
      },
      hide (part, event) {
        if (event.target.className === 'disabled') return
        this.$store.dispatch('hide',
          { sele: part,
            action: 'hide',
            type: this.ctxMProp.type,
            chainName: this.ctxMProp.chain,
            resnum: (this.ctxMProp.type === 'res') ? this.ctxMProp.num : null,
            resname: (this.ctxMProp.type === 'res') ? this.ctxMProp.name : null
          })
      },
      show (part, event) {
        if (event.target.className === 'disabled') return
        this.$store.dispatch('hide',
          { sele: part,
            action: 'show',
            type: this.ctxMProp.type,
            chainName: this.ctxMProp.chain,
            resnum: (this.ctxMProp.type === 'res') ? this.ctxMProp.num : null,
            resname: (this.ctxMProp.type === 'res') ? this.ctxMProp.name : null
          })
      },
      contact (part, event) {
        this.$store.dispatch('focusContact', {target: part})
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped> 
  .tooltip, .context-menu {
    position: fixed;
    background: #1f2d3d;
    padding: 0.2em 0.4em;
    color: #fff;
    border-radius: 5px;
    min-width: 4em;
    max-width: 50em;
    text-align: center;
    min-height: 1.5em;
    font-weight: 600;
    line-height: 1.5em;
    z-index: 2;
    word-wrap: break-word;
  }
  
  .tooltip:after, .context-menu:after {
    right: 100%;
    top: 1em;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: rgba(47, 64, 74, 0);
    border-right-color: #1f2d3d;
    border-width: 5px;
    margin-top: -5px;
  }

  .context-menu {
    background: #EFF2F7;
    color: #1f2d3d;
    font-weight: 400;
    font-size: 0.9em;
    padding: 0;
    white-space: nowrap;
  }

  .context-menu ul {
    margin: 0 0 5px 0;
    padding: 0;
  }
  .context-menu li {
    list-style: none;
    text-align: left;
    padding: 0 0.4em;
  }
  .context-menu li:hover {
    background: #20A0FF;
    color: #fff;
    cursor: pointer;
  }
  .context-menu li.disabled {
    color: #C0CCDA;
  }
  .context-menu li.disabled:hover {
    cursor: default;
    background: transparent;
    color: #C0CCDA;
  }
  .context-menu div {
    background: #1f2d3d;
    border-radius: 5px 5px 0 0;
    margin-bottom: 0.2em;
    font-weight: 600;
    color: #fff;
    padding: 0 0.5em;
  }
  .context-menu-backdrop {
    background: transparent;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
  }
</style>
