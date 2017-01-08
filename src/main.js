import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import App from './App'
import store from './store'

Vue.use(VueI18n)
Vue.use(ElementUI)

// ready translated locales
var locales = {
  en: {
    biochem: {
      amino_acid: 'amino acid',
      amino_acid_short: 'amino ac.',
      nucleotide: 'nucleotide'
    },
    messages: {
      no_record_found: 'No record found'
    },
    tooltips: {
      chain: 'Chain'
    },
    ui: {
      files_tab_label: 'Files',
      commands_tab_label: 'Commands',
      sequences_tab_label: 'Sequence',
      search_libmol_label: 'Search in "Librairie de molécules" (fr)',
      search_pdb_label: 'Query the Protein Data Bank',
      load_local_file_label: 'Load local file',
      load_local_file_instructions_HTML: 'Drag and drop file here or <em>click to load</em>',
      sequence_select_instructions: 'Select from the different chains sequences',
      settings: {
        reset: 'Reset',
        white: 'white',
        black: 'black'
      },
      commands: {
        select: {
          label: 'Select',
          all: 'All',
          protein: 'Protein',
          nucleic: 'DNA/RNA',
          carbohydrate: 'Carbohydrates',
          water: 'Water',
          hetero: 'Other'
        },
        display: {
          label: 'Display',
          spacefill: 'Spacefill',
          balls_and_sticks: 'Balls & Sticks',
          sticks: 'Licorice',
          cartoon: 'Cartoon',
          backbone: 'Backbone',
          hide: 'Hide/Display'
        },
        color: {
          label: 'Colour',
          cpk: 'CPK',
          by_chain: 'Chains',
          by_res: 'Residues',
          by_secondary_structure: 'Structure',
          by_biochemical_nature: 'Nature',
          pick_color: 'Palette'
        }
      }
    }
  },
  fr: {
    biochem: {
      amino_acid: 'acide aminé',
      amino_acid_short: 'ac-aminé',
      nucleotide: 'nucléotide'
    },
    messages: {
      no_record_found: 'Aucun enregistrement trouvé'
    },
    tooltips: {
      chain: 'Chaîne'
    },
    ui: {
      files_tab_label: 'Fichiers',
      commands_tab_label: 'Commandes',
      sequences_tab_label: 'Séquence',
      search_libmol_label: 'Rechercher dans la librairie de molécules',
      search_pdb_label: 'Rechercher dans la Protein Data Bank',
      load_local_file_label: 'Charger un fichier local',
      load_local_file_instructions_HTML: 'Déposer un fichier ici ou <em>cliquer pour charger</em>',
      sequence_select_instructions: 'Sélectionner à partir des séquences des différentes chaînes',
      settings: {
        reset: 'Réinitialiser',
        white: 'white',
        black: 'black'
      },
      commands: {
        select: {
          label: 'Sélectionner',
          all: 'Tout',
          protein: 'Protéines',
          nucleic: 'ADN/ARN',
          carbohydrate: 'Glucides',
          water: 'Eau',
          hetero: 'Autres'
        },
        display: {
          label: 'Afficher',
          spacefill: 'Sphères',
          balls_and_sticks: 'Boules et bâtonnets',
          sticks: 'Bâtonnets',
          cartoon: 'Rubans',
          backbone: 'Squelette',
          hide: 'Cacher/Montrer'
        },
        color: {
          label: 'Colorer',
          cpk: 'Atomes',
          by_chain: 'Chaînes',
          by_res: 'Résidus',
          by_secondary_structure: 'Structure',
          by_biochemical_nature: 'Nature',
          pick_color: 'Palette'
        }
      }
    }
  }
}

// set lang
Vue.config.lang = 'fr'

// set locales
Object.keys(locales).forEach(function (lang) {
  Vue.locale(lang, locales[lang])
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  template: '<App/>',
  components: { App }
})
