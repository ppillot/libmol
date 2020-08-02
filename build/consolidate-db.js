const fs = require('fs')
const readline = require('readline')
const { google } = require('googleapis')
// const googleAuth = require('google-auth-library')
const escapeQuotes = require('escape-quotes')
const https = require('https')
const sqlite3 = require('sqlite3').verbose()
const chalk = require('chalk')

const removeAccents = require('remove-accents-diacritics')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/'
const TOKEN_PATH = 'tocken.json'

// Load client secrets from a local file.
fs.readFile('./build/credentials.json', (err, content) => {
  if (err) {
    console.log('Error loading client secret file: ' + err)
    return
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), consolidateDB)
})

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (credentials, callback) {
  var clientSecret = credentials.installed.client_secret
  var clientId = credentials.installed.client_id
  var redirectUrl = credentials.installed.redirect_uris[0]
  var oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl)

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback)
    } else {
      oauth2Client.credentials = JSON.parse(token)
      callback(oauth2Client)
    }
  })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken (oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close()
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err)
        return
      }
      oauth2Client.credentials = token
      storeToken(token)
      callback(oauth2Client)
    })
  })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken (token) {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token))
  console.log('Token stored to ' + TOKEN_PATH)
}

function getFileProperties (file, type, idsource) {
  let fileName = ''
  let destPath = ''
  let source = ''
  let dest = ''

  switch (type) {
    case 'mmtf':
      fileName = `${idsource}-${file}.mmtf.gz`
      destPath = 'public/static/mol/'
      source = `https://mmtf.rcsb.org/v1.0/full/${idsource}.mmtf.gz`
      dest = destPath + fileName
      break
    case 'cif pdb':
      fileName = `${idsource}-${file}.cif.gz`
      destPath = 'public/static/mol/'
      source = `https://files.rcsb.org/ligands/view/${idsource}.cif`
      dest = destPath + fileName
      break
    case 'cid sdf':
      fileName = `${idsource}-${file}.sdf.gz`
      destPath = 'public/static/mol/'
      source = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${idsource}/record/SDF/?record_type=3d&response_type=save&response_basename=Structure3D_CID_${idsource}`
      dest = destPath + fileName
      break
    default:
      fileName = `${file}.pdb.gz`
      destPath = 'public/static/mol/pdb/'
      source = type
      dest = destPath + fileName
  }
  return {
    fileName: fileName,
    dest: dest,
    source: source
  }
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function consolidateDB (auth) {
  var sheets = google.sheets({ version: 'v4', auth })
  sheets.spreadsheets.values.get({
    spreadsheetId: '1uFoPLUlY73jpNubX0Z6F-Kyowrv3_GqT8TfrCWQ5H9g',
    range: 'out'
  }, function (err, response) {
    if (err) {
      console.log('The API returned an error: ' + err)
      return
    }

    var rows = response.data.values
    console.log(process.cwd())
    var db = new sqlite3.Database('src/api/libmol.sqlite')
    if (!rows.length) {
      console.log('No data found.')
    } else {
      let tabFiles = []

      // loop through google spreadsheet rows
      rows.forEach((row, index) => {
        if (index === 0) return // columns names
        if (row[0] !== '') {
          // get record from sqlite and compare
          db.get('SELECT * FROM molecule WHERE id = ?', [row[0]],
            (err, record) => {
              if (err) {
                console.log(err)
              } else if (record === undefined) {
                console.log('missing id in database: ' + row[0])
              } else {
                // check if records are identical, if not then update sqlite from google sheet

                // model source
                if (record.SOURCE !== row[1]) {
                  db.run('UPDATE molecule SET source = ? WHERE id=' + row[0],
                    [row[1]], (err, success) => {
                      if (err) {
                        console.log('Problem occured at ', row, '\n', err)
                      } else {
                        console.log('Succesfully updated SOURCE for id:' + row[0])
                      }
                    }
                  )
                }

                // model idsource
                if (record.IDSOURCE + '' !== '' + row[2]) {
                  db.run('UPDATE molecule SET idsource = ? WHERE id=' + row[0],
                    [row[2]], (err, success) => {
                      if (err) {
                        console.log('Problem occured at ', row, '\n', err)
                      } else {
                        console.log('Succesfully updated IDSOURCE for id:' + row[0])
                        console.log(record.IDSOURCE, row[2])
                      }
                    }
                  )
                }

                // model modification
                if (record.MODIFICATION !== row[3]) {
                  db.run('UPDATE molecule SET modification = ? WHERE id=' + row[0],
                    [row[3]], (err, success) => {
                      if (err) {
                        console.log('Problem occured at ', row, '\n', err)
                      } else {
                        console.log('Succesfully updated MODIFICATION for id:' + row[0])
                      }
                    }
                  )
                }

                // model title
                if (record.TITRE !== row[4]) {
                  db.run('UPDATE molecule SET TITRE = ? WHERE id=' + row[0],
                    [row[4]], (err, success) => {
                      if (err) {
                        console.log('Problem occured at ', row, '\n', err)
                      } else {
                        console.log('Succesfully updated TITRE for id:' + row[0])
                      }
                    }
                  )
                }

                // check wether description has no html tags or no html entities
                const htmlTagRe = /<\/?[\w\s="/.':;#-]+>/gi
                const htmlEncodedEntities = /&#?[a-z0-9]+;/gi
                if (htmlTagRe.test(record.DESCRIPTION) || htmlEncodedEntities.test(record.DESCRIPTION)) {
                  let txt = record.DESCRIPTION
                  txt = txt.replace(htmlTagRe, '').trim()
                  txt = entities.decode(txt)
                  db.run('UPDATE molecule SET DESCRIPTION = ? WHERE id=' + row[0],
                    [txt], (err, success) => {
                      if (err) {
                        console.log('Problem occured at ', row, '\n', err)
                      } else {
                        console.log('Succesfully updated DESCRIPTION for id:' + row[0])
                      }
                    }
                  )
                }

                // create a search index without accented characters
                const accentedCharacters = /[\u00C0-\u017F]+/gi
                if (accentedCharacters.test(record.FTINDEX)) {
                  const txt = removeAccents.remove(record.FTINDEX)
                  db.run('UPDATE molecule SET FTINDEX = ? WHERE id=' + row[0],
                    [txt], (err, success) => {
                      if (err) {
                        console.log('Problem occured at ', row, '\n', err)
                      } else {
                        console.log('Succesfully updated FTINDEX for id:' + row[0])
                      }
                    }
                  )
                }

                // check if the file is here, and eventually requires compression
                const file = getFileProperties(row[5], row[6], row[2])
                fs.access(file.dest, fs.constants.F_OK, (err) => {
                  if (err) {
                    console.log(chalk.red(file.dest + ' from ' + file.source + ' does not exist'))
                    download(file.source, file.dest)
                  } else {
                    console.log(chalk.green('OK ' + file.fileName))
                    tabFiles.push(file.dest)
                    if (tabFiles.length === rows.length - 1) {
                      cleanFiles(tabFiles)
                      dumpDB(db)
                    }
                  }
                })
              }
            }
          )
        } else { // new record for the sqlite DB
          const file = getFileProperties(row[5], row[6], row[2])
          db.run(`INSERT INTO molecule (SOURCE, IDSOURCE, MODIFICATION, TITRE, FICHIER, DESCRIPTION, FTINDEX )
            VALUES ($source, $idsource, $modification, $titre, $fichier, $description, $ftindex)`, {
            $source: row[1],
            $idsource: row[2],
            $modification: row[3],
            $titre: row[4],
            $fichier: file.fileName,
            $description: row[8],
            $ftindex: removeAccents.remove(row[8])
          }, function (err) {
            if (err) {
              console.log('Problem occured at ', row, '\n', err)
            } else {
              console.log('Succesfully inserted: #' + index + ' at index ' + this.lastID)
            }
          }
          )
          if (file.source !== '') {
            download(file.source, file.dest, callBack.apply(file))
          }
        }
      })
      // db.close()
    }
  })
}

var download = function (url, dest, cb) {
  var file = fs.createWriteStream(dest)
  https.get(url, function (response) {
    if (response.statusCode !== 200) {
      console.log(chalk.red(`Upstream file ${url} not found`))
      fs.unlink(dest) // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message)
      return
    }

    response.pipe(file)
    file.on('finish', function () {
      file.close(cb) // close() is async, call cb after close completes.
    })
  }).on('error', function (err) { // Handle errors
    fs.unlink(dest) // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message)
  })
}

function dumpDB (db) {
  console.log(chalk.yellow('Dump of DB in molecule.json'))
  dump = []
  db.all('SELECT * FROM molecule', [],
    (err, rows) => {
      if (err) throw err
      dump = rows.map(row => {
        return {
          FICHIER: row.FICHIER,
          ID: row.ID,
          TITRE: row.TITRE
          // FTINDEX: row.FTINDEX
        }
      })
      fs.writeFile('./public/static/datastore/molecule.json', JSON.stringify(dump), 'utf8', (err) => {
        if (err) throw err
        console.log(chalk.green('Export database to molecule.json'))
      })
    }
  )
}

function callBack (message) {
  console.log(this.fileName, message)
}

function cleanFiles (fileList) {
  console.log(chalk.yellow('Cleaning files...'))
  let path = 'public/static/mol/'
  let nbRem = 0
  fs.readdir(path, (err, files) => {
    if (err) return console.error(err)
    // console.log(chalk.blue(fileList.join('\n')))
    files.forEach(file => {
      if (file[0] === '.') return
      if (file.indexOf('.') === -1) return // might be a folder
      let fn = path + file

      // special case: cif, sdf & pdb file also exist in non gz version
      // for automoatic brotli compression by OVH servers
      const txtExtPos = fn.lastIndexOf('.txt')
      if (txtExtPos > -1) fn = fn.substring(0, txtExtPos - 1)

      if (fileList.indexOf(fn) === -1) {
        console.log(file + ' should be removed')
        fs.unlink(path + file, (err) => {
          if (err) throw err
          console.log(chalk.yellow(++nbRem + ' files deleted'))
        })
      }
    })
  })
  path2 = 'public/static/mol/pdb/'
  fs.readdir(path2, (err, files) => {
    if (err) return console.error(err)
    // console.log(chalk.blue(fileList.join('\n')))
    files.forEach(file => {
      if (file[0] === '.') return
      if (file.indexOf('.') === -1) return // might be a folder
      if (fileList.indexOf(path2 + file) === -1) {
        console.log(file + ' should be removed')
        fs.unlink(path2 + file, (err) => {
          if (err) throw err
          console.log(chalk.yellow(++nbRem + ' files deleted'))
        })
      }
    })
  })
}
