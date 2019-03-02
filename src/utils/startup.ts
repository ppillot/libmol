/**
 * define default settings at starting up
 */
interface StartupParameters {
  file?: string,
  value?: string,
  source?: string,
  molId?: string,
  ext?: string,
  pdb?: string,
  pubchem?: string,
  libmol?: string
  embedded?: boolean
}

let defaultParameters: StartupParameters = {
  file: 'static/mol/1BKV-collagene.mmtf.gz',
  value: 'Collagene',
  source: 'libmol',
  molId: '63',
  embedded: false
}

/**
 * transform the search part of the URL in a JSON
 *
 * @returns object
 */
function getSearchParameters () {
  const search = document.location.search.substr(1)
  let params: StartupParameters = {}

  const tabParams = search.split('&')
  tabParams.forEach(val => {
    let tabProp = val.split('=')
    Object.defineProperty(
      params,
      tabProp[0],
      {
        value: tabProp[1] || true,
        enumerable: true
      })
  })

  if (params.hasOwnProperty('pdb')) {
    if (params.pdb!.length === 4) {
      params.file = `rcsb://${params.pdb}`
      params.value = ''
      params.source = 'pdb'
      params.molId = params.pdb
    } else if (params.pdb!.length < 4 && params.pdb!.length > 0) {
      params.file = `https://files.rcsb.org/ligands/view/${params.pdb}.cif`
      params.value = ''
      params.source = 'pdb ligand'
      params.molId = params.pdb
    }
  }

  if (params.hasOwnProperty('pubchem')) {
    params.file = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${params.pubchem}/record/SDF/?record_type=3d&response_type=save&response_basename=Structure3D_CID_${params.pubchem}`
    params.value = ''
    params.ext = 'mol'
    params.source = 'pubchem'
    params.molId = params.pubchem
  }

  if (params.hasOwnProperty('libmol')) {
    params.file = `https://libmol.org/api/download.php?id=${params.pubchem}`
    params.value = ''
    params.ext = 'pdb'
    params.source = 'libmol'
    params.molId = params.libmol
  }
  // console.dir(params)
  return params
}

function getStartingParameters () {
  return Object.assign(defaultParameters, getSearchParameters())
}

export default getStartingParameters
