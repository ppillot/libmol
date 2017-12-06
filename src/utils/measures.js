import { getAtomProperties } from './atoms'
import { Vector3 } from 'ngl'

function measure (component, context) {
  let tabDistanceMeasurements = []
  let tabAngleMeasurements = []
  let measure = {
    atom1: {},
    atom2: {},
    atom3: {},
    angle: 0,
    distance: 0
  }
  let distRepr = {}
  let angleRepr = {}
  let measureHighlightRepr = {}
  let labelColor = 0x000000
  const comp = component
  let highlight = false

  function dispatchDistance () {
    context.dispatch('setDistances', tabDistanceMeasurements)
  }

  function dispatchAngle () {
    context.dispatch('setAngles', tabAngleMeasurements)
  }

  function getDistance (atom1, atom2) {
    return atom1.distanceTo(atom2)
  }

  function getAngle (atom1, atom2, atom3) {
    const vCoord1 = new Vector3(atom1.x, atom1.y, atom1.z)
    const vCoord2 = new Vector3(atom2.x, atom2.y, atom2.z)
    const vCoord3 = new Vector3(atom3.x, atom3.y, atom3.z)

    let v21 = new Vector3()
    let v23 = new Vector3()

    v21.subVectors(vCoord1, vCoord2)
    v23.subVectors(vCoord3, vCoord2)

    return v21.angleTo(v23) / Math.PI * 180
  }

  function switchBackgroundColor (color) {
    labelColor = (color === 'black') ? 0xFFFFFF : 0x000000
    if (comp.hasRepresentation(distRepr)) {
      distRepr.setParameters({labelColor: labelColor})
    }
    if (comp.hasRepresentation(angleRepr)) {
      angleRepr.setParameters({labelColor: labelColor})
    }
  }

  function distanceRepresentation () {
    const tabAtomPairs = tabDistanceMeasurements.reduce((acc, val) => {
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
        labelZOffset: 2,
        // showBackground: true,
        color: 0x409EFF,
        opacity: 0.9,
        scale: 0.4,
        labelUnit: 'nm'
      })
    }
  }

  function angleRepresentation () {
    const tabAtomTriples = tabAngleMeasurements.reduce((acc, val) => {
      return acc.concat([[val.atom1.index, val.atom2.index, val.atom3.index]])
    }, [])

    if (comp.hasRepresentation(angleRepr)) {
      angleRepr.setParameters({
        atomTriple: tabAtomTriples
      })
    } else {
      angleRepr = comp.addRepresentation('angle', {
        atomTriple: tabAtomTriples,
        labelColor: labelColor,
        color: 0xFBE100,
        opacity: 0.9,
        scale: 0.1,
        labelUnit: '°'
      })
    }
  }

  function measureHighlight (atom) {
    if (atom === undefined) {
      if (!comp.hasRepresentation(measureHighlightRepr) || !highlight) {
        return
      }
      // hover a non atom/bond shape
      if (measure.atom1.index) {
        if (measure.atom2.index) {
          measureHighlightRepr.setSelection('@' + measure.atom1.index + ',' + measure.atom2.index)
        } else {
          measureHighlightRepr.setSelection('@' + measure.atom1.index)
        }
      } else {
        measureHighlightRepr.setSelection('none')
        highlight = false
      }
      return
    }

    let otherAtomsIdentifier = (measure.atom1.index !== undefined) ? ',' + measure.atom1.index : ''
    otherAtomsIdentifier += (measure.atom2.index !== undefined) ? ',' + measure.atom2.index : ''

    if (comp.hasRepresentation(measureHighlightRepr)) {
      measureHighlightRepr.setSelection('@' + atom.index + otherAtomsIdentifier)
    } else {
      measureHighlightRepr = comp.addRepresentation('spacefill', {
        sele: '@' + atom.index,
        color: 'red',
        radiusScale: 0.4,
        opacity: 0.5
      })
    }
    highlight = true
  }

  function clearMeasureHightLight () {
    if (measureHighlightRepr.name !== undefined) {
      measureHighlightRepr.setSelection('none')
      highlight = false
    }
  }

  function clearMeasure (type, index) {
    let params = (index === undefined) ? [0] : [index, 1]
    switch (type) {
      case 'distance':
        tabDistanceMeasurements.splice(...params)
        distanceRepresentation()
        dispatchDistance()
        break
      case 'angle':
        tabAngleMeasurements.splice(...params)
        angleRepresentation()
        dispatchAngle()
        break
    }
  }

  function handleClick (pickingProxy) {
    if (pickingProxy === undefined ||
      (pickingProxy.type !== 'atom' && pickingProxy.type !== 'bond')) {
      // cancel measurement
      // send a warning
      measure.atom1 = {}
      measure.atom2 = {}
      clearMeasureHightLight()
      return
    }
    let atomClicked = pickingProxy.atom || pickingProxy.closestBondAtom

    if (measure.atom1.index === undefined) {
      // first atom to be added to the measure
      measure.atom1 = atomClicked
      measureHighlight(measure.atom1)
      return
    }
    measure.atom2 = atomClicked
    measure.distance = getDistance(measure.atom1, measure.atom2)
    tabDistanceMeasurements.push({
      atom1: getAtomProperties(measure.atom1),
      atom2: getAtomProperties(measure.atom2),
      distance: measure.distance
    })
    measure.atom1 = {}
    measure.atom2 = {}
    distanceRepresentation()
    clearMeasureHightLight()
    dispatchDistance()
  }

  function handleClickAngle (pickingProxy) {
    if (pickingProxy === undefined ||
      (pickingProxy.type !== 'atom' && pickingProxy.type !== 'bond')) {
      // cancel measurement
      // send a warning
      measure.atom1 = {}
      measure.atom2 = {}
      clearMeasureHightLight()
      return
    }
    let atomClicked = pickingProxy.atom || pickingProxy.closestBondAtom

    if (measure.atom1.index === undefined) {
      // first atom to be added to the measure
      measure.atom1 = atomClicked
      measureHighlight(measure.atom1)
      return
    } else if (measure.atom2.index === undefined) {
      // first atom to be added to the measure
      measure.atom2 = atomClicked
      measureHighlight(measure.atom2)
      return
    }
    measure.atom3 = atomClicked
    measure.angle = getAngle(measure.atom1, measure.atom2, measure.atom3)
    tabAngleMeasurements.push({
      atom1: getAtomProperties(measure.atom1),
      atom2: getAtomProperties(measure.atom2),
      atom3: getAtomProperties(measure.atom3),
      angle: measure.angle
    })
    measure.atom1 = {}
    measure.atom2 = {}
    measure.atom3 = {}
    angleRepresentation()
    clearMeasureHightLight()
    dispatchAngle()
  }

  function handleHover (pickingProxy) {
    if (pickingProxy === undefined ||
      (pickingProxy.type !== 'bond' && pickingProxy.type !== 'atom')) {
      measureHighlight(undefined)
    } else {
      let atom = (pickingProxy.type === 'atom') ? pickingProxy.atom : pickingProxy.closestBondAtom
      measureHighlight(atom)
    }
  }
  // clean all measures when starting
  dispatchAngle()
  dispatchDistance()

  return {
    clickDistance: function (response) {
      return handleClick(response)
    },
    clickAngle: function (response) {
      return handleClickAngle(response)
    },
    delete: function (type, index) {
      return clearMeasure(type, index)
    },
    deleteAll: function (type) {
      return clearMeasure(type)
    },
    getMeasures: function () {
      return tabDistanceMeasurements
    },
    hoverMeasure: function (response) {
      return handleHover(response)
    },
    switchColor: function (color) {
      return switchBackgroundColor(color)
    },
    disable: function () {
      handleClick(undefined)
    }
  }
}

export { measure }
