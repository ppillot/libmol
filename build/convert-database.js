let converter = require('sqlite-to-nedb');
let dbLocation = 'src/api/libmol.sqlite';    // location of your sqlite file
let nedbFolder = 'src/api/datastore';         // destination folder where your files have to be save, defaults to "."
let ext = '.ne';                        // extension of your nedb files, defaults to ".nedb"

// three ways to use the module:
converter(dbLocation, nedbFolder)
