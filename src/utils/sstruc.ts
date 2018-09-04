// from NGL mmtf-parser.js
const sstrucDict: {[k: string]: string} = {
  h: 'alphaHelix',
  g: 'threeTenHelix',
  i: 'piHelix',
  e: 'betaStrand',
  b: 'betaStrand', // bridge
  t: 'betaTurn',
  s: 'coil', // bend
  l: 'coil'
}

function getSStrucName (abbrev: string) {
  return sstrucDict[abbrev] || ''
}

export {
  getSStrucName
}
