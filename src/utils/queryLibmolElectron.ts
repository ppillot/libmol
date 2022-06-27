import Datastore from 'nedb'
import path from 'path'
import fs from 'fs'
import { LibmolResponse } from './queryLibmolAjax'
declare const __static: string;
interface LibmolNeDBDoc {
    TITRE: string
    FICHIER: string
    ID: string
}


const molecules = new Datastore({
    inMemoryOnly: true
    // filename: 'static/datastore/molecule.nedb'
})
const datastoreContent = JSON.parse(
    fs.readFileSync(
        path.join(__static, 'static/datastore/molecule.json'),
        'utf8'
    )
)
// console.log(datastoreContent)
molecules.insert(datastoreContent, (err, newDocs) => {
    if (err) {
        console.log(err)
    }
})

function cancelRequest () {

}

function query (queryString: string): Promise<LibmolResponse[]> {

    const queryRegExp = new RegExp(queryString, 'gi')
    return new Promise((resolve, reject) => {
        molecules.find({ TITRE: queryRegExp }, (err: string, docs: LibmolNeDBDoc[]) => {
            if (err) {
              return reject('Error in libmol search' + err)
            }
            let rep: LibmolResponse[] = []
            docs.forEach(d => {
                let filename = (d.FICHIER.indexOf('.gz') > -1) ?
                    d.FICHIER.substring(0, d.FICHIER.lastIndexOf('.gz')) : d.FICHIER
              rep.push({
                value: d.TITRE,
                file: ((d.FICHIER.indexOf('.cif') > -1) || (d.FICHIER.indexOf('.mmtf') > -1) || (d.FICHIER.indexOf('.sdf') > -1))
                  ? 'static/mol/' + filename + '.gz'
                  : `static/mol/pdb/${d.FICHIER}.pdb.gz`,
                molId: d.ID,
                source: 'libmol'
              })
            })
            return resolve(rep)
        })
    })
}

function isCancel (error: any) {
    return true
}

export default {
    cancelRequest,
    query,
    isCancel
}