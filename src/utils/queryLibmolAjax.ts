import axios, { CancelTokenSource, AxiosResponse } from 'axios'

export interface LibmolQueryResponse {
    molId: string,
    label: string,
    file: string
}
export interface LibmolResponse {
  value: string,
  file: string,
  molId: string,
  source: 'libmol'
}
const CancelToken = axios.CancelToken
let source: CancelTokenSource
const path = (process.env.NODE_ENV !== 'production')
  ? 'api/recherche.php'
  : 'https://libmol.org/api/recherche.php'

function cancelRequest () {
  if (source !== undefined) source.cancel()
}

function query (queryString: string): Promise<LibmolResponse[]> {
  source = CancelToken.source()

  return Promise.resolve().then(function () {
    return axios.get(path, {
      params: {
        txt: queryString
      },
      cancelToken: source.token
    })
  })
    .then((response: AxiosResponse<LibmolQueryResponse[]>) => {
      return response.data.map((item) => {
        let filename = (item.file.indexOf('.gz') > -1)
          ? item.file.substring(0, item.file.lastIndexOf('.gz')) : item.file
        let extPos = filename.lastIndexOf('.') + 1
        const ext = (extPos > 0) ? filename.substring(extPos) : 'pdb'

        // In electron app, data files are gzipped. On line to allow
        // compression via CDN, filenames are appended a .txt extension
        const extPostfix = '.gz'

        return { value: item.label,
          file: (filename.indexOf('.mmtf') > -1)
            ? 'static/mol/' + item.file // item.file is intentional
            : ((filename.indexOf('.cif') > -1) || (filename.indexOf('.sdf') > -1))
              ? 'static/mol/' + filename + extPostfix
              : `static/mol/pdb/${filename}.pdb${extPostfix}`,
          molId: item.molId,
          source: 'libmol',
          ext
        }
      })
    })
}

function isCancel (error: any) {
  return axios.isCancel(error)
}

export default {
  cancelRequest,
  query,
  isCancel
}
