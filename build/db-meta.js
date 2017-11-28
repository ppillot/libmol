var fs = require('fs');
var sqlite3 = require('sqlite3').verbose()
var axios = require('axios')
var jsdom = require('jsdom')

const { JSDOM } = jsdom

function getDescriptionFromPDB (pdbCode) {
  return axios.get('http://www.rcsb.org/pdb/rest/describePDB', {
    params: {
      structureId: pdbCode
    }
  }).then(function ({data}) {
    /* global DOMParser */
    const xmlDocument = (new JSDOM (data, {
      contentType: 'application/xml'
    })).window.document
    const pdbNode = xmlDocument.getElementsByTagName('PDB')[0]
    // console.log(pdbNode)
    let response = {
      source: 'pdb',
      structureId: pdbNode.getAttribute('structureId'),
      title: pdbNode.getAttribute('title'),
      pubmedId: pdbNode.getAttribute('pubmedId'),
      structure_authors: pdbNode.getAttribute('structure_authors'),
      citation_authors: pdbNode.getAttribute('citation_authors')
    }
    // console.log(response)
    return Promise.resolve(response)
  })
}

function getSelectorContent (doc, sel) {
  return (doc.querySelector(sel) === null) ? '' : doc.querySelector(sel).textContent
}

function getAbstractFromPubmed (pubmedId) {
  return axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi', {
    params: {
      db: 'pubmed',
      id: pubmedId,
      retmode: 'xml',
      rettype: 'abstract'
    }
  }).then(function ({data}) {
    const xmlDocument = (new JSDOM (data, {
      contentType: 'application/xml'
    })).window.document
    // const root = xmlDocument.getElementsByTagName('PubmedArticle')[0]
    // debugger
    let response = {
      pubmedId: pubmedId,
      pmc: getSelectorContent(xmlDocument, 'ArticleId[IdType="pmc"]'),
      doi: getSelectorContent(xmlDocument, 'ArticleId[IdType="doi"]'),
      articleTitle: getSelectorContent(xmlDocument, 'ArticleTitle'),
      volume: getSelectorContent(xmlDocument, 'Volume'),
      journal: getSelectorContent(xmlDocument, 'Title'),
      pages: getSelectorContent(xmlDocument, 'MedlinePgn'),
      year: getSelectorContent(xmlDocument, 'PubDate > Year'),
      month: getSelectorContent(xmlDocument, 'PubDate > Month'),
      day: getSelectorContent(xmlDocument, 'PubDate > Day'),
      abstract: getSelectorContent(xmlDocument, 'AbstractText')
    }
    // console.log(response)
    return Promise.resolve( response )
  })
}


/***********************************************
 *                 Code starts here
 ***********************************************/
var db = new sqlite3.Database('src/api/libmol.sqlite')
db.each('SELECT id, source, modification, idsource, meta FROM molecule WHERE meta IS NULL', (err, row) => {
  if (row.SOURCE === 'PDB' && row.IDSOURCE.length === 4) {
    console.log(row.IDSOURCE)
    let meta = {
      source: 'pdb',
      modifications: (row.MODIFICATION.length > 0) ? row.MODIFICATION : ''
    }

    const d = getDescriptionFromPDB(row.IDSOURCE)
    .then(description => {
      Object.assign(meta, description)
      return new Promise( (resolve, reject) => {
        if (description.pubmedId) {
          // console.log(description.pubmedId)
          const pubmed = getAbstractFromPubmed(description.pubmedId)
          .then (pubmed => {
            // console.log('coucou', description, pubmed)
            Object.assign(meta, pubmed)
            console.log(meta)
            resolve( meta )
          })
        } else {
          resolve( meta )
        }
      })
    })
    .then(description => {
      console.log(description)
      db.run('UPDATE molecule SET meta = ? WHERE id = ?', [
        JSON.stringify(description),
        row.ID
      ], (err, success) => {
        if (err) {
          console.log('Problem occured at ', row, '\n', err)
        } else {
          console.log('Succesfully updated:' + this)
        }
      })
    })
  }
}, (err, nbRows) => {
  console.log(nbRows, ' rows affected')
  // db.close()
})


