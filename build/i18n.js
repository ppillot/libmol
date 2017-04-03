var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var escapeQuotes = require('escape-quotes')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.
  authorize(JSON.parse(content), buildI18N);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function buildI18N(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1tfpNe1SwHQ51arbPlnE6y7rDB-JKImhGICQGsMzQtes',
    range: 'Sheet1',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      //first value is key
      const locales = rows[0].filter((item, itemNum) => {return itemNum>0} )
      console.log(locales)
      for (let localeNum=0; localeNum< locales.length; localeNum++) {
        let level = -1
        let s = '{'
        let previousToken = 'nodeOpening'
        for (let i = 1; i < rows.length; i++) {
          let row = rows[i];
          console.log(row);
          
          if (row.length === 1) { //key name
            //guess level
            const l = row[0]
              .split('')
              .reduce((acc,index) => {
                return acc + (index == ">")
              }, 0) - 1
            
              const keyName = row[0].slice(l+1)

            if (l === level) {//new sibling
              s += '},'
              s += '"' + keyName + '":{'
              previousToken = 'nodeOpening'
            } else if (l<level) { //new parent
              for (let j=0; j<= level-l; j++) {
                s += '}'
              }
              s += ',"' + keyName + '":{' 
              previousToken = 'nodeOpening'
            } else { // new child
              s += (previousToken === 'nodeOpening') 
                ? '"' + keyName + '":{'
                : ',"' + keyName + '":{'
                previousToken = 'nodeOpening'
            }
            level = l
          } else { //new item
            if (previousToken!=='nodeOpening') {
              s += ','
            }
            s += '"' + row[0] + '":"' + escapeQuotes(row[localeNum+1].replace("\\'","'"),'"','\\') + '"'
            previousToken = 'item'
          }
        }
        for (let i = 0; i <= level +1; i++) {
          s += '}'
        }
        console.log(s)
        let test = JSON.parse(s)
        writeJSON(s, locales[localeNum])
      }
    }
  });
}

function writeJSON(s,name) {
  const fileName = name + '.json'
  const destPath = '../src/locales/' + fileName

  fs.writeFile(destPath, s, function(err) {
    if (err) {
      throw err
    }
    console.log('error in locale:' +name, s)
  })
}