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
- i18n (csv to json locales ?)
- Fichiers : legacy PDB files (ngl)
- Errors : send messages
  - when file could not be uploaded
  - when network is not available --> online/offline api
- Commandes : 
  - icons
  - add/remove labels
  - create/remove surface
  - on hover select, highlight selection
  - remake the vue-color component for event delegation !
- Sequences : 
  - 2 way binding ?
  - select from sequence
  - clear selection
  - horizontal scrolling for chains
  - virtual scrolling for large datasets
- build :
  - move to webpack 2 ?
  - remove unnecessary libraries components (elements ui ?)
  - build bundle from es6 dependencies (e.g. ngl)
- bugs :
  - safari : not displaying tab contents
  - firefox : not going fullscreen