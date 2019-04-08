import { Selection, Shape, Structure } from 'ngl'
import BitArray from 'ngl/declarations/utils/bitarray'
import AtomProxy from 'ngl/declarations/proxy/atom-proxy'
import StructureComponent from 'ngl/declarations/component/structure-component'
import RepresentationElement from 'ngl/declarations/component/representation-element'
import Representation from 'ngl/declarations/representation/representation'

function getDiSulfideBridges (structure: Structure) {
  const sulfursInCysteins = structure.getAtomSet(new Selection('cys and _S'))
  let sulfurPairs: number[] = []
  let traceAtomPairs: number[] = []
  let atomSet: BitArray = structure.getAtomSet().clone().clearAll()

  const getTraceAtom = function (ap: AtomProxy) {
    return structure.getResidueProxy(ap.residueIndex).traceAtomIndex
  }

  structure.atomCenter()
  sulfursInCysteins.forEach(index => {
    if (!atomSet.get(index)) {
      const sulfur = structure.getAtomProxy(index)
      sulfur.eachBondedAtom(bondedAtom => {
        if (bondedAtom.element === 'S') {
          sulfurPairs.push(index)
          sulfurPairs.push(bondedAtom.index)

          traceAtomPairs.push(getTraceAtom(sulfur))
          traceAtomPairs.push(getTraceAtom(bondedAtom))

          atomSet.set(index)
          atomSet.set(bondedAtom.index)
        }
      })
    }
  })

  return {
    length: sulfurPairs.length / 2,
    sulfurPairs,
    traceAtomPairs,
    atomSet
  }
}

function ssBridges (component: StructureComponent, representationsList: Representation[]) {
  const structure = component.structure
  let enabled = false
  const ssb = getDiSulfideBridges(structure)
  let reprSSBridges: RepresentationElement

  function enable (setting: boolean) {
    enabled = setting
    update()
  }

  function update () {
    if (component.hasRepresentation(reprSSBridges)) {
      component.removeRepresentation(reprSSBridges)
    }

    if (enabled) {
      // check which pairs are visible
      let visibleCys = structure.getAtomSet().clone().clearAll()
      let visibleCysBB = visibleCys.clone()
      let visibleCysSideChain = visibleCys.clone()

      representationsList.forEach(repr => {
        visibleCys.union(repr.displayedAtomSet)
        if (['cartoon', 'ribbon', 'backbone'].includes(repr.display)) {
          visibleCysBB.union(repr.displayedAtomSet)
        } else if (!['contact', 'base'].includes(repr.display)) {
          visibleCysSideChain.union(repr.displayedAtomSet)
        }
      })
      visibleCys.intersection(ssb.atomSet)
      visibleCysBB.intersection(ssb.atomSet)
      visibleCysSideChain.intersection(ssb.atomSet)

      let visiblePairs = []
      // let visibleTracePairs = []
      let getVisibleAtom = function (id: number) {
        return (visibleCysSideChain.get(ssb.sulfurPairs[id]))
          ? ssb.sulfurPairs[id]
          : ssb.traceAtomPairs[id]
      }

      for (let i = 0; i < ssb.sulfurPairs.length; i += 2) {
        if (visibleCys.get(ssb.sulfurPairs[i]) && visibleCys.get(ssb.sulfurPairs[i + 1])) {
          visiblePairs.push(getVisibleAtom(i))
          visiblePairs.push(getVisibleAtom(i + 1))
        }
      }

      // create a component
      let shapeSSBridge = new Shape('shape')
      for (let i = 0; i < visiblePairs.length; i += 2) {
        const a = structure.getAtomProxy(visiblePairs[i])
        const b = structure.getAtomProxy(visiblePairs[i + 1])

        shapeSSBridge.addCylinder(
          [a.x, a.y, a.z],
          [b.x, b.y, b.z],
          [1, 1, 0],
          0.315, 'ss')
      }
      reprSSBridges = component.addBufferRepresentation(shapeSSBridge, { name: 'ssbridge' })
    }
  }

  function count () {
    return ssb.length
  }

  return {
    enable,
    update,
    count
  }
}
export { getDiSulfideBridges, ssBridges }
