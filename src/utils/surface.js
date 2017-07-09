import { MolecularSurface, StlWriter } from 'ngl'

function surface (stage, structure, context) {
  let tabSurfaces = []
  let nbSurf = 0
  let molsurf = new MolecularSurface(structure)

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
    let params = {
      type: 'av',
      probeRadius: 1.4,
      name: `molsurf ${nbSurf}`,
      atomSet: selectedAtomSet || structure.getAtomSet()
    }
    let surf = molsurf.getSurface(params)
    const o = stage.addComponentFromObject(surf)
    const r = o.addRepresentation('surface')

    tabSurfaces.push({
      surf: surf,
      repr: r,
      atomSet: params.atomSet,
      sele: selectionToken,
      comp: o,
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
    stage.removeComponent(tabSurfaces[index].comp)
    tabSurfaces.splice(index, 1)
    dispatch()
  }

  function clearAllSurfaces () {
    tabSurfaces.forEach(s => {
      stage.removeComponent(s.comp)
    })
    tabSurfaces = []
    dispatch()
  }

  function downloadSTL (index) {
    const stl = new StlWriter(tabSurfaces[index])
    stl.download(structure.name + index)
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
