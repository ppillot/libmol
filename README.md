# libmol

> Molecular viewer intended at undergraduate level

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
- display :
  - status bar
    - legendes couleurs
      - add moltypes, deal with secondary structures
      - how to get chain colors ?
      - replace element-ui tooltips on hovering
  - hovered atom : display a tooltip ?
- build :
  - move to webpack 2
  - remove unnecessary libraries components
  - build bundle from es6 dependencies (e.g. ngl)
