import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {Autocomplete, Button, Col, Icon, Popover, Row, Scrollbar, Slider, Switch, Tabs, TabPane} from 'element-ui'
import App from './App'
import store from './store'

Vue.use(VueI18n)
Vue.use(Autocomplete)
Vue.use(Button)
Vue.use(Col)
Vue.use(Icon)
// Vue.use(Message)
Vue.use(Popover)
Vue.use(Row)
Vue.use(Scrollbar)
Vue.use(Slider)
Vue.use(Switch)
Vue.use(Tabs)
Vue.use(TabPane)

// ready translated locales
var locales = {
  en: {
    biochem: {
      amino_acid: 'amino acid',
      amino_acid_short: 'amino ac.',
      nucleotide: 'nucleotide',
      pdb_res_name: {
        ALA: 'Alanine',
        ARG: 'Arginine',
        ASN: 'Asparagine',
        ASP: 'Aspartic acid',
        CYS: 'Cysteine',
        GLN: 'Glutamine',
        GLU: 'Glutamic acid',
        GLY: 'Glycine',
        HIS: 'Histidine',
        ILE: 'Isoleucine',
        LEU: 'Leucine',
        LYS: 'Lysine',
        MET: 'Methionine',
        PHE: 'Phenylalanine',
        PRO: 'Proline',
        SER: 'Serine',
        THR: 'Threonine',
        TRP: 'Tryptophan',
        TYR: 'Tyrosine',
        VAL: 'Valine',
        HEM: 'Heme',
        HYP: 'Hydroxyproline',
        PCA: 'Pyroglutamic acid',
        A: 'Adenine',
        C: 'Cytosine',
        T: 'Thymine',
        G: 'Guanine',
        U: 'Uracile',
        DA: 'Adenine',
        DT: 'Thymine',
        DC: 'Cytosine',
        DG: 'Guanine'
      },
      el_name: {
        'H': 'hydrogen', 'HE': 'helium', 'LI': 'lithium', 'BE': 'berylium', 'B': 'bore', 'C': 'carbon', 'N': 'nitrogen', 'O': 'oxygen', 'F': 'fluorine', 'NE': 'neon', 'NA': 'sodium', 'MG': 'magnesium', 'AL': 'aluminium', 'SI': 'silicon', 'P': 'phosphorus', 'S': 'sulfur', 'CL': 'chlorine', 'AR': 'argon', 'K': 'potassium', 'CA': 'calcium', 'SC': 'scandium', 'TI': 'titanium', 'V': 'vanadium', 'CR': 'chromium', 'MN': 'manganese', 'FE': 'iron', 'CO': 'cobalt', 'NI': 'nickel', 'CU': 'copper', 'ZN': 'zinc', 'GA': 'gallium', 'GE': 'germanium', 'AS': 'arsenic', 'SE': 'selenium', 'BR': 'bromine', 'KR': 'krypton', 'RB': 'rubidium', 'SR': 'strontium', 'Y': 'yttrium', 'ZR': 'zirconium', 'NB': 'niobium', 'MO': 'molybdenum', 'TC': 'technetium', 'RU': 'ruthenium', 'RH': 'rhodium', 'PD': 'palladium', 'AG': 'silver', 'CD': 'cadnium', 'IN': 'indium', 'SN': 'tin', 'SB': 'antimony', 'TE': 'tellurium', 'I': 'iodine', 'XE': 'xenon', 'CS': 'caesium', 'BA': 'barium', 'HF': 'hafnium', 'TA': 'tantalum', 'W': 'tungsten', 'RE': 'rhenium', 'OS': 'osmium', 'IR': 'iridium', 'PT': 'platinum', 'AU': 'gold', 'HG': 'mercury', 'TL': 'thallium', 'PB': 'lead', 'BI': 'bismuth', 'PO': 'polonium', 'AT': 'astatine', 'RN': 'radon', 'FR': 'francium', 'RA': 'radium', 'RF': 'rutherfordium', 'DB': 'dubnium', 'SG': 'seaborgium', 'BH': 'bohrium', 'HS': 'hassium', 'MT': 'meitnerium', 'DS': 'darmstadtium', 'RG': 'roentgenium', 'LA': 'lanthanum', 'CE': 'cerium', 'PR': 'praseodymium', 'ND': 'neodymium', 'PM': 'promethium', 'SM': 'samarium', 'EU': 'europium', 'GD': 'gadolinium', 'TB': 'terbium', 'DY': 'dysprosium', 'HO': 'holmium', 'ER': 'erbium', 'TM': 'thulium', 'YB': 'ytterbium', 'LU': 'lutetium', 'AC': 'actinium', 'TH': 'thorium', 'PA': 'protactinium', 'U': 'uranium', 'NP': 'neptunium', 'PU': 'plutonium', 'AM': 'americium', 'CM': 'curium', 'BK': 'berkelium', 'CF': 'californium', 'ES': 'einsteinium', 'FM': 'fermium', 'MD': 'mendelevium', 'NO': 'nobelium', 'LR': 'lawrencium'
      },
      sstruc: {
        'alphaHelix': 'Helix',
        'threeTenHelix': 'Helix 3-10',
        'piHelix': 'Helix π',
        'betaStrand': 'Strand',
        'betaTurn': 'Turn',
        'coil': 'Coil'
      },
      moleculeType: {
        protein: 'Protein',
        nucleic: 'DNA/RNA',
        dna: 'DNA',
        rna: 'RNA',
        saccharide: 'Carbohydrates',
        water: 'Water',
        hetero: 'Other',
        ion: 'Ion'
      }
    },
    messages: {
      no_record_found: 'No record found'
    },
    tooltips: {
      chain: 'Chain',
      atom: 'Atom',
      res: {
        hetero: 'Hetero',
        water: 'Water',
        ion: 'Ion',
        protein: 'Amino acid',
        rna: 'Nucleotide (RNA)',
        dna: 'Nucleotide (DNA)',
        saccharide: 'Saccharide'
      }
    },
    ui: {
      files_tab_label: 'Files',
      commands_tab_label: 'Commands',
      sequences_tab_label: 'Sequence',
      search_libmol_label: 'Search in "Librairie de molécules" (fr)',
      search_pdb_label: 'Query the Protein Data Bank',
      load_local_file_label: 'Load local file',
      load_local_file_instructions: 'Drag and drop file here or click to load',
      sequence_select_instructions: 'Select from the different chains sequences',
      settings: {
        clip_near_label: 'Near clip plane position',
        fog_label: 'Fog effect position',
        background_label: 'Background color',
        reset: 'Reset',
        white: 'white',
        black: 'black'
      },
      commands: {
        select: {
          label: 'Select',
          all: 'All',
          invert: 'Invert',
          none: 'None',
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
      nucleotide: 'nucléotide',
      pdb_res_name: {
        ALA: 'Alanine',
        ARG: 'Arginine',
        ASN: 'Asparagine',
        ASP: 'Ac. aspartique',
        CYS: 'Cystéine',
        GLN: 'Glutamine',
        GLU: 'Ac. glutamique',
        GLY: 'Glycine',
        HIS: 'Histidine',
        ILE: 'Isoleucine',
        LEU: 'Leucine',
        LYS: 'Lysine',
        MET: 'Méthionine',
        PHE: 'Phénylalanine',
        PRO: 'Proline',
        SER: 'Sérine',
        THR: 'Thréonine',
        TRP: 'Tryptophane',
        TYR: 'Tyrosine',
        VAL: 'Valine',
        HOH: 'Eau',
        HEM: 'Héme',
        HYP: 'Hydroxyproline',
        PCA: 'Ac. pyroglutamique',
        A: 'Adénine',
        C: 'Cytosine',
        T: 'Thymine',
        G: 'Guanine',
        U: 'Uracile',
        NAG: 'N-Acétyl glucosamine',
        FUC: 'Fucose',
        GAL: 'Galactose',
        GLC: 'Glucose',
        MAN: 'Mannose',
        DA: 'Adénine',
        DT: 'Thymine',
        DC: 'Cytosine',
        DG: 'Guanine',
        SAL: 'Ac. acétyl-salicylique',
        NI: 'Nickel',
        O2: 'Dioxygène'
      }, /* eslint-disable object-property-newline */
      el_name: {
        'H': 'hydrogène', 'HE': 'hélium',
        'LI': 'lithium', 'BE': 'béryllium', 'B': 'bore', 'C': 'carbone', 'N': 'azote', 'O': 'oxygène', 'F': 'fluor', 'NE': 'néon',
        'NA': 'sodium', 'MG': 'magnésium', 'AL': 'aluminium', 'SI': 'silicium', 'P': 'phosphore', 'S': 'soufre', 'CL': 'chlore', 'AR': 'argon',
        'K': 'potassium', 'CA': 'calcium', 'SC': 'scandium', 'TI': 'titane', 'V': 'vanadium', 'CR': 'chrome', 'MN': 'manganèse', 'FE': 'fer', 'CO': 'cobalt', 'NI': 'nickel', 'CU': 'cuivre', 'ZN': 'zinc', 'GA': 'gallium', 'GE': 'germanium', 'AS': 'arsenic', 'SE': 'sélénium', 'BR': 'brome', 'KR': 'krypton',
        'RB': 'rubidium', 'SR': 'strontium', 'Y': 'yttrium', 'ZR': 'zirconium', 'NB': 'niobium', 'MO': 'molybdène', 'TC': 'technétium', 'RU': 'ruthénium', 'RH': 'rhodium', 'PD': 'palladium', 'AG': 'argent', 'CD': 'cadnium', 'IN': 'indium', 'SN': 'étain', 'SB': 'antimoine', 'TE': 'tellurium', 'I': 'iode', 'XE': 'xénon',
        'CS': 'césium', 'BA': 'barium', 'HF': 'hafnium', 'TA': 'tantalum', 'W': 'tungstène', 'RE': 'rhénium', 'OS': 'osmium', 'IR': 'iridium', 'PT': 'platine', 'AU': 'or', 'HG': 'mercure', 'TL': 'thallium', 'PB': 'plomb', 'BI': 'bismuth', 'PO': 'polonium', 'AT': 'astate', 'RN': 'radon',
        'FR': 'francium', 'RA': 'radium', 'RF': 'rutherfordium', 'DB': 'dubnium', 'SG': 'seaborgium', 'BH': 'bohrium', 'HS': 'hassium', 'MT': 'meitnérium', 'DS': 'darmstadtium', 'RG': 'roentgenium',
        'LA': 'lanthanum', 'CE': 'cérium', 'PR': 'praséodyme', 'ND': 'néodyme', 'PM': 'prométhium', 'SM': 'samarium', 'EU': 'europium', 'GD': 'gadolinium', 'TB': 'terbium', 'DY': 'dysprosium', 'HO': 'holmium', 'ER': 'erbium', 'TM': 'thulium', 'YB': 'ytterbium', 'LU': 'lutetium', 'AC': 'actinium', 'TH': 'thorium', 'PA': 'protactinium', 'U': 'uranium', 'NP': 'neptunium', 'PU': 'plutonium', 'AM': 'américium', 'CM': 'curium', 'BK': 'berkélium', 'CF': 'californium', 'ES': 'einsteinium', 'FM': 'fermium', 'MD': 'mendélévium', 'NO': 'nobélium', 'LR': 'lawrencium'
      }, /* eslint-enable */
      sstruc: {
        'alphaHelix': 'Hélice',
        'threeTenHelix': 'Hélice 3-10',
        'piHelix': 'Hélice π',
        'betaStrand': 'Feuillet',
        'betaTurn': 'Coude',
        'coil': 'Non définie'
      },
      molecule_type: {
        protein: 'Protéine',
        nucleic: 'DNA/RNA',
        dna: 'ADN',
        rna: 'ARN',
        saccharide: 'Glucide',
        water: 'Eau',
        hetero: 'Hétéro',
        ion: 'Ion'
      }
    },
    messages: {
      no_record_found: 'Aucun enregistrement trouvé'
    },
    tooltips: {
      chain: 'Chaîne',
      atom: 'Atome',
      res: {
        hetero: 'Résidu',
        water: 'Eau',
        ion: 'Ion',
        protein: 'Acide aminé',
        rna: 'Nucléotide (ARN)',
        dna: 'Nucléotide (ADN)',
        saccharide: 'Résidu glucidique'
      }
    },
    ui: {
      files_tab_label: 'Fichiers',
      commands_tab_label: 'Commandes',
      sequences_tab_label: 'Séquence',
      search_libmol_label: 'Rechercher dans la librairie de molécules',
      search_pdb_label: 'Rechercher dans la Protein Data Bank',
      load_local_file_label: 'Charger un fichier local',
      load_local_file_instructions: 'Déposer un fichier ici ou cliquer pour charger',
      sequence_select_instructions: 'Sélectionner à partir des séquences des différentes chaînes',
      settings: {
        clip_near_label: 'Position du plan de coupe avant',
        fog_label: 'Position effet de brouillard',
        background_label: 'Couleur de fond',
        reset: 'Réinitialiser',
        white: 'blanc',
        black: 'noir'
      },
      commands: {
        select: {
          label: 'Sélectionner',
          all: 'Tout',
          invert: 'Inverser',
          none: 'Aucun',
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
const language = navigator.languages || [navigator.language]
let lang = language.find(navPreferedLanguage => {
  return Object.keys(locales).find(locale => {
    return navPreferedLanguage.substr(0, 2) === locale
  })
})
Vue.config.lang = (lang === undefined) ? 'en' : lang.substr(0, 2).toLowerCase()

// set locales
Object.keys(locales).forEach(function (lang) {
  Vue.locale(lang, locales[lang])
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  // template: '<App/>',
  // components: { App },
  render: h => h(App)
})
