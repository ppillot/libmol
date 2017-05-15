// from NGL documentation
let keywords = [
  'and',
  'or',
  'not',
  'all',
  'sidechain',
  'sidechainAttached',
  'backbone',
  'protein',
  'nucleic',
  'rna',
  'dna',
  'hetero',
  'ion',
  'saccharide',
  'sugar',
  'polymer',
  'water',
  // 'hydrogen',
  'helix',
  'sheet',
  'turn',
  'small',
  'nucleophilic',
  'hydrophobic',
  'aromatic',
  'amid',
  'acidic',
  'basic',
  'charged',
  'polar',
  'nonpolar'
]

function filter (array, word, startIndex = 0) {
  let filteredArray = []
  let w = word.toUpperCase()

  array.forEach(function (val) {
    let u = val.toUpperCase()
    if (u.indexOf(w) === startIndex) {
      filteredArray.push(val)
    }
  })

  return filteredArray
}

function suggestion () {
  let suggestionsList = []
  let suggestionsSize = 0
  let suggestionsIndexes = []

  function empty () {
    suggestionsList = []
    suggestionsSize = 0
  }

  function add (category, list, word, startIndex = 0) {
    if (category === 'keyword') list = keywords
    let newSuggestions = filter(list, word, startIndex)

    if (newSuggestions.length > 0) {
      suggestionsList.push({
        category: category,
        content: newSuggestions.map((val, index) => {
          return {
            word: val,
            index: index + suggestionsSize
          }
        })
      })
      suggestionsSize += newSuggestions.length
      suggestionsIndexes = suggestionsIndexes.concat(newSuggestions)
    }
  }

  function get () {
    return suggestionsList
  }

  function getByIndex (index) {
    return suggestionsIndexes[index]
  }

  return {
    empty: empty,
    add: add,
    get: get,
    getByIndex: getByIndex
  }
}

export default suggestion
