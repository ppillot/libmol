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
- Commandes : 
  - icons
  - labels
  - surface
  - on hover select, highlight selection
  - remake the color component for event delegation !
- Séquences : 
  - 2 way binding
  - select from sequence
  - clear selection
  - horizontal scrolling for chains
  - virtual scrolling for large datasets
- display :
  - resize (ngl)
  - status bar
    - legendes couleurs, selection
    - hovered atom
  - toolbar
    - fullscreen
    - screen capture (export) see ngl/src/utils.js for download and ngl/examples/js/gui.js for screenshot
