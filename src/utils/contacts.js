import {Selection, ColormakerRegistry} from 'ngl'
import {byres} from './colors'

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
    description: atomP.entity.description,
    atomList: getAtomListFromAToRange(atomP.residueAtomOffset, atomP.residueStore.atomCount[atomP.residueIndex])
  }
}

function contact (comp, context) {
  let tabContacts = []
  let tabContactsRepr = []
  let nbContacts = 0
  let structure = comp.structure

  function dispatch () {
    context.commit('setContacts', tabContacts)
  }

  function getResiduePropertiesFromSelestring (res) {
    const as = comp.structure.getAtomSet(new Selection(res))
    const an = as.toArray()[0]
    const ap = comp.structure.getAtomProxy(an)

    return makeRes(ap)
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

    const vicinitySele = `(${seleGroupWithin.toSeleString()}) and (not backbone or .CA or (PRO and .N)) and not ${resnum}:${chainId}`

    const vicinity = comp.addRepresentation('licorice', {
      multipleBond: true,
      sele: vicinitySele,
      aspectRatio: 2.1,
      radiusScale: 1.1
    })

    const targetSele = `${resnum}:${chainId} and (not backbone or .CA or (PRO and .N))`
    const target = comp.addRepresentation('ball+stick', {
      sele: targetSele,
      multipleBond: true,
      aspectRatio: 2.1,
      radiusScale: 1.2
    })

    const label = comp.addRepresentation('label', {
      labelType: 'residue',
      // labelText: resnameList,
      labelGrouping: 'residue',
      attachment: 'middle-center',
      radisuType: 'size',
      radiusSize: 0.8,
      zOffset: 2,
      backgroundOpacity: 0.8,
      color: 0x1f2d3d,
      fontWeight: 'normal',
      showBackground: true,
      sele: `(${seleGroupWithin.toSeleString()}) and .CA`
    })

    tabContacts.push({
      index: nbContacts,
      visible: true,
      target: {
        type: 'res',
        name: `${resnum}:${chainId}`,
        res: getResiduePropertiesFromSelestring(`${resnum}:${chainId}`)
      },
      contactsList: contactsArray,
      repr: {
        colormaker: undefined,
        contact: {
          visible: true
        },
        label: {
          visible: true
        },
        target: {
          color: 'element',
          reprName: 'ball+stick',
          visible: true,
          surface: false,
          label: true,
          seleString: targetSele
        },
        vicinity: {
          contactOnly: false,
          visible: true,
          radius: 4.5,
          label: true,
          reprName: 'licorice',
          color: 'element',
          seleString: vicinitySele
        }
      }
    })

    tabContactsRepr.push({
      contact: c,
      target: target,
      vicinity: vicinity,
      label: label
    })

    ++nbContacts

    dispatch()

    setColormaker(tabContacts.length - 1)
  }

  /* function getIndexFromId (id) {
    return tabContacts.findIndex(c => {
      return (c.index === id)
    })
  } */

  function clearContact (index) {
    for (let r in tabContactsRepr[index]) {
      tabContactsRepr[index][r].dispose()
    }
    tabContactsRepr.splice(index, 1)
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

  function replaceByByres (val) {
    return (val === 'resname') ? byres : val
  }

  function getGlobalColormaker () {
    // we need to find in the userSchemes, the first scheme with a name including "default"
    const cm = Object.keys(ColormakerRegistry.userSchemes).find(
      val => {
        return val.indexOf('default') !== -1
      }
    )
    return cm
  }

  function setColormakerArray ({target, vicinity}) {
    let a = []
    if (target.color !== 'default') {
      a.push([replaceByByres(target.color), target.seleString])
    }
    if (vicinity.color !== 'default') {
      a.push([replaceByByres(vicinity.color), vicinity.seleString])
    }
    return a
  }
  function setColormaker (index) {
    const contact = tabContacts[index].repr
    const colormakerArray = setColormakerArray(contact)
    const c = ColormakerRegistry.addSelectionScheme(colormakerArray)
    if (contact.colormaker !== undefined) {
      ColormakerRegistry.removeScheme(contact.colormaker)
    }
    contact.colormaker = c
  }

  function setProperties (index, properties) {
    console.log(index, tabContactsRepr, tabContacts)
    const contactRepr = tabContactsRepr[index]
    const contact = tabContacts[index]
    const repr = (properties.hasOwnProperty('repr')) ? contactRepr[properties.repr] : undefined

    if (repr === undefined) {
      if (properties.param.hasOwnProperty('visible')) {
        for (let i in contactRepr) {
          if (contactRepr.hasOwnProperty(i)) {
            // if user switches visibiity back to true globally,
            // we roll back each representation from the contact
            // to its previous individual visibility setting
            // hence the boolean operation
            const visible = (properties.param.visible && contact.repr[i].visible)
            contactRepr[i].setVisibility(visible)
          }
        }
        contact.visible = properties.param.visible
      }
    } else {
      if (properties.param.hasOwnProperty('visible')) {
        repr.setVisibility(properties.param.visible)
        contact.repr[properties.repr].visible = properties.param.visible
      } else if (properties.param.hasOwnProperty('reprName')) {
        const r = comp.addRepresentation(properties.param.reprName, {
          sele: repr.parameters.sele,
          multipleBond: true,
          color: (contact.repr.target.color === 'default') ? getGlobalColormaker() : contact.repr.colormaker
        })
        repr.dispose()
        contactRepr[properties.repr] = r

        contact.repr[properties.repr].reprName = properties.param.reprName
      } else if (properties.param.hasOwnProperty('color')) {
        const c = properties.param.color
        switch (c) {
          case 'default':
            contact.repr[properties.repr].color = 'default'
            break
          case 'element':
            contact.repr[properties.repr].color = 'element'
            break
          case 'resname':
            contact.repr[properties.repr].color = 'resname'
            break
          default:
            if (c.charAt(0) === '#') {
              contact.repr[properties.repr].color = c
            }
        }
        if (c === 'default') {
          // Coloration by default is the same coloration as the globalColormaker
          const cm = getGlobalColormaker()
          repr.setColor(cm)
        } else {
          setColormaker(index)
          repr.setColor(contact.repr.colormaker)
        }
      }
    }
    // tabContacts[index].repr.setParameters(properties)
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
      // const index = getIndexFromId(id)
      return clearContact(id)
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
    setProperties: function (props) {
      // const index = getIndexFromId(props.index)
      return setProperties(props.index, props)
    },
    checkContactExists: function (atomSet) {
      return checkContactExists(atomSet)
    }
  }
}

export {contact, contactTypesIndices, contactTypesMap}
