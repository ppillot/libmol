import { getAtomProperties, AtomProperties } from './atoms'
import AtomProxy from 'ngl/declarations/proxy/atom-proxy'
import StructureComponent from 'ngl/declarations/component/structure-component'
import RepresentationElement from 'ngl/declarations/component/representation-element'
import PickingProxy from 'ngl/declarations/controls/picking-proxy'
import { Vector3 } from 'ngl'
import { ActionContext } from 'vuex'

interface Measure {
  atom1: AtomProperties|null,
  atom2: AtomProperties|null,
  atom3?: AtomProperties|null,
  angle?: number,
  distance?: number
}

function measure (component: StructureComponent, context: ActionContext<any, any>) {
  let tabDistanceMeasurements: Measure[] = []
  let tabAngleMeasurements: Measure[] = []
  let measure: {
    atom1: AtomProxy | null,
    atom2: AtomProxy | null,
    atom3: AtomProxy | null,
    distance?: number,
    angle?: number
  } = {
    atom1: null,
    atom2: null,
    atom3: null
  }
  let distRepr: RepresentationElement
  let angleRepr: RepresentationElement
  let measureHighlightRepr: RepresentationElement
  let labelColor = 0x000000
  const comp = component
  let highlight = false

  function dispatchDistance () {
    context.dispatch('setDistances', tabDistanceMeasurements)
  }

  function dispatchAngle () {
    context.dispatch('setAngles', tabAngleMeasurements)
  }

  function getDistance (atom1: AtomProxy, atom2: AtomProxy) {
    return atom1.distanceTo(atom2)
  }

  function getAngle (atom1: AtomProxy, atom2: AtomProxy, atom3: AtomProxy) {
    const vCoord1 = new Vector3(atom1.x, atom1.y, atom1.z)
    const vCoord2 = new Vector3(atom2.x, atom2.y, atom2.z)
    const vCoord3 = new Vector3(atom3.x, atom3.y, atom3.z)

    let v21 = new Vector3()
    let v23 = new Vector3()

    v21.subVectors(vCoord1, vCoord2)
    v23.subVectors(vCoord3, vCoord2)

    return v21.angleTo(v23) / Math.PI * 180
  }

  function switchBackgroundColor (color: string|number) {
    labelColor = (color === 'black') ? 0xFFFFFF : 0x000000
    if (comp.hasRepresentation(distRepr)) {
      distRepr.setParameters({ labelColor: labelColor })
    }
    if (comp.hasRepresentation(angleRepr)) {
      angleRepr.setParameters({ labelColor: labelColor })
    }
  }

  function distanceRepresentation () {
    const tabAtomPairs = tabDistanceMeasurements.reduce((acc, val) => {
      return acc.concat([[val.atom1!.index, val.atom2!.index]])
    }, [] as number[][])

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
        //labelSize: 3,
        labelFixedSize: true,
        labelUnit: 'nm'
      })
    }
  }

  function angleRepresentation () {
    const tabAtomTriples: number[][] = tabAngleMeasurements.reduce((acc, val) => {
      return acc.concat([[val.atom1!.index, val.atom2!.index, val.atom3!.index]])
    }, [] as number[][])

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

  function measureHighlight (atom?: AtomProxy) {
    if (atom === undefined) {
      if (!comp.hasRepresentation(measureHighlightRepr) || !highlight) {
        return
      }
      // hover a non atom/bond shape
      if (measure.atom1 !== null) {
        if (measure.atom2 !== null) {
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

    let otherAtomsIdentifier = (measure.atom1 !== null) ? ',' + measure.atom1.index : ''
    otherAtomsIdentifier += (measure.atom2 !== null) ? ',' + measure.atom2.index : ''

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
    if (measureHighlightRepr !== undefined) {
      measureHighlightRepr.setSelection('none')
      highlight = false
    }
  }

  function clearMeasure (type: 'distance'|'angle', index?: number) {
    let params = (index === undefined) ? [0] : [index, 1]
    switch (type) {
      case 'distance':
        // @ts-ignore 0 or more arguments received
        tabDistanceMeasurements.splice(...params)
        distanceRepresentation()
        dispatchDistance()
        break
      case 'angle':
        // @ts-ignore 0 or more arguments received
        tabAngleMeasurements.splice(...params)
        angleRepresentation()
        dispatchAngle()
        break
    }
  }

  function handleClick (pickingProxy?: PickingProxy) {
    if (pickingProxy === undefined ||
      (pickingProxy.type !== 'atom' && pickingProxy.type !== 'bond')) {
      // cancel measurement
      // send a warning
      measure.atom1 = null
      measure.atom2 = null
      clearMeasureHightLight()
      return
    }
    let atomClicked = pickingProxy.atom || pickingProxy.closestBondAtom

    if (measure.atom1 === null) {
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
    measure.atom1 = null
    measure.atom2 = null
    distanceRepresentation()
    clearMeasureHightLight()
    dispatchDistance()
  }

  function handleClickAngle (pickingProxy: PickingProxy) {
    if (pickingProxy === undefined ||
      (pickingProxy.type !== 'atom' && pickingProxy.type !== 'bond')) {
      // cancel measurement
      // send a warning
      measure.atom1 = null
      measure.atom2 = null
      clearMeasureHightLight()
      return
    }
    let atomClicked = pickingProxy.atom || pickingProxy.closestBondAtom

    if (measure.atom1 === null) {
      // first atom to be added to the measure
      measure.atom1 = atomClicked
      measureHighlight(measure.atom1)
      return
    } else if (measure.atom2 === null) {
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
    measure.atom1 = null
    measure.atom2 = null
    measure.atom3 = null
    angleRepresentation()
    clearMeasureHightLight()
    dispatchAngle()
  }

  function handleHover (pickingProxy: PickingProxy) {
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
    clickDistance: function (response: PickingProxy) {
      return handleClick(response)
    },
    clickAngle: function (response: PickingProxy) {
      return handleClickAngle(response)
    },
    delete: function (type: 'angle'|'distance', index: number) {
      return clearMeasure(type, index)
    },
    deleteAll: function (type: 'angle'|'distance') {
      return clearMeasure(type)
    },
    getMeasures: function () {
      return tabDistanceMeasurements
    },
    hoverMeasure: function (response: PickingProxy) {
      return handleHover(response)
    },
    switchColor: function (color: string|number) {
      return switchBackgroundColor(color)
    },
    disable: function () {
      handleClick(undefined)
    }
  }
}

export { measure }
