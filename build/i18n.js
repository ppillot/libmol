const fs = require('fs')
const https = require('node:https')
const escapeQuotes = require('escape-quotes')

const SHEET_ID = '1tfpNe1SwHQ51arbPlnE6y7rDB-JKImhGICQGsMzQtes'
const I18N_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
const NODE_OPEN = 'node_open'

https.get(I18N_URL, (res) => {
  const data = []

  res.on('data', (d) => {
    data.push(d)
  })

  res.on('end', () => {
    const lines = Buffer.concat(data).toString().split('\n')
    if (lines.length === 0) {
      console.log('No data found.')
      return
    }

    // CSV, cells are between quotes, no space between comma and quotes
    // Here, remove first and last quote in line, then split along the separator
    const rows = lines.map((row) => row.substring(1, row.length - 1).split('","'))

    // HEADER
    // first value is key, skip first col
    const locales = rows[0].filter((item, itemNum) => { return itemNum > 0 })
    // console.log(locales)
    writeLocales(locales)

    // BODY
    for (let localeNum = 0; localeNum < locales.length; localeNum++) {
      let level = -1
      let s = '{'
      let previousToken = NODE_OPEN
      for (let i = 1; i < rows.length; i++) {
        let cells = rows[i]
        // console.log(row)

        // Is it a key declaration?
        if (cells[0][0] === '>' &&
          cells.slice(1).every((v) => !v)
        ) {
          // guess level of key
          let l = 0
          while (cells[0][l] === '>') {
            l++
          }
          l--

          const keyName = cells[0].substring(l + 1)

          if (l === level) { // new sibling
            s += '},'
            s += '"' + keyName + '":{'
            previousToken = NODE_OPEN
          } else if (l < level) { // new parent
            for (let j = 0; j <= level - l; j++) {
              s += '}'
            }
            s += ',"' + keyName + '":{'
            previousToken = NODE_OPEN
          } else { // new child
            s += (previousToken === NODE_OPEN)
              ? '"' + keyName + '":{'
              : ',"' + keyName + '":{'
            previousToken = NODE_OPEN
          }
          level = l
        } else { // new item
          if (previousToken !== NODE_OPEN) {
            s += ','
          }
          s += '"' + cells[0] + '":"' + escapeQuotes(cells[localeNum + 1].replace("\\'", "'"), '"', '\\') + '"'
          previousToken = 'item'
        }
      }
      for (let i = 0; i <= level + 1; i++) {
        s += '}'
      }
      console.log(s)
      let jsonLocale = JSON.parse(s)
      const result = JSON.stringify(addHelp(jsonLocale, locales[localeNum]))
      writeJSON(result, locales[localeNum])
    }
  })
})

function addHelp (json, locale) {
  const content = fs.readFileSync('./src/locales/' + locale + '/help.' + locale + '.json', 'utf8')
  const helpJson = JSON.parse(content)
  json['help'] = helpJson
  return json
}

function writeJSON (s, name) {
  const fileName = name + '.json'
  const destPath = './src/locales/bundles/' + fileName

  fs.writeFile(destPath, s, function (err) {
    if (err) {
      console.log('error in locale:' + name, s)
      throw err
    }
    console.log('Locale ' + destPath + ' created')
  })
}

function writeLocales (locales) {
  let s = `export const locales = ${JSON.stringify(locales).replace(/"/gi, "'").replace(/,/gi, ', ')}`
  s += '\n'

  fs.writeFile('./src/locales/locales.js', s, function (err) {
    if (err) {
      console.log('error in writing locales names')
      throw err
    }
    console.log('locales.js created')
  })
}
