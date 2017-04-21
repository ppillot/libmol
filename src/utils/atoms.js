function getAtomProperties (atom) {
  return {
    index: atom.index,
    symbol: atom.element,
    atomname: atom.atomname,
    resname: atom.resname,
    resno: atom.resno,
    chainname: atom.chainname,
    entity: (atom.entity) ? atom.entity.description : 'unknown',
    resType: atom.residueType.moleculeType
  }
}

export { getAtomProperties }
