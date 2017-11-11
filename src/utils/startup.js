/**
 * define default settings at starting up
 */

let defaultParameters = {
  file: 'rcsb://1crn',
  value: 'Crambin',
  embedded: false
}
/**
 * transform the search part of the URL in a JSON
 *
 * @returns object
 */
function getSearchParameters () {
  const search = document.location.search.substr(1)
  let params = {}

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
    switch (params.pdb.length) {
      case 4:
        params.file = `rcsb://${params.pdb}`
        params.value = ''
        break
      case 3:
        params.file = `http://files.rcsb.org/ligands/view/${params.pdb}.cif`
        params.value = ''
        break
    }
  }
  // console.dir(params)
  return params
}

function getStartingParameters () {
  return Object.assign(defaultParameters, getSearchParameters())
}

export default getStartingParameters
