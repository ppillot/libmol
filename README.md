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
- Files : handle legacy PDB files (ngl)
- Errors/warnings : send messages
  - when file could not be uploaded
  - when network is not available --> online/offline api
  - when current selection is empty (deactivate all commands ???)
  - when some atoms are hidden
  - when all atoms are hidden
- Commandes : 
  - add/remove labels
  - create/remove surface
  - on hover display help
  - display base on nuceic acids
- Sequences : 
  - interactions ? <http://www.rcsb.org/pdb/news.do?year=2016&article=57e30fd490f5613003407f09&feature=true>
  - select from user command
- Slider :
  - make them live
- State :
  - update color
  - update display
  - update chains
- 3D View:
  - change cursor when rotating, zooming, panning, selecting
- code refactor
  - event bus : https://devblog.digimondo.io/building-a-simple-eventbus-in-vue-js-64b70fb90834#.706mbapkg
- bugs :
  - safari : not displaying tab contents
  - firefox : not going fullscreen
- components :
  - replace autocomplete (33kB)
  - replace axios (35kB) with fetch polyfill (12kB) (bug in webpack proxy)