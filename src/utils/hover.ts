import { getAtomProperties } from './atoms'
import PickingProxy from 'ngl/declarations/controls/picking-proxy'
import { ActionContext } from 'vuex'
import { Vector2, Vector3 } from 'three'

interface AtomProps {
  index: number;
  serial: number;
  symbol: string;
  atomname: string;
  resname: string;
  resno: number;
  chainname: string;
  entity: string;
  resType: number;
  pos?: Vector2;
  type?: string;
}

function hover (context: ActionContext<any, any>) {
  let prevPid = NaN
  let prevAtom: AtomProps|{}
  let timeout: number

  function debouncedCallBack (token: {[k: string]: any}) {
    // console.log(token)
    window.clearTimeout(timeout)
    timeout = window.setTimeout(function () {
      context.dispatch('hover', token)
    }, 500)
  }
  function callback (token?: {[k: string]: any}) {
    window.clearTimeout(timeout)
    context.dispatch('hover', token)
  }

  return function (pickingProxy: PickingProxy) {
    // console.log(pickingProxy)
    // background is being hovered
    if (pickingProxy === undefined || pickingProxy.mouse.pressed) {
      if (isNaN(prevPid)) { // nothing has changed
        return
      } else {
        prevPid = NaN
        if (!prevAtom.hasOwnProperty('index')) { // no label was displayed, nothing changes
          return
        } else {
          callback()
          return
        }
      }
    }
    if (pickingProxy.pid === prevPid) {
      // we keep displaying the same label
      return
    }

    let atom: AtomProps
    prevPid = pickingProxy.pid

    switch (pickingProxy.picker.type) {
      case 'atom':
        atom = getAtomProperties(pickingProxy.atom)
        // @ts-ignore missing property on type AtomProxy
        atom.pos = pickingProxy.controls.stage.viewerControls.getPositionOnCanvas(pickingProxy.atom as Vector3)
        atom.type = 'atom'
        prevAtom = atom
        debouncedCallBack(atom)
        break
      case 'bond':
        atom = getAtomProperties(pickingProxy.closestBondAtom!)
        // @ts-ignore mission property on type AtomProxy
        atom.pos = pickingProxy.controls.stage.viewerControls.getPositionOnCanvas(pickingProxy.closestBondAtom!)
        atom.type = 'atom'
        prevAtom = atom
        debouncedCallBack(atom)
        break
      case 'contact':
        // console.log(pickingProxy)
        let contact = {
          type: 'contact',
          atom1: getAtomProperties(pickingProxy.contact.atom1),
          atom2: getAtomProperties(pickingProxy.contact.atom2),
          contactType: pickingProxy.contact.type,
          pos: pickingProxy.canvasPosition
        }
        debouncedCallBack(contact)
        break
      default:
        // console.log(pickingProxy.picker.type)
        prevAtom = {}
        callback()
    }
  }
}

export { hover }
