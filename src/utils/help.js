const helpFiles = {
  color: {
    chainname: 'colorBychain',
    element: 'colorByelement',
    residue: 'colorByresidue',
    sstruc: 'colorBysstruc',
    moleculetype: 'colorBynature',
    palette: 'colorPalette'
  },
  display: {
    spacefill: 'displaySpacefill',
    ball_stick: 'displayBallstick',
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
  }
}

function getHelp (action, attribute) {
  return helpFiles[action][attribute]
}

export default getHelp
