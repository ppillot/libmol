# libmol

> Molecular visualization made easy for beginners

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

ToDo
- i18n (csv to json locales ?) <https://github.com/kinogam/i18n-transfer>
- Fichiers : legacy PDB files (ngl)
- Errors : send messages
  - when file could not be uploaded
  - when network is not available --> online/offline api
- Commandes : 
  - icons
  - add/remove labels
  - create/remove surface
  - on hover select, highlight selection (remake button element)
  - help
- Sequences : 
  - 2 way binding ?
  - select from sequence
  - clear selection
  - interactions ? <http://www.rcsb.org/pdb/news.do?year=2016&article=57e30fd490f5613003407f09&feature=true>
- build :
  - build bundle from es6 dependencies (e.g. ngl)
- code refactor
  - event bus : https://devblog.digimondo.io/building-a-simple-eventbus-in-vue-js-64b70fb90834#.706mbapkg
- bugs :
  - safari : not displaying tab contents
  - firefox : not going fullscreen
- components :
  - replace upload (30kB) : https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
  - replace popover (78kB)
  - replace autocomplete (33kB)
  - replace axios (35kB) with fetch polyfill (12kB)