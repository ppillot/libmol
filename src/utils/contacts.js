import {Selection} from 'ngl'

const contactTypesMap = new Map([
  ['hydrogen bond', 'hydrogenBond'],
  ['weak hydrogen bond', 'weakHydrogenBond'],
  ['water hydrogen bond', 'waterHydrogenBond'],
  ['backbone hydrogen bond', 'backboneHydrogenBond'],
  ['hydrophobic contact', 'hydrophobic'],
  ['ionic interaction', 'ionicInteraction'],
  ['pi-pi stacking', 'piStacking'],
  ['cation-pi interaction', 'cationPi'],
  ['metal coordination', 'metalCoordination'],
  ['halogen bond', 'halogenBond']
])

const contactTypesIndices = [
  'unknown',
  'ionicInteraction',
  'cationPi',
  'piStacking',
  'hydrogenBond',
  'halogenBond',
  'hydrophobic',
  'metalCoordination',
  'weakHydrogenBond',
  'waterHydrogenBond',
  'backboneHydrogenBond'
]

function getAtomListFromAToRange (start, range) {
  let numArr = []
  for (let i = 0; i < range; i++) {
    numArr.push(start + i)
  }
  return numArr
}

function makeRes (atomP) {
  return {
    chainname: atomP.chainname,
    resname: atomP.resname,
    resno: atomP.resno,
    element: atomP.element,
    atomList: getAtomListFromAToRange(atomP.residueAtomOffset, atomP.residueStore.atomCount[atomP.residueIndex])
  }
}

function contact (comp, context) {
  let tabContacts = []
  let nbContacts = 0
  let structure = comp.structure

  function dispatch () {
    /* const tC = tabContacts.map(val => {
      return {
        id: val.id,
        atomSet: val.atomSet,
        props: val.props,
        sele: val.sele
      }
    }) */
    context.commit('setContacts', tabContacts)
  }

  function createContact ({resnum, chainId}) {
    const sele = `${resnum}:${chainId} and not backbone`
    const seleWithin = structure.getAtomSetWithinSelection(new Selection(sele), 4.5)
    const water = structure.getAtomSet(new Selection('water'))
    seleWithin.difference(water)
    const seleGroupWithin = structure.getAtomSetWithinGroup(new Selection(`(${seleWithin.toSeleString()}) and not water`))
      // console.log(sele, seleWithin.getSize(), seleWithin)

    const c = comp.addRepresentation('contact', {
      hydrogenBond: true,
      weakHydrogenBond: false,
      backboneHydrogenBond: true,
      waterHydrogenBond: false,
      hydrophobic: true,
      ionicInteraction: true,
      metalCoordination: true,
      cationPi: true,
      piStacking: true,
      flatShaded: true,
      sele: seleWithin.toSeleString(),
      filterSele: sele
    })

    const contactStore = c.repr.bufferList[0].picking.contacts.contactStore
    const atomSets = c.repr.bufferList[0].picking.contacts.features.atomSets
    const contactsDisplayed = c.repr.bufferList[0].picking.array.reduce((arr, val) => {
      if (arr.indexOf(val) === -1) {
        arr.push(val)
      }
      return arr
    }, [])

    let contactsArray = []

    contactsDisplayed.forEach(val => {
      const atom1 = structure.getAtomProxy(atomSets[contactStore.index1[val]][0])
      const res1 = makeRes(atom1)
      const atom2 = structure.getAtomProxy(atomSets[contactStore.index2[val]][0])
      const res2 = makeRes(atom2)
      const type = contactStore.type[val]

      contactsArray.push({
        res1: res1,
        res2: res2,
        type: contactTypesIndices[type],
        seleString: '@' + res1.atomList.join(',') + ',' + res2.atomList.join(',')
      })
    })

    console.dir(contactsArray)

    const around = comp.addRepresentation('licorice', {
      multipleBond: true,
      sele: `(${seleGroupWithin.toSeleString()}) and sidechainattached and not ${resnum}:${chainId}`
    })

    const pivot = comp.addRepresentation('ball+stick', {
      sele: `${resnum}:${chainId} and sidechainattached`
    })

      // get names for each residue
    let resnameList = []
    structure.getAtomSet().forEach(atom => {
      const atomProxy = structure.getAtomProxy(atom)
      const txt = atomProxy.resname + atomProxy.resno
      resnameList.push(txt)
    })

    const label = comp.addRepresentation('label', {
      labelType: 'text',
      labelText: resnameList,
      zOffset: 2,
      backgroundOpacity: 0.8,
      color: 0x1f2d3d,
      fontWeight: 'normal',
      showBackground: true,
      sele: `(${seleGroupWithin.toSeleString()}) and .CA`
    })

    tabContacts.push({
      index: nbContacts,
      pivot: {
        type: 'res',
        name: `${resnum}:${chainId}`
      },
      contactsList: contactsArray,
      repr: {
        contact: c,
        label: label,
        pivot: {
          repr: pivot,
          color: 'element',
          reprName: 'ball+stick',
          visible: true,
          surface: false,
          label: true
        },
        around: {
          repr: around,
          contactOnly: false,
          visible: true,
          radius: 4.5,
          label: true,
          reprName: 'licorice',
          color: 'element'
        }
      }
    })

    ++nbContacts

    dispatch()
  }

  function getIndexFromId (id) {
    return tabContacts.findIndex(surf => {
      return (surf.id === id)
    })
  }

  function clearContact (index) {
    comp.removeRepresentation(tabContacts[index].repr)
    tabContacts.splice(index, 1)
    dispatch()
  }

  function clearAllContacts () {
    tabContacts.forEach(s => {
      comp.removeRepresentation(s.repr)
    })
    tabContacts = []
    dispatch()
  }

  function setProperties (index, properties) {
    if (properties.hasOwnProperty('visible')) {
      tabContacts[index].repr.setVisibility(properties.visible)
    }
    tabContacts[index].repr.setParameters(properties)
    Object.assign(tabContacts[index].props, properties)
    dispatch()
  }

  function checkContactExists (atomSet) {
    if (tabContacts.length === 0) return false
    const surf = tabContacts.find(val => {
      return val.atomSet.isEqualTo(atomSet)
    })
    return (surf !== undefined)
  }

  // clean all surfaces when starting
  dispatch()
  return {
    delete: function (id) {
      const index = getIndexFromId(id)
      return clearContact(index)
    },
    deleteAll: function () {
      return clearAllContacts()
    },
    getContacts: function () {
      return tabContacts
    },
    addContact: function ({resnum, chainId}) {
      return createContact({resnum, chainId})
    },
    setProperties: function (id, props) {
      const index = getIndexFromId(id)
      return setProperties(index, props)
    },
    checkContactExists: function (atomSet) {
      return checkContactExists(atomSet)
    }
  }
}

export {contact, contactTypesIndices, contactTypesMap}
