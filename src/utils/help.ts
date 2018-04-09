const helpFiles: {[index: string] : {[index: string]: string}} = {
  color: {
    chainname: 'colorBychain',
    element: 'colorByelement',
    resname: 'colorByresidue',
    sstruc: 'colorBysstruc',
    moleculetype: 'colorBynature',
    palette: 'colorPalette'
  },
  display: {
    spacefill: 'displaySpacefill',
    'ball+stick': 'displayBallstick',
    licorice: 'displayStick',
    cartoon: 'displayCartoon',
    backbone: 'displayBackbone',
    hide: 'hide'
  },
  select: {
    all: 'selectAll',
    protein: 'selectProtein',
    nucleic: 'selectNucleic',
    saccharide: 'selectSaccharide',
    water: 'selectWater',
    hetero: 'selectHetero',
    'command-line': 'selectCommandLine'
  },
  lexicon: {
    aminoacid: 'lexiconAminoacid',
    autre: 'lexiconAutre',
    coude: 'lexiconCoude',
    cpk: 'lexiconCpk',
    feuillet: 'lexiconFeuillet',
    helice: 'lexiconHelice',
    ligand: 'lexiconLigand',
    nucleic: 'lexiconNucleic',
    nucleotide: 'lexiconNucleotide',
    protein: 'lexiconProtein',
    technique: 'lexiconTechnique'
  },
  contacts: {
    hbond: 'contactsHbond',
    saltbridge: 'contactsSaltbridge',
    metal: 'contactsMetal',
    hydrophobic: 'contactsHydrophobic',
    pi: 'contactsPi'
  }
}

/**
 * Get the help key corresponding with the UI action
 * @param action token describing the general subject related to user action (select, color,...)
 * @param attribute token related to the command for which help is seeked
 * @returns key for help page
 */
function getHelp (action: string, attribute: string): string | undefined {
  return (action !== undefined) ? helpFiles[action][attribute] : undefined
}

interface helpSubject {
  token: string | undefined
  active: boolean
}

/**
 * 
 * @param token kebab case key for helpsubject
 * @return helpSubject object if found, null otherwise
 */
function getHelpSubject (token: string): helpSubject | null {
  const reg = /^#(\w+)-(\w+)$/ // internal links are based on the hash #action-attribute
  if (reg.test(token)) {
    const results = reg.exec(token)
    const subject:helpSubject = {
      token: getHelp(results![1], results![2]),
      active: true
    }
    return subject
  } else {
    return null
  }
}

export { getHelp, getHelpSubject }
