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
  - AS Rose, AR Bradley, Y Valasatava, JM Duarte, A Prlić and PW Rose. _Web-based molecular graphics for large complexes._ ACM Proceedings of the 21st International Conference on Web3D Technology (Web3D '16): 185-186, 2016. [doi:10.1145/2945292.2945324](http://dx.doi.org/10.1145/2945292.2945324)
  - AS Rose and PW Hildebrand. _NGL Viewer: a web application for molecular visualization._ Nucl Acids Res (1 July 2015) 43 (W1): W576-W579 first published online April 29, 2015. [doi:10.1093/nar/gkv402](https://doi.org/10.1093/nar/gkv402)
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
Please do not hesitate to contact me if interested.

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
  - handle mega files
- Errors/warnings : send messages
  - when file could not be loaded
  - when network is not available --> online/offline api
- Commandes : 
  - add/remove labels
  - provide choices for selecting hetero (e.g. : in cox2 ara and hem)
- Sequences : 
  - interactions ? <http://www.rcsb.org/pdb/news.do?year=2016&article=57e30fd490f5613003407f09&feature=true>
  - select from distance (within)
  - search (user selection ?)
- 3D View:
  - change cursor when rotating, zooming, panning, selecting
  - rotating around z-axis
- code refactor
  - event bus : https://devblog.digimondo.io/building-a-simple-eventbus-in-vue-js-64b70fb90834#.706mbapkg
- bugs :
  - polymer size should exceed 3 for ribbon/backbone
  