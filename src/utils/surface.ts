import { StlWriter } from 'ngl'
import StructureComponent from 'ngl/dist/declarations/component/structure-component'
import { ActionContext } from 'vuex'
import RepresentationElement from 'ngl/dist/declarations/component/representation-element'
import BitArray from 'ngl/dist/declarations/utils/bitarray'

interface SurfaceElement {
  repr: RepresentationElement,
  atomSet: BitArray,
  sele: string,
  id: number,
  props: {
    visible: boolean,
    opacity: number,
    colorValue: number,
    background: boolean
  }
}

function surface (comp: StructureComponent, context: ActionContext<any, any>) {
  let tabSurfaces: SurfaceElement[] = []
  let nbSurf = 0
  // let molsurf = new MolecularSurface(structure)

  function dispatch () {
    const tS = tabSurfaces.map(val => {
      return {
        id: val.id,
        atomSet: val.atomSet,
        props: val.props,
        sele: val.sele
      }
    })
    context.dispatch('setSurfaces', tS)
  }

  function createSurface (selectedAtomSet: BitArray, selectionToken: string) {
    // check if surface corresponding to selection is already defined

    // Creating the new surface object
    let atomSet = (selectedAtomSet === undefined) ? comp.structure.getAtomSet() : selectedAtomSet

    let params = {
      probeRadius: 1.4,
      name: `molsurf ${nbSurf}`,
      surfaceType: 'av',
      atomSet,
      sele: atomSet.toSeleString()
    }

    const r = comp.addRepresentation('surface', params)

    tabSurfaces.push({
      repr: r,
      atomSet: params.atomSet.clone(),
      sele: selectionToken,
      id: nbSurf,
      props: {
        visible: true,
        opacity: 1,
        colorValue: 0xffffff,
        background: false
      }
    })

    ++nbSurf

    dispatch()
  }

  function getIndexFromId (id: number) {
    return tabSurfaces.findIndex(surf => {
      return (surf.id === id)
    })
  }

  function clearSurface (index: number) {
    comp.removeRepresentation(tabSurfaces[index].repr)
    tabSurfaces.splice(index, 1)
    dispatch()
  }

  function clearAllSurfaces () {
    tabSurfaces.forEach(s => {
      comp.removeRepresentation(s.repr)
    })
    tabSurfaces = []
    dispatch()
  }

  // @@ Expected changes to NGL API regarding extracting vertices from representation
  function downloadSTL (index: number) {
    const stl = new StlWriter(tabSurfaces[index].repr.repr.dataList[0].info.surface)
    stl.download(comp.structure.name + index)
  }

  function setProperties (index: number, properties: SurfaceElement['props']) {
    if (properties.hasOwnProperty('visible')) {
      tabSurfaces[index].repr.setVisibility(properties.visible)
    }
    tabSurfaces[index].repr.setParameters(properties)
    Object.assign(tabSurfaces[index].props, properties)
    dispatch()
  }

  function checkSurfaceExists (atomSet: BitArray) {
    if (tabSurfaces.length === 0) return false
    const surf = tabSurfaces.find(val => {
      return val.atomSet.isEqualTo(atomSet)
    })
    return (surf !== undefined)
  }

  // clean all surfaces when starting
  dispatch()
  return {
    delete: function (id: number) {
      const index = getIndexFromId(id)
      return clearSurface(index)
    },
    deleteAll: function () {
      return clearAllSurfaces()
    },
    getSurfaces: function () {
      return tabSurfaces
    },
    addSurface: function (atomSet: BitArray, sele: string) {
      return createSurface(atomSet, sele)
    },
    downloadSTL: function (id: number) {
      const index = getIndexFromId(id)
      return downloadSTL(index)
    },
    setProperties: function (id: number, props: SurfaceElement['props']) {
      const index = getIndexFromId(id)
      return setProperties(index, props)
    },
    checkSurfaceExists: function (atomSet: BitArray) {
      return checkSurfaceExists(atomSet)
    }
  }
}

export default surface
