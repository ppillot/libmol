import {ColormakerRegistry, Structure, Stage} from 'ngl'
import { ActionContext, Action } from 'vuex'
import axios from 'axios'

interface SequenceElement {
  resname: string,
  resno: number,
  hetero: boolean,
  index: number,
  selected: boolean
}
interface ChainProperties {
  id: number,
  name: string,
  entity: string,
  sequence: SequenceElement[],
  color: string|undefined
}
interface FileObject {
  file: File,
  value: string,
  molId: string,
  molCode: string,
  source: string,
  ext: string
}
interface Hetero {
  resname: string,
  resno: number,
  chainname: string,
  entity: string
}

function getNameFromPubchem (file: FileObject, context: ActionContext<any, any>) {
  axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${file.molId}/synonyms/TXT`).then(
    function({data}: {data: string}) {
      let name = data.split('\n')[0]
      context.commit('setName', name)
      file.value = name
    }
  )
}

function getChainColors (chains: ChainProperties[], structure: Structure) {
  // console.log(structure)
  let chainColors: string[] = []
  var chainNameScheme = ColormakerRegistry.getScheme({scheme: 'chainname', structure: structure})

  chains.forEach(chain => {
    chainColors.push(
      (chainNameScheme.atomColor(
        structure.getAtomProxy(
          structure.getChainProxy(chain.id).atomOffset
        )
      ) | 0).toString(16)
    )
  })
  return chainColors
}

function loadFile (stage: Stage, context: ActionContext<any, any>) {
  function newFile (newFile: FileObject) {
    stage.removeAllComponents()
    let params = {assembly: 'AU'}
    if (newFile.ext) Object.assign(params, {ext: newFile.ext})
    // console.log(newFile)
    return stage.loadFile(newFile.file, params)
    .then((component: any) => { // let's get the structure property from the structureComponent object returned by NGL's promise
      const structure = component.structure as Structure

      // check if PDB file is recent enough to be valid
      if (structure.atomMap.list[0].element.match(/\d/gi) !== null) {
        return Promise.reject({err: 'old', molId: structure.id})
      }
      let molTypes = new Set()
      let chainMap = new Map()
      let chains: ChainProperties[] = []
      let atoms = Object.keys(structure.atomMap.dict).map(val => { return val.substring(0, val.indexOf('|')) })
      let elements = new Set(Object.keys(structure.atomMap.dict).sort()
                                    .map(atomIdentifier =>
                                    atomIdentifier.substr(atomIdentifier.indexOf('|') + 1)
                                    )
      )
      let residues = new Set(Object.keys(structure.residueMap.dict).sort()
                                    .map(residueIdentifier =>
                                    residueIdentifier.substr(0, residueIdentifier.indexOf('|'))
                                    )
      )
      let hetero: Hetero[] = []
      let sstruc = new Set()
      let selected: boolean[] = []

    // in case no value has been provided for the file name, extract it from the title property in structure
      if (newFile.value === '') {
          // this is not pertaining when info comes from pubchem
          if (newFile.source==='pubchem') {
            getNameFromPubchem(newFile, context)
          } else newFile.value = structure.title
      }
      if (structure.id !== '') {
        newFile.molCode = structure.id.trim()
      }

    // let's iterate through each residue from this structure
      structure.eachResidue(item => {
        // Do we have multiple models?
        if (item.modelIndex > 0) {
          return
        }
        // Have we encountered a yet unknown chain.
        if (!chainMap.has(item.chainname)) {
          // let's keep track of the different chains by their given order
          const chainId = chainMap.size
          chainMap.set(item.chainname, chainId)

          // let's set new chain properties based upon first item
          chains.push({
            id: chainId,
            name: item.chainname,
            entity: (item.entity) ? item.entity.description : 'unknown',
            sequence: [],
            color: undefined
          })
        }

        // add a residue corresponding to the item in the chains' respective sequence
        let chainId = chainMap.get(item.chainname)
        chains[chainId].sequence.push({
          resname: item.resname,
          resno: item.resno,
          hetero: item.hetero === 1,
          index: item.index,
          // moleculeType: item.moleculeType,
          selected: true
        })
        if (item.hetero === 1 && item.resname !== 'HOH') {
          hetero.push({
            resname: item.resname,
            resno: item.resno,
            entity: (item.entity) ? item.entity.description : 'unknown',
            chainname: item.chainname
          })
        }
        molTypes.add(item.moleculeType)
        sstruc.add(item.sstruc)
        selected.push(true)
      })

      getChainColors(chains, structure).forEach(
        (color, index) => {
          chains[index].color = color
        }
      )

      const noSequence = (structure.residueStore.count / structure.modelStore.count <= 1)

      component.setSelection('/0')
      component.addRepresentation('ball+stick', {
        multipleBond: (noSequence || context.state.multipleBond) ? 'symmetric' : 'off',
        sele: 'not water',
        aspectRatio: 2.1,
        scale: 1.2
      })
      stage.autoView()

      return Promise.resolve({molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence, component, hetero})
      // context.commit('setMolTypes', )
      // context.commit('selectedChains')
    })
  }

  return newFile
}

export {loadFile}
