var fs = require('fs')
var sqlite3 = require('sqlite3').verbose()
var axios = require('axios')
var jsdom = require('jsdom')

const { JSDOM } = jsdom

function getDescriptionFromPDB (pdbCode) {
  return axios.get('http://www.rcsb.org/pdb/rest/describePDB', {
    params: {
      structureId: pdbCode
    }
  }).then(function ({ data }) {
    /* global DOMParser */
    const xmlDocument = (new JSDOM(data, {
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

function getDescriptionFromPDBHet (hetCode) {
  return axios.get('http://www.rcsb.org/pdb/rest/describeHet', {
    params: {
      chemicalID: hetCode
    }
  }).then(function ({ data }) {
    /* global DOMParser */
    const xmlDocument = (new JSDOM(data, {
      contentType: 'application/xml'
    })).window.document
    const ligandNode = xmlDocument.getElementsByTagName('ligand')[0]
    // console.log(pdbNode)
    let response = {
      source: 'pdb ligand',
      structureId: ligandNode.getAttribute('chemicalID'),
      title: getSelectorContent(xmlDocument, 'chemicalName'),
      InChIKey: getSelectorContent(xmlDocument, 'InChIKey'),
      // static generic values for all ligands
      pubmedId: '25428375',
      pmc: '4383988',
      citation_authors: 'Rose PW, Prlić A, Bi C, Bluhm WF, Christie CH, Dutta S, Green RK, Goodsell DS, Westbrook JD, Woo J, Young J, Zardecki C, Berman HM, Bourne PE, Burley SK',
      year: '2015',
      month: '1',
      articleTitle: 'The RCSB Protein Data Bank: views of structural biology for basic and applied research and education',
      journal: 'Nucleic Acids Research',
      volume: '43',
      pages: '345-56',
      doi: '10.1093/nar/gku1214'
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
  }).then(function ({ data }) {
    const xmlDocument = (new JSDOM(data, {
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
    return Promise.resolve(response)
  })
}

/***********************************************
 *                 Code starts here
 ***********************************************/
var db = new sqlite3.Database('src/api/libmol.sqlite')
db.each('SELECT id, source, modification, idsource, meta FROM molecule WHERE meta IS NULL', (err, row) => {
  if (err) {
    console.log(err)
    return
  }

  if (row.SOURCE === 'PDB' && row.IDSOURCE.length === 4) {
    console.log(row.IDSOURCE)
    let meta = {
      source: 'pdb',
      modifications: (row.MODIFICATION.length > 0) ? row.MODIFICATION : ''
    }

    getDescriptionFromPDB(row.IDSOURCE)
      .then(description => {
        Object.assign(meta, description)
        return new Promise((resolve, reject) => {
          if (description.pubmedId) {
          // console.log(description.pubmedId)
            getAbstractFromPubmed(description.pubmedId)
              .then(pubmed => {
                // console.log('coucou', description, pubmed)
                Object.assign(meta, pubmed)
                console.log(meta)
                resolve(meta)
              })
          } else {
            resolve(meta)
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
  } else if (row.SOURCE === 'PDB' && row.IDSOURCE.toString().length <= 3) {
    // pdb ligand - we just cite the PDB
    let meta = {
      source: 'pdb ligand'
    }

    getDescriptionFromPDBHet(row.IDSOURCE.toString())
      .then(description => {
        Object.assign(description, meta)
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
  } else if (row.SOURCE === 'vmmm') {
    let description = {
      source: 'vmmm',
      citation_authors: 'Barak P., E.A. Nater',
      articleTitle: 'The Virtual Museum of Minerals and Molecules',
      journal: 'online resource',
      year: '1997-201x',
      url: 'http://virtual-museum.soils.wisc.edu'
    }
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
  } else if (row.SOURCE === 'pubchem') {
    // pubchem, we just cite the pubchem database and link to the url
    let description = {
      source: 'pubchem',
      citation_authors: 'Kim S, Thiessen PA, Bolton EE, Chen J, Fu G, Gindulyte A, Han L, He J, He S, Shoemaker BA, Wang J, Yu B, Zhang J, Bryant SH',
      articleTitle: 'PubChem Substance and Compound databases',
      journal: 'Nucleic Acids Research',
      year: '2016',
      month: '1',
      day: '4',
      volume: '44(D1)',
      pages: '1202-13',
      pubmedId: '26400175',
      pmc: '4702940',
      doi: '10.1093/nar/gkv951',
      pubchemCID: row.IDSOURCE
    }

    db.run('UPDATE molecule SET meta = ? WHERE id = ?', [
      JSON.stringify(description),
      row.ID
    ], (err, success) => {
      if (err) {
        console.log('Problem occured at ', row, '\n', err)
      } else {
        console.log('Succesfully updated:' + this)
      }
    }
    )
  }
}, (err, nbRows) => {
  if (err) {
    throw Error(err)
  }
  console.log(nbRows, ' rows affected')
  // db.close()
})
