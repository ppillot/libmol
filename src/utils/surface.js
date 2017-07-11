import { StlWriter } from 'ngl'

function surface (comp, context) {
  let tabSurfaces = []
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

  function createSurface (selectedAtomSet, selectionToken) {
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
      atomSet: params.atomSet,
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

  function getIndexFromId (id) {
    return tabSurfaces.findIndex(surf => {
      return (surf.id === id)
    })
  }

  function clearSurface (index) {
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
  function downloadSTL (index) {
    const stl = new StlWriter(tabSurfaces[index].repr.repr.dataList[0].info.surface)
    stl.download(comp.structure.name + index)
  }

  function setProperties (index, properties) {
    if (properties.hasOwnProperty('visible')) {
      tabSurfaces[index].repr.setVisibility(properties.visible)
    }
    tabSurfaces[index].repr.setParameters(properties)
    Object.assign(tabSurfaces[index].props, properties)
    dispatch()
  }
  // clean all surfaces when starting
  dispatch()
  return {
    delete: function (id) {
      const index = getIndexFromId(id)
      return clearSurface(index)
    },
    deleteAll: function () {
      return clearAllSurfaces()
    },
    getSurfaces: function () {
      return tabSurfaces
    },
    addSurface: function (atomSet, sele) {
      return createSurface(atomSet, sele)
    },
    downloadSTL: function (id) {
      const index = getIndexFromId(id)
      return downloadSTL(index)
    },
    setProperties: function (id, props) {
      const index = getIndexFromId(id)
      return setProperties(index, props)
    }
  }
}

export default surface
