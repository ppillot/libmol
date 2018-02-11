import {Selection, ColormakerRegistry} from 'ngl'
import {byres} from './colors'
import ContactEntities from './contactEntities'

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

const defaultDisplayedContacts = {
  hydrogenBond: true,
  weakHydrogenBond: false,
  backboneHydrogenBond: true,
  waterHydrogenBond: false,
  hydrophobic: true,
  ionicInteraction: true,
  metalCoordination: true,
  cationPi: true,
  piStacking: true
}

function getAtomListFromAToRange (start, range) {
  let numArr = []
  for (let i = 0; i < range; i++) {
    numArr.push(start + i)
  }
  return numArr
}

function getArray (obj) {
  let t = []
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop] === true) {
        t.push(prop)
      }
    }
  }
  return t
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
    const cE = new ContactEntities(structure, {
      target: {
        resnum: resnum,
        chainId: chainId
      },
      isWaterExcluded: true,
      isBackboneExcluded: true,
      neighbouringRadius: 4.5
    })
    // const seleWithin = cE.withinTargetSeleString
    // const seleGroupWithin = structure.getAtomSetWithinGroup(new Selection(`(${seleWithin.toSeleString()}) and not water`))
    console.log(cE)

    let contactReprParam = {
      flatShaded: true,
      sele: cE.withinTargetSeleString,
      filterSele: cE.targetSeleString
    }
    Object.assign(contactReprParam, defaultDisplayedContacts)

    const c = comp.addRepresentation('contact', contactReprParam)

    let contactsArray = getContactsArray(c)

    const vicinity = comp.addRepresentation('licorice', {
      multipleBond: true,
      sele: cE.vicinitySeleString,
      aspectRatio: 2.1,
      radiusScale: 1.1
    })

    const targetSele = cE.targetSeleString
    const target = comp.addRepresentation('ball+stick', {
      sele: targetSele,
      multipleBond: true,
      aspectRatio: 2.1,
      radiusScale: 1.2
    })

    const label = comp.addRepresentation('label', {
      labelType: 'format',
      labelFormat: '[%(resname)s]%(resno)s',
      // labelText: resnameList,
      labelGrouping: 'residue',
      attachment: 'top-center',
      radiusType: 'size',
      radiusSize: 5,
      zOffset: 2,
      backgroundOpacity: 0.8,
      color: 0x1f2d3d,
      fontWeight: 'normal',
      showBackground: true,
      sele: `(${cE.vicinitySeleString})`,
      fixedSize: true
    })

    tabContacts.push({
      index: nbContacts,
      visible: true,
      target: {
        type: 'res',
        name: `${resnum}:${chainId}`,
        res: getResiduePropertiesFromSelestring(`${resnum}:${chainId}`)
      },
      params: {
        isWaterExcluded: true,
        isBackboneExcluded: true
      },
      contactsList: contactsArray,
      repr: {
        colormaker: undefined,
        contact: {
          visible: true,
          contactsTypes: getArray(defaultDisplayedContacts)
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
          seleString: cE.vicinitySeleString
        }
      }
    })

    tabContactsRepr.push({
      contact: c,
      contactEntities: cE,
      target: target,
      vicinity: vicinity,
      label: label
    })

    ++nbContacts

    dispatch()

    setColormaker(tabContacts.length - 1)
  }

  /**
   * Returns an array containing each pair of residue in contact
   * with the type of contact involved
   * @param {Object} c: NGL contact representation
   * @returns {Array} Array of objects
   */
  function getContactsArray (c) {
    const contactStore = c.repr.bufferList[0].picking.contacts.contactStore
    const atomSets = c.repr.bufferList[0].picking.contacts.features.atomSets
    const contactsDisplayed = c.repr.bufferList[0].picking.array.reduce((arr, val) => {
      if (arr.indexOf(val) === -1) {
        arr.push(val)
      }
      return arr
    }, [])

    const contactsArray = []
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

    return contactsArray
  }

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
      } else if (properties.param.hasOwnProperty('isWaterExcluded')) {
        contactRepr.contactEntities.setParameters({isWaterExcluded: properties.param.isWaterExcluded})
        contact.params.isWaterExcluded = properties.param.isWaterExcluded
        updateRepresentations(index)
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
      } else if (properties.param.hasOwnProperty('contactsTypes')) {
        let cT = {}
        for (let p in defaultDisplayedContacts) {
          cT[p] = false
        }
        properties.param.contactsTypes.forEach(val => {
          cT[val] = true
        })
        repr.setParameters(cT)
        contact.repr.contact.contactsTypes = getArray(cT)
      }
    }
    // tabContacts[index].repr.setParameters(properties)
    dispatch()
  }

  function updateRepresentations (index) {
    const repr = tabContactsRepr[index]
    // update NGL representations
    repr.contact.setSelection(repr.contactEntities.withinTargetSeleString)
    repr.target.setSelection(repr.contactEntities.targetSeleString)
    repr.vicinity.setSelection(repr.contactEntities.vicinitySeleString)
    repr.label.setSelection(repr.contactEntities.vicinitySeleString)

    // update state data
    const cState = tabContacts[index]
    cState.repr.target.seleString = repr.contactEntities.targetSeleString
    cState.repr.vicinity.seleString = repr.contactEntities.vicinitySeleString
    cState.contactsList = getContactsArray(repr.contact)
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
