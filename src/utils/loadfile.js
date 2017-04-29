import {ColormakerRegistry} from 'ngl'

function getChainColors (chains, structure) {
  // console.log(structure)
  var chainColors = []
  var chainNameScheme = ColormakerRegistry.getScheme({scheme: 'chainname', structure: structure})

  chains.forEach(chain => {
    chainColors.push(
      chainNameScheme.atomColor(
        structure.getAtomProxy(
          structure.getChainProxy(chain.id).atomOffset
        )
      ).toString(16)
    )
  })
  return chainColors
}

function loadFile (stage) {
  function newFile (newFile) {
    stage.removeAllComponents()
    return stage.loadFile(newFile.file, {assembly: 'AU'})
    .then((component) => { // let's get the structure property from the structureComponent object returned by NGL's promise
      const structure = component.structure

      let molTypes = new Set()
      let chainMap = new Map()
      let chains = []
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
      let sstruc = new Set()
      let selected = []

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
          hetero: item.hetero,
          index: item.index,
          // moleculeType: item.moleculeType,
          selected: true
        })
        molTypes.add(item.moleculeType)
        sstruc.add(item.sstruc)
        selected.push(true)
      })

      getChainColors(chains, structure).forEach(
        (color, index) => {
          chains[index].color = color
        }
    )

      let noSequence = (structure.residueStore.count / structure.modelStore.count <= 1)

      component.setSelection('/0')
      component.addRepresentation('ball+stick', {multipleBond: (noSequence) ? 'symmetric' : 'off'})
      stage.autoView()

      return Promise.resolve({molTypes, chains, elements, residues, sstruc, selected, noSequence, component})
      // context.commit('setMolTypes', )
      // context.commit('selectedChains')
    })
  }

  return newFile
}

export {loadFile}
