import AtomProxy from 'ngl/declarations/proxy/atom-proxy'

export interface AtomProperties {
  index: number,
  serial: number,
  symbol: string,
  atomname: string,
  resname: string,
  resno: number,
  chainname: string,
  entity: string,
  resType: number
}

function getAtomProperties (atom: AtomProxy): AtomProperties {
  return {
    index: atom.index,
    serial: atom.serial,
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
