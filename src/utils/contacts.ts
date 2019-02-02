import {Selection, ColormakerRegistry} from 'ngl'
import {byres} from './colors'
import ContactEntities from './contactEntities'
import AtomProxy from 'ngl/declarations/proxy/atom-proxy';
import { ActionContext } from 'vuex';
import StructureComponent from 'ngl/declarations/component/structure-component';
import ContactRepresentation from 'ngl/declarations/representation/contact-representation';
import RepresentationElement from 'ngl/declarations/component/representation-element';
import ContactStore from 'ngl/declarations/store/contact-store';
import { ContactPicker } from 'ngl/declarations/utils/picker';
import BitArray from 'ngl/declarations/utils/bitarray';
import { ContactType } from 'ngl/declarations/chemistry/interactions/contact';

interface ContactRepr {
  contact: RepresentationElement,
  contactEntities: ContactEntities,
  target: RepresentationElement,
  vicinity: RepresentationElement,
  label: RepresentationElement
  [k: string]: RepresentationElement|ContactEntities
}

interface ContactObject {
  index: number,
  visible: boolean,
  target: {
    type: 'chain' | 'res',
    name: string,
    res: Res | undefined,
    chain: string
  },
  params: {
    isWaterExcluded: boolean,
    isBackboneExcluded: boolean
  },
  contactsList: any[],
  repr: {
    colormaker: number|string|undefined,
    contact: {
      visible: boolean,
      contactsTypes: string[]
    },
    label: {
      visible: boolean,
      size: 3
    },
    target: {
      color: string,
      reprName: string,
      visible: boolean,
      surface: boolean,
      label: boolean,
      seleString: string
    },
    vicinity: {
      contactOnly: boolean,
      visible: boolean,
      radius: number,
      label: boolean,
      reprName: string,
      color: string,
      seleString: string
    }
    [k: string]: any
  }
  [k: string]: any
}

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

function getAtomListFromAToRange (start: number, range: number) {
  let numArr = []
  for (let i = 0; i < range; i++) {
    numArr.push(start + i)
  }
  return numArr
}

function getArray (obj: {[k: string]: any}) {
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

interface Res {
  chainname: string,
  resname: string,
  resno: number,
  element: string,
  description: string,
  atomList: number[]
}
function makeRes (atomP: AtomProxy): Res {
  return {
    chainname: atomP.chainname,
    resname: atomP.resname,
    resno: atomP.resno,
    element: atomP.element,
    description: atomP.entity.description,
    atomList: getAtomListFromAToRange(atomP.residueAtomOffset, atomP.residueStore.atomCount[atomP.residueIndex])
  }
}

function contact (comp: StructureComponent, context: ActionContext<any, any>) {
  let tabContacts: ContactObject[] = []
  let tabContactsRepr: ContactRepr[] = []
  let nbContacts = 0
  let structure = comp.structure

  function dispatch () {
    context.commit('setContacts', tabContacts)
  }

  function getResiduePropertiesFromSelestring (res: string) {
    if (res.indexOf('undefined') === 0) return undefined
    const as = comp.structure.getAtomSet(new Selection(res))
    const an = as.toArray()[0]
    const ap = comp.structure.getAtomProxy(an)

    return makeRes(ap)
  }

  function createContact ({target: {resnum, chainId}, filter}: {target: {resnum: number, chainId: string, [k: string]: any}, filter: string}) {
    const cE = new ContactEntities(structure, {
      target: {
        resnum: (resnum)? resnum.toString() : '',
        chainId: chainId
      },
      filter: filter,
      isWaterExcluded: true,
      isBackboneExcluded: true,
      radius: 4.5
    })
    // console.log(cE)

    let contactReprParam = {
      flatShaded: true,
      sele: cE.withinTargetSeleString,
      filterSele: cE.targetFilter
    }
    Object.assign(contactReprParam, defaultDisplayedContacts)

    const c = comp.addRepresentation('contact', contactReprParam)

    let contactsArray = getContactsArray(c)

    const vicinity = comp.addRepresentation('licorice', {
      multipleBond: true,
      sele: cE.vicinitySeleString,
      aspectRatio: 1.5,
      radiusScale: 1,
      diffuseInterior: true,
      useInteriorColor: false,
      interiorDarkening: 0.3
    })

    const targetSele = cE.targetCloseToContact
    const target = comp.addRepresentation('ball+stick', {
      sele: cE.targetCloseToContact,
      multipleBond: true,
      aspectRatio: 1.5,
      radiusScale: 1,
      diffuseInterior: true,
      useInteriorColor: false,
      interiorDarkening: 0.3
    })

    const label = comp.addRepresentation('label', {
      labelType: 'format',
      labelFormat: '[%(resname)s]%(resno)s',
      // labelText: resnameList,
      labelGrouping: 'residue',
      attachment: 'top-center',
      radiusType: 'size',
      radiusSize: 3,
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
        type: (resnum === undefined) ? 'chain' : 'res',
        name: `${(resnum === undefined) ? '' : resnum}:${chainId}`,
        res: getResiduePropertiesFromSelestring(`${resnum}:${chainId}`),
        chain: chainId
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
          visible: true,
          size: 3
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

    return tabContacts[tabContacts.length - 1]
  }

  /**
   * Returns an array containing each pair of residue in contact
   * with the type of contact involved
   * @param {RepresentationElement} c: NGL contact representation
   * @returns {Array} Array of objects
   */
  function getContactsArray (c: RepresentationElement) {
    const contactPicker = (c.repr.bufferList[0].picking! as ContactPicker)
    const contactStore = contactPicker.contacts.contactStore
    const atomSets = contactPicker.contacts.features.atomSets
    const contactsDisplayed = (contactPicker.array as number[]).reduce((arr, val) => {
      if (arr.indexOf(val) === -1) {
        arr.push(val)
      }
      return arr
    }, [] as number[])

    const contactsArray: {
      res1: Res,
      res2: Res,
      type: string,
      seleString: string
    }[] = []

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

  function clearContact (index: number) {
    for (let r in tabContactsRepr[index]) {
      if (tabContactsRepr[index][r].hasOwnProperty('repr'))
        (tabContactsRepr[index][r] as RepresentationElement).dispose()
    }
    tabContactsRepr.splice(index, 1)
    tabContacts.splice(index, 1)
    dispatch()
  }

  function clearAllContacts () {
    while (tabContactsRepr.length > 0) {
      clearContact(0)
    }
    tabContacts = []
    dispatch()
  }

  function replaceByByres (val: string) {
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

  function setColormakerArray ({
    target,
    vicinity
  }: {
    target: ContactObject['repr']['target'],
    vicinity: ContactObject['repr']['vicinity']
  }) {
    let a = []
    if (target.color !== 'default') {
      a.push([replaceByByres(target.color), target.seleString])
    }
    if (vicinity.color !== 'default') {
      a.push([replaceByByres(vicinity.color), vicinity.seleString])
    }
    return a
  }

  function setColormaker (index: number) {
    const contact = tabContacts[index].repr
    const colormakerArray = setColormakerArray(contact)
    const c = ColormakerRegistry.addSelectionScheme(colormakerArray as any)
    if (contact.colormaker !== undefined) {
      ColormakerRegistry.removeScheme(contact.colormaker as string)
    }
    contact.colormaker = c
  }

  function setProperties (index: number, properties: {[k: string]: any}) {
    // console.log(index, tabContactsRepr, tabContacts)
    const contactRepr = tabContactsRepr[index]
    const contact = tabContacts[index]
    const repr = (properties.hasOwnProperty('repr')) ? contactRepr[properties.repr] as RepresentationElement : undefined

    if (repr === undefined) {
      if (properties.param.hasOwnProperty('visible')) {
        for (let i in contactRepr) {
          if (contactRepr.hasOwnProperty(i) && contact.repr.hasOwnProperty(i)) {
            // if user switches visibility back to true globally,
            // we roll back each representation from the contact
            // to its previous individual visibility setting
            // hence the boolean operation
            const visible = (properties.param.visible && contact.repr[i].visible);
            (contactRepr[i] as RepresentationElement).setVisibility(visible)
          }
        }
        contact.visible = properties.param.visible
      } else if (properties.param.hasOwnProperty('isWaterExcluded')) {
        contactRepr.contactEntities.setParameters({isWaterExcluded: properties.param.isWaterExcluded})
        contact.params.isWaterExcluded = properties.param.isWaterExcluded
        updateRepresentations(index)
      } else if (properties.param.hasOwnProperty('radius')) {
        contactRepr.contactEntities.setParameters({radius: properties.param.radius})
        contact.repr.vicinity.radius = properties.param.radius
        updateRepresentations(index)
      }
    } else {
      if (properties.param.hasOwnProperty('visible')) {
        repr.setVisibility(properties.param.visible)
        contact.repr[properties.repr].visible = properties.param.visible
      } else if (properties.param.hasOwnProperty('reprName')) {
        const r = comp.addRepresentation(properties.param.reprName, {
          sele: contact.repr[properties.repr].seleString,
          multipleBond: true,
          color: (contact.repr.target.color === 'default') ? getGlobalColormaker() : contact.repr.colormaker,
          diffuseInterior: true,
          useInteriorColor: false,
          interiorDarkening: 0.3
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
          repr.setColor(cm!)
        } else {
          setColormaker(index)
          repr.setColor(contact.repr.colormaker!)
        }
      } else if (properties.param.hasOwnProperty('contactsTypes')) {
        let cT: {[k:string]: boolean} = {}
        for (let p in defaultDisplayedContacts) {
          cT[p] = false
        }
        (properties.param.contactsTypes as string[]).forEach(val => {
          cT[val] = true
        })
        repr.setParameters(cT)
        contact.repr.contact.contactsTypes = getArray(cT)
      } else if (properties.param.hasOwnProperty('size')) {
        repr.setParameters({
          radiusSize: properties.param.size
        })
        contact.repr.label.size = properties.param.size
      }
    }
    // tabContacts[index].repr.setParameters(properties)
    dispatch()
  }

  function updateRepresentations (index: number) {
    const repr = tabContactsRepr[index]
    // update NGL representations
    repr.contact.setSelection(repr.contactEntities.withinTargetSeleString)
    repr.target.setSelection(repr.contactEntities.targetCloseToContact)
    repr.vicinity.setSelection(repr.contactEntities.vicinitySeleString)
    repr.label.setSelection(repr.contactEntities.vicinitySeleString)

    // update state data
    const cState = tabContacts[index]
    cState.repr.target.seleString = repr.contactEntities.targetCloseToContact
    cState.repr.vicinity.seleString = repr.contactEntities.vicinitySeleString
    cState.contactsList = getContactsArray(repr.contact)

    // update colors
    setColormaker(index)
    repr.target.setColor(cState.repr.colormaker!)
    repr.vicinity.setColor(cState.repr.colormaker!)
  }

  function checkContactExists (atomSet: BitArray) {
    if (tabContacts.length === 0) return false
    const surf = tabContacts.find(val => {
      return val.atomSet.isEqualTo(atomSet)
    })
    return (surf !== undefined)
  }

  /**
   * focus on the given contact
   * @param {number} id index of the contact 
   */
  function focus (id: number) {
    const contact = tabContacts.find((c)=> {return c.index===id}) as ContactObject
    const sele = contact.repr.target.seleString + ' or ' + contact.repr.vicinity.seleString
    const stage = comp.stage
    const center = stage.compList[0].getCenter(sele)
    const zoom = stage.compList[0].getZoom(sele)
      
    stage.animationControls.zoomMove(center, zoom, 400)
    context.commit('setFog', [50, 60])
  }

  /**
   * show only the contact with the given id
   * @param id index of the contact
   */
  function showOnly (id: number) {
    tabContacts.forEach((contact, i) => {
      const repr = tabContactsRepr[i]
      const visibility = (contact.index === id)

      contact.visible = visibility;
      ['contact', 'target', 'label', 'vicinity'].forEach(part => {
        (repr[part] as RepresentationElement).setVisibility(visibility)
      })
    })
    dispatch()
  }

  // clean all contacts when starting
  dispatch()
  return {
    delete: function (id: number) {
      // const index = getIndexFromId(id)
      return clearContact(id)
    },
    focus: function (id: number) {
      return focus(id)
    },
    showOnly: function (id: number) {
      return showOnly(id)
    },
    deleteAll: function () {
      return clearAllContacts()
    },
    getContacts: function () {
      return tabContacts
    },
    addContact: function ({target: {resnum, chainId}, filter}: {target: {resnum: number, chainId: string, [k: string]: any}, filter: string}) {
      return createContact({target: {resnum, chainId}, filter})
    },
    setProperties: function (props: {[k: string]: any}) {
      // const index = getIndexFromId(props.index)
      return setProperties(props.index, props)
    },
    checkContactExists: function (atomSet: BitArray) {
      return checkContactExists(atomSet)
    }
  }
}

export {contact, contactTypesIndices, contactTypesMap}
