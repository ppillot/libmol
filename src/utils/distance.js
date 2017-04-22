import { getAtomProperties } from './atoms'

function measureDistance (component, context) {
  let tabMeasures = []
  let measure = {
    atom1: {},
    atom2: {},
    distance: 0
  }
  let distRepr = {}
  let distHighLightRepr = {}
  let labelColor = 0x000000
  const comp = component
  let highlight = false

  function dispatch () {
    context.dispatch('setDistances', tabMeasures)
  }

  function getDistance (atom1, atom2) {
    return atom1.distanceTo(atom2)
  }

  function switchBackgroundColor (color) {
    labelColor = (color === 'black') ? 0xFFFFFF : 0x000000
    if (comp.hasRepresentation(distRepr)) {
      distRepr.setParameters({labelColor: labelColor})
    }
  }

  function distanceRepresentation () {
    const tabAtomPairs = tabMeasures.reduce((acc, val) => {
      return acc.concat([[val.atom1.index, val.atom2.index]])
    }, [])

    if (comp.hasRepresentation(distRepr)) {
      distRepr.setParameters({
        atomPair: tabAtomPairs
      })
    } else {
      distRepr = comp.addRepresentation('distance', {
        atomPair: tabAtomPairs,
        labelColor: labelColor,
        color: 0x1D8CE0,
        opacity: 0.5,
        scale: 0.1,
        labelUnit: 'nm'
      })
    }
  }

  function distanceHighlight (atom) {
    if (atom === undefined) {
      if (!comp.hasRepresentation(distHighLightRepr) || !highlight) {
        return
      }
      // hover a non atom/bond shape
      if (measure.atom1.index) {
        distHighLightRepr.setSelection('@' + measure.atom1.index)
      } else {
        distHighLightRepr.setSelection('none')
        highlight = false
      }
      return
    }

    const atom1Modifier = (measure.atom1.index) ? ',' + measure.atom1.index : ''
    if (comp.hasRepresentation(distHighLightRepr)) {
      distHighLightRepr.setSelection('@' + atom.index + atom1Modifier)
    } else {
      distHighLightRepr = comp.addRepresentation('spacefill', {
        sele: '@' + atom.index,
        color: 'red',
        scale: 0.4,
        opacity: 0.5
      })
    }
    highlight = true
  }

  function clearDistanceHightLight () {
    if (distHighLightRepr.name !== undefined) {
      distHighLightRepr.setSelection('none')
      highlight = false
    }
  }

  function clearMeasure (index) {
    tabMeasures.splice(index, 1)
    distanceRepresentation()
    dispatch()
  }

  function clearAllMeasures () {
    tabMeasures = []
    distanceRepresentation()
    dispatch()
  }

  function handleClick (pickingProxy) {
    if (pickingProxy === undefined ||
      pickingProxy.type !== 'atom' && pickingProxy.type !== 'bond') {
      // cancel measurement
      // send a warning
      measure.atom1 = {}
      clearDistanceHightLight()
      return
    }
    let atomClicked = pickingProxy.atom || pickingProxy.closestBondAtom

    if (measure.atom1.index === undefined) {
      // first atom to be added to the measure
      measure.atom1 = atomClicked
      distanceHighlight(measure.atom1)
      return
    }
    measure.atom2 = atomClicked
    measure.distance = getDistance(measure.atom1, measure.atom2)
    tabMeasures.push({
      atom1: getAtomProperties(measure.atom1),
      atom2: getAtomProperties(measure.atom2),
      distance: measure.distance
    })
    measure.atom1 = {}
    distanceRepresentation()
    clearDistanceHightLight()
    dispatch()
  }

  function handleHover (pickingProxy) {
    if (pickingProxy === undefined ||
      pickingProxy.type !== 'bond' && pickingProxy.type !== 'atom') {
      distanceHighlight(undefined)
    } else {
      let atom = (pickingProxy.type === 'atom') ? pickingProxy.atom : pickingProxy.closestBondAtom
      distanceHighlight(atom)
    }
  }

  return {
    clickDistance: function (response) {
      return handleClick(response)
    },
    delete: function (index) {
      return clearMeasure(index)
    },
    deleteAll: function () {
      return clearAllMeasures()
    },
    getMeasures: function () {
      return tabMeasures
    },
    hoverDistance: function (response) {
      return handleHover(response)
    },
    switchColor: function (color) {
      return switchBackgroundColor(color)
    }
  }
}

export { measureDistance }
