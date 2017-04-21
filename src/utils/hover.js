import {getAtomProperties} from './atoms'

function hover (context) {
  let prevPid = NaN
  let prevAtom = {}

  function callback (token) {
    context.dispatch('hover', token)
  }

  return function (pickingProxy) {
    // background is being hovered
    if (pickingProxy === undefined) {
      if (isNaN(prevPid)) { // nothing has changed
        return
      } else {
        prevPid = NaN
        if (prevAtom.index === undefined) { // no label was displayed, nothing changes
          return
        } else {
          return callback(undefined)
        }
      }
    }

    if (pickingProxy.pid === prevPid) {
      // we keep displaying the same label
      return
    }

    let atom = {}
    prevPid = pickingProxy.pid

    switch (pickingProxy.picker.type) {
      case 'atom':
        atom = getAtomProperties(pickingProxy.atom)
        atom.pos = {
          x: pickingProxy.mouse.canvasPosition.x,
          y: pickingProxy.mouse.canvasPosition.y
        }
        prevAtom = atom
        return callback(atom)
      case 'bond':
        atom = getAtomProperties(pickingProxy.closestBondAtom)
        atom.pos = pickingProxy.controls.stage.viewerControls.getPositionOnCanvas(pickingProxy.closestBondAtom)
        prevAtom = atom
        return callback(atom)
      default:
        prevAtom = {}
        return callback()
    }
  }
}

export {hover}
