import {getAtomProperties} from './atoms'

function hover (context) {
  let prevPid = NaN
  let prevAtom = {}
  let timeout

  function debouncedCallBack (token) {
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      context.dispatch('hover', token)
    }, 500)
  }
  function callback (token) {
    clearTimeout(timeout)
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
          return callback()
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
        atom.pos = pickingProxy.controls.stage.viewerControls.getPositionOnCanvas(pickingProxy.atom)
        prevAtom = atom
        return debouncedCallBack(atom)
      case 'bond':
        atom = getAtomProperties(pickingProxy.closestBondAtom)
        atom.pos = pickingProxy.controls.stage.viewerControls.getPositionOnCanvas(pickingProxy.closestBondAtom)
        prevAtom = atom
        return debouncedCallBack(atom)
      default:
        prevAtom = {}
        return callback()
    }
  }
}

export {hover}
