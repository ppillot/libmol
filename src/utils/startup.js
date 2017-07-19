/**
 * define default settings at starting up
 */

let defaultParameters = {
  file: 'rcsb://1crn',
  value: 'Crambin'
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
        value: tabProp[1] || true
      })
  })

  if (params.hasOwnProperty('pdb')) {
    params.file = `rcsb://${params.pdb}`
    params.value = ''
  }
  console.dir(params)
  return params
}

function getStartingParameters () {
  return Object.assign(defaultParameters, getSearchParameters())
}

export default getStartingParameters
