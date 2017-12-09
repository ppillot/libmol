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
    if (pickingProxy === undefined || pickingProxy.mouse.pressed) {
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
        atom.type = 'atom'
        prevAtom = atom
        return debouncedCallBack(atom)
      case 'bond':
        atom = getAtomProperties(pickingProxy.closestBondAtom)
        atom.pos = pickingProxy.controls.stage.viewerControls.getPositionOnCanvas(pickingProxy.closestBondAtom)
        atom.type = 'atom'
        prevAtom = atom
        return debouncedCallBack(atom)
      case 'contact':
        let contact = {
          type: 'contact',
          atom1: getAtomProperties(pickingProxy.contact.atom1),
          atom2: getAtomProperties(pickingProxy.contact.atom2),
          contactType: pickingProxy.contact.type
        }
        return debouncedCallBack(contact)
      default:
        // console.log(pickingProxy.picker.type)
        prevAtom = {}
        return callback()
    }
  }
}

export {hover}
