// from NGL mmtf-parser.js
var sstrucDict = {
  h: 'alphaHelix',
  g: 'threeTenHelix',
  i: 'piHelix',
  e: 'betaStrand',
  b: 'betaStrand', // bridge
  t: 'betaTurn',
  s: 'coil', // bend
  l: 'coil'
}

function getSStrucName (abbrev) {
  var name = sstrucDict[abbrev] || ''
  return name
}

export {
  getSStrucName
}
