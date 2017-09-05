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
        value: decodeURI(tabProp[1]) || true,
        enumerable: true
      })
  })

  if (params.hasOwnProperty('state')) {
    const path = (process.env.NODE_ENV !== 'production') ? 'api/states.php' : 'https://libmol.org/api/states.php'

    window.fetch(path, {
      method: 'POST',
      body: JSON.stringify({
        id: params.state
      })
    })
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.dir(data)
    })
    .catch(function (error) {
      console.log(error)
    })
  }

  if (params.hasOwnProperty('pdb')) {
    params.file = `rcsb://${params.pdb}`
    params.value = ''
  }
  // console.dir(params)
  return params
}

function getStartingParameters () {
  return Object.assign(defaultParameters, getSearchParameters())
}

export default getStartingParameters
