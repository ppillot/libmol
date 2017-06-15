# Libmol.org

> Molecular visualization made easy for beginners

## Web Application
Libmol.org is a single page web application designed to provide students starting structural biology with simplified self explanatory tools to view and interact with biological macromolecules.  

## Aknowledgements
### Contributors
Thanks to [Hervé Furstoss](https://github.com/hfurstoss) for creating and contributing to the interactive documentation.  
[Arose](https://github.com/arose) for developping and continuously improving NGL  
Philippe, Gilles, Jacques, Thomas, Eric and other members of the Forum National de SVT for their support and insightfull inputs.

### Libraries and other resources
This application could not have been written nor deployed without the following open source libraries:
- [NGL](https://github.com/arose/ngl): Javascript molecular vizualisation library leveraging WebGL browsers capacities and tuned for performance
- [Vue.js, Vuex](https://vuejs.org/): Progressive JS framework
- [Vuei18n](https://github.com/kazupon/vue-i18n): Vue plugin for internationalization
- [ElementUI](http://element.eleme.io/#/en-US): UI Library for desktop application using Vue
- [screenfull](https://www.npmjs.com/package/screenfull): wrapper to the fullscreen API for cross-browser compatibility
- [Fontello](http://fontello.com): icon fonts generator  

#### Fonts 
- [Font Awesome](http://fortawesome.github.com/Font-Awesome/)  
   Copyright (C) 2016 by Dave Gandy  
   Author:    Dave Gandy  
   License:   [SIL](http://scripts.sil.org/OFL)  
- [Elusive](http://aristeides.com/):  
   Copyright (C) 2013 by Aristeides Stathopoulos  
   Author:    Aristeides Stathopoulos  
   License:   [SIL](http://scripts.sil.org/OFL)  


Special thanks to [Netlify.com](https://www.netlify.com) for hosting open source projects such as Libmol.org for free.
<a href="https://www.netlify.com">
  <img src="https://www.netlify.com/img/global/badges/netlify-dark.svg"/>
</a>

## i18n effort
Should you be interested in translating Libmol.org to your language, your contribution is most welcome!  
First part of the translation process deals with the user interface. It requires completing an [online Google spreadsheet](https://docs.google.com/spreadsheets/d/1tfpNe1SwHQ51arbPlnE6y7rDB-JKImhGICQGsMzQtes/edit?usp=sharing) with your locale keywords.  
The second part of the process is more involving and requires forking this repository, duplicating one of the folders in locales/ and translating all the markdown files in it.  
Please do not hesitate to contact me if you are interested.

## Developpement and Build Setup
You don't need this to use LibMol.org  
The source code is distributed from this repository and can be downloaded to your computer using Git or the complete archive.  
Once the source code is downloaded and extracted, you'll have to install all dependencies required to build the project.  

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

ToDo
- Files : 
  - handle mega files (display surfaces)
- Errors/warnings : send messages
  - when file could not be uploaded
  - when network is not available --> online/offline api
- Commandes : 
  - add/remove labels
  - create/remove surface, export as STL objects for printing (https://github.com/mrdoob/three.js/blob/master/examples/js/exporters/STLBinaryExporter.js)
  - provide choices for hetero (e.g. : in cox2 asp and hem)
- Sequences : 
  - interactions ? <http://www.rcsb.org/pdb/news.do?year=2016&article=57e30fd490f5613003407f09&feature=true>
  - select from distance (within)
- 3D View:
  - change cursor when rotating, zooming, panning, selecting
- code refactor
  - event bus : https://devblog.digimondo.io/building-a-simple-eventbus-in-vue-js-64b70fb90834#.706mbapkg
- bugs :
  - firefox : not going fullscreen
  - no settings in fullscreen mode
  - color palette button should react to the state
  - polymer size should exceed 3 for ribbon/backbone
