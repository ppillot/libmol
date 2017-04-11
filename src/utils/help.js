const helpFiles = {
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
    hetero: 'selectHetero'
  },
  lexicon: {
    protein: 'lexiconProtein'
  }
}

function getHelp (action, attribute) {
  return (action !== undefined) ? helpFiles[action][attribute] : undefined
}

export default getHelp
