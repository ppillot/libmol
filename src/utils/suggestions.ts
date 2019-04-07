// from NGL documentation
let keywords = [
  'and',
  'or',
  'not',
  'all',
  'none',
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
  'metal',
  'amid',
  'acidic',
  'basic',
  'charged',
  'polar',
  'nonpolar',
  'cyclic',
  'aliphatic'
]

function filter (array: string[], word: string, startIndex = 0): string[] {
  let filteredArray: string[] = []
  let w = word.toUpperCase()

  array.forEach(function (val) {
    let u = val.toUpperCase()
    if (u.indexOf(w) === startIndex) {
      filteredArray.push(val)
    }
  })

  return filteredArray
}

interface Suggestion {
  category: string,
  content: {
    word: string,
    index: number
  }[]
}

function suggestion () {
  let suggestionsList: Suggestion[] = []
  let suggestionsSize = 0
  let suggestionsIndexes: string[] = []

  function empty () {
    suggestionsList = []
    suggestionsSize = 0
  }

  function add (category: string, list: string[], word: string, startIndex = 0) {
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

  function getByIndex (index: number) {
    return suggestionsIndexes[index]
  }

  return {
    empty,
    add,
    get,
    getByIndex
  }
}

export default suggestion
