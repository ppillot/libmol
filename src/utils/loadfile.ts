import { ColormakerRegistry, Selection } from 'ngl'
import { ActionContext } from 'vuex'
import axios from 'axios'
import StructureComponent from 'ngl/declarations/component/structure-component';
import Stage, { StageLoadFileParams } from 'ngl/declarations/stage/stage'
import { Structure } from 'ngl/declarations/ngl';

interface SequenceElement {
  resname: string,
  resno: number,
  hetero: boolean,
  index: number,
  selected: boolean,
  moleculeType: MolType
}
interface ChainProperties {
  id: number,
  name: string,
  entity: string,
  sequence: SequenceElement[],
  color: string|undefined,
  hasDNA: boolean,
  isInReverse?: boolean
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

enum MolType {
  unknown = 0,
  ion = 2,
  water = 1,
  protein = 3,
  rna = 4,
  dna = 5,
  saccharide = 6
}

function getNameFromPubchem (file: FileObject, context: ActionContext<any, any>) {
  axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${file.molId}/synonyms/TXT`).then(
    function ({ data }: {data: string}) {
      let name = data.split('\n')[0]
      context.commit('setName', name)
      file.value = name
    }
  )
}

function optimizeSeqOrder (chains: ChainProperties[], structure: Structure) {
  // filter in only the chains containing dna
  const ch = chains.filter((chain) => chain.hasDNA)

  // Take NFA if only 1 DNA chain or less
  if (ch.length < 2) return;

  // find sections of the sequence containing dna residues
  const dnaSeq = ch.map((c) => {
    return c.sequence.filter((seqEl) => seqEl.moleculeType === MolType.dna)
  })

  const chainMap: {[k: string]: number} = {}
  ch.forEach((c, i) => {
    chainMap[c.name] = i
  })

  // compute the adjacency list between DNA seq assuming the mid residue should be
  // in contact with another chain
  const adjChn: Set<number>[] = []
  dnaSeq.forEach((seq, i) => {
    const mid = (seq.length === 1) ? 0 : seq.length >> 1
    const midRes = seq[mid];
    const selToken = midRes.resno + ':' + ch[i].name + ' and (.N1 or .N3)';
    const sel = new Selection(selToken)
    const aSetWithin = structure.getAtomSetWithinSelection(sel, 4.5)
    const chnSet: Set<number> = new Set()
    aSetWithin.forEach(ix => {
      const atom = structure.getAtomProxy(ix);
      // add to the set of adjacent chains, only the ones that are different
      // from current chain and only if they are dna
      if (atom.chainname !== ch[i].name && atom.isDna()) {
        chnSet.add(chainMap[atom.chainname])
      }
    })
    adjChn[i] = chnSet
  })

  // define pairs of dna sequences when each is adjacent to the other
  const pairs: number[][] = []
  adjChn.forEach((adjList, i) => {
    if (adjList.size > 0) {
      adjList.forEach(chId => {
        if (chId > i) { // avoid double work
          if (adjChn[chId].has(i)) {
            pairs.push([i, chId])
          }
        }
      })
    }
  })

  // estimate if a sequence should be reversed to emphasize complementarity
  const chnSenseMap: Map<number, boolean> = new Map()
  pairs.forEach(pair => {
    const sequences = pair.map(el =>
      dnaSeq[el].map(res => {
        return res.resname[res.resname.length - 1].toUpperCase() // can be A or DA
      }).join('')
    )
    const seqA = sequences[0]
    const seqB = getReverseComplement(sequences[1])

    // easy special case: seqA == seqB
    if (seqA === seqB || areSimilar(seqA, seqB)) {
      reverseOneInPair(pair[0], pair[1], chnSenseMap)
    }
  })

  // reverse the sequences that require it
  chnSenseMap.forEach((sense, i) => {
    if (sense === false) {
      ch[i].sequence = reverseSequence(ch[i].sequence)
      ch[i].isInReverse = true
    }
  })

}

function reverseSequence (seq: SequenceElement[]) {
  // determine lower and upper bounds of the nucleic sequence
  let lowB = -1
  let upB = -1
  let i = 0, imax = seq.length
  for (; i<imax; i++) {
    const mT = seq[i].moleculeType
    // lower bound is first dna residue
    if (lowB === -1 && mT === MolType.dna) {
      lowB = i
      upB = i
    // upper bound is last dna residue
    } else if (upB > -1 && mT === MolType.dna) {
      upB = i
    // no further dna when water section begins (hetero too?)
    } else if (mT === MolType.water) break
  }

  if (lowB === -1 || upB === lowB) return seq

  // slice sequence in 3 parts
  const tailSeq = seq.splice(upB + 1)
  const revSeq = seq.splice(lowB).reverse()
  seq.push(...revSeq, ...tailSeq)
  return seq
}

function areSimilar (seqA: string, seqB: string) {
  let KLENGTH = 3

  // use the smallest sequence
  if (seqB.length < seqA.length) [seqB, seqA] = [seqA, seqB]

  // special case seqA is shorter than k-mer length
  if (seqA.length <= KLENGTH) return seqB.indexOf(seqA) > -1

  // special case seqA is k-mer length + 1
  KLENGTH --

  // common k-mer counting
  let nbCommon = 0
  for (let i = 0; i <= seqA.length - KLENGTH; i++) {
    const kmer = seqA.substring(i, KLENGTH - 1)
    if (seqB.indexOf(kmer) > -1) nbCommon ++
  }

  // allow a 1 nucleotide difference
  if (nbCommon >= seqA.length - KLENGTH) return true
  // allow a likely 10 % difference
  if ((seqA.length - nbCommon)/KLENGTH > seqA.length / 10) return true
  return false

}

function reverseOneInPair (idA: number, idB: number, chnSenseMap: Map<number, boolean>) {
  if (chnSenseMap.has(idA)) {
    chnSenseMap.set(idB, !chnSenseMap.get(idA))
  } else if (chnSenseMap.has(idB)) {
    chnSenseMap.set(idA, !chnSenseMap.get(idB))
  } else { // both senses are undefined
    chnSenseMap.set(idA, true)
    chnSenseMap.set(idB, false)
  }
}

function getReverseComplement (seq: string) {
  let rev = ''
  for (let i = seq.length - 1; i >=0 ; i--){
    switch (seq[i]) {
      case 'A':
        rev += 'T';
        break;
      case 'U':
      case 'T':
        rev += 'A';
        break;
      case 'C':
        rev += 'G';
        break;
      case 'G':
        rev += 'C';
        break;
      default:
        rev += 'X';
    }
  }
  return rev;
}

function getChainColors (chains: ChainProperties[], structure: Structure) {
  // console.log(structure)
  let chainColors: string[] = []
  var chainNameScheme = ColormakerRegistry.getScheme({ scheme: 'chainname', structure: structure })

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
    let params: Partial<StageLoadFileParams> = { assembly: 'AU' }
    if (newFile.ext) params.ext = newFile.ext

    // console.log(newFile)
    return stage.loadFile(newFile.file, params)
      .then((component: StructureComponent) => { // let's get the structure property from the structureComponent object returned by NGL's promise
        const structure = component.structure

        // check if PDB file is recent enough to be valid
        if (structure.atomMap.list[0].element.match(/\d/gi) !== null) {
          return Promise.reject({ err: 'old', molId: structure.id })
        }
        let molTypesSet: Set<MolType>  = new Set()
        let chainMap: Map<string, number> = new Map()
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
        let sstruc: Set<string> = new Set()
        let selected: boolean[] = []

        // in case no value has been provided for the file name, extract it from the title property in structure
        if (newFile.value === '') {
          // this is not pertaining when info comes from pubchem
          if (newFile.source === 'pubchem') {
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
              color: undefined,
              hasDNA: false
            })
          }

          // add a residue corresponding to the item in the chains' respective sequence
          let chainId = chainMap.get(item.chainname)
          chains[chainId].sequence.push({
            resname: item.resname,
            resno: item.resno,
            hetero: item.hetero === 1,
            index: item.index,
            moleculeType: item.moleculeType,
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
          molTypesSet.add(item.moleculeType)
          sstruc.add(item.sstruc)
          selected.push(true)
          if (item.moleculeType === MolType.dna) {
            chains[chainId].hasDNA = true
          }
        })

        getChainColors(chains, structure).forEach(
          (color, index) => {
            chains[index].color = color
          }
        )

        const molTypes = {
          protein: molTypesSet.has(MolType.protein),
          dna: molTypesSet.has(MolType.dna),
          rna: molTypesSet.has(MolType.rna),
          nucleic: molTypesSet.has(MolType.dna) || molTypesSet.has(MolType.rna),
          water: molTypesSet.has(MolType.water),
          saccharide: molTypesSet.has(MolType.saccharide),
          hetero: molTypesSet.has(MolType.unknown) || molTypesSet.has(MolType.ion), // 0: Unknown; 2: Ions
          ion: molTypesSet.has(MolType.ion),
        }

        const noSequence = (structure.residueStore.count / structure.modelStore.count <= 1)

        if (molTypes.dna) optimizeSeqOrder(chains, structure)

        component.setSelection('/0')
        component.addRepresentation('ball+stick', {
          multipleBond: (noSequence || context.state.multipleBond) ? 'symmetric' : 'off',
          sele: 'not water',
          aspectRatio: 2.1,
          scale: 1.2
        })
        stage.autoView()

        return Promise.resolve({ molTypes, chains, atoms, elements, residues, sstruc, selected, noSequence, component, hetero })
      // context.commit('setMolTypes', )
      // context.commit('selectedChains')
      })
  }

  return newFile
}

export { loadFile }
