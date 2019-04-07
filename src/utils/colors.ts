import {ColormakerRegistry, Colormaker} from 'ngl'
import AtomProxy from 'ngl/declarations/proxy/atom-proxy'

var ElementColors: {[k:string]: number} = {
  'H': 0xFFFFFF,
  'HE': 0xD9FFFF,
  'LI': 0xCC80FF,
  'BE': 0xC2FF00,
  'B': 0xFFB5B5,
  'C': 0x909090,
  'N': 0x3050F8,
  'O': 0xFF0D0D,
  'F': 0x90E050,
  'NE': 0xB3E3F5,
  'NA': 0xAB5CF2,
  'MG': 0x8AFF00,
  'AL': 0xBFA6A6,
  'SI': 0xF0C8A0,
  'P': 0xFF8000,
  'S': 0xFFFF30,
  'CL': 0x1FF01F,
  'AR': 0x80D1E3,
  'K': 0x8F40D4,
  'CA': 0x3DFF00,
  'SC': 0xE6E6E6,
  'TI': 0xBFC2C7,
  'V': 0xA6A6AB,
  'CR': 0x8A99C7,
  'MN': 0x9C7AC7,
  'FE': 0xE06633,
  'CO': 0xF090A0,
  'NI': 0x50D050,
  'CU': 0xC88033,
  'ZN': 0x7D80B0,
  'GA': 0xC28F8F,
  'GE': 0x668F8F,
  'AS': 0xBD80E3,
  'SE': 0xFFA100,
  'BR': 0xA62929,
  'KR': 0x5CB8D1,
  'RB': 0x702EB0,
  'SR': 0x00FF00,
  'Y': 0x94FFFF,
  'ZR': 0x94E0E0,
  'NB': 0x73C2C9,
  'MO': 0x54B5B5,
  'TC': 0x3B9E9E,
  'RU': 0x248F8F,
  'RH': 0x0A7D8C,
  'PD': 0x006985,
  'AG': 0xC0C0C0,
  'CD': 0xFFD98F,
  'IN': 0xA67573,
  'SN': 0x668080,
  'SB': 0x9E63B5,
  'TE': 0xD47A00,
  'I': 0x940094,
  'XE': 0x940094,
  'CS': 0x57178F,
  'BA': 0x00C900,
  'LA': 0x70D4FF,
  'CE': 0xFFFFC7,
  'PR': 0xD9FFC7,
  'ND': 0xC7FFC7,
  'PM': 0xA3FFC7,
  'SM': 0x8FFFC7,
  'EU': 0x61FFC7,
  'GD': 0x45FFC7,
  'TB': 0x30FFC7,
  'DY': 0x1FFFC7,
  'HO': 0x00FF9C,
  'ER': 0x00E675,
  'TM': 0x00D452,
  'YB': 0x00BF38,
  'LU': 0x00AB24,
  'HF': 0x4DC2FF,
  'TA': 0x4DA6FF,
  'W': 0x2194D6,
  'RE': 0x267DAB,
  'OS': 0x266696,
  'IR': 0x175487,
  'PT': 0xD0D0E0,
  'AU': 0xFFD123,
  'HG': 0xB8B8D0,
  'TL': 0xA6544D,
  'PB': 0x575961,
  'BI': 0x9E4FB5,
  'PO': 0xAB5C00,
  'AT': 0x754F45,
  'RN': 0x428296,
  'FR': 0x420066,
  'RA': 0x007D00,
  'AC': 0x70ABFA,
  'TH': 0x00BAFF,
  'PA': 0x00A1FF,
  'U': 0x008FFF,
  'NP': 0x0080FF,
  'PU': 0x006BFF,
  'AM': 0x545CF2,
  'CM': 0x785CE3,
  'BK': 0x8A4FE3,
  'CF': 0xA136D4,
  'ES': 0xB31FD4,
  'FM': 0xB31FBA,
  'MD': 0xB30DA6,
  'NO': 0xBD0D87,
  'LR': 0xC70066,
  'RF': 0xCC0059,
  'DB': 0xD1004F,
  'SG': 0xD90045,
  'BH': 0xE00038,
  'HS': 0xE6002E,
  'MT': 0xEB0026,
  'DS': 0xFFFFFF,
  'RG': 0xFFFFFF,
  'CN': 0xFFFFFF,
  'UUT': 0xFFFFFF,
  'FL': 0xFFFFFF,
  'UUP': 0xFFFFFF,
  'LV': 0xFFFFFF,
  'UUH': 0xFFFFFF,

  'D': 0xFFFFC0,
  'T': 0xFFFFA0
}
var DefaultElementColor = 0xFFFFFF

// from Jmol http://jmol.sourceforge.net/jscolors/ (protein + shapely for nucleic)
var ResidueColors2: {[k:string]: number} = {
  'ALA': 0xd9d9d9,
  'ARG': 0x80b1d3,
  'ASN': 0xbc80bd,
  'ASP': 0xfb8072,
  'CYS': 0xffed6f,
  'GLN': 0xbc80bd,
  'GLU': 0xfb8072,
  'GLY': 0xd9d9d9,
  'HIS': 0x80b1d3,
  'ILE': 0xd9d9d9,
  'LEU': 0xd9d9d9,
  'LYS': 0x80b1d3,
  'MET': 0xd9d9d9,
  'PHE': 0xfdb462,
  'PRO': 0xffffb3,
  'SER': 0xb3de69,
  'THR': 0xb3de69,
  'TRP': 0xfdb462,
  'TYR': 0xfdb462,
  'VAL': 0xd9d9d9,

  'ASX': 0xFF00FF,
  'GLX': 0xFF00FF,
  'ASH': 0xFF00FF,
  'GLH': 0xFF00FF,

  'A': 0xd95f02,
  'G': 0x66a61e,
  'I': 0x80FFFF,
  'C': 0xe6ab02,
  'T': 0x7570b3,
  'U': 0xe7298a,

  'DA': 0xd95f02,
  'DG': 0x66a61e,
  'DI': 0x80FFFF,
  'DC': 0xe6ab02,
  'DT': 0x7570b3,
  'DU': 0xe7298a
}
var DefaultResidueColor2 = 0xFF00FF

// from Jmol http://jmol.sourceforge.net/jscolors/ (shapely)
var StructureColors: {[k:string]: number} = {
  'alphaHelix': 0xFF0080,
  'threeTenHelix': 0xA00080,
  'piHelix': 0x600080,
  'betaStrand': 0xFFC800,
  'betaTurn': 0x6080FF,
  'coil': 0xFFFFFF,

  'dna': 0xAE00FE,
  'rna': 0xFD0162,

  'carbohydrate': 0xA6A6FA
}
var DefaultStructureColor = 0x808080

var MolecuteTypeColor: {[k:string]: number} = {
  'water': 0x386cb0,
  'ion': 0xf0027f,
  'protein': 0xbeaed4,
  'rna': 0xfdc086,
  'dna': 0xbf5b17,
  'saccharide': 0x7fc97f,
  'hetero': 0xffff99
}
var DefaultMoleculeTypeColor = 0xffff99

function getColor (scheme: string, token: string) {
  var color = 0
  switch (scheme) {
    case 'element':
      color = ElementColors[token] || DefaultElementColor
      break
    case 'resname':
      color = ResidueColors2[token] || DefaultResidueColor2
      break
    case 'sstruc':
      color = StructureColors[token] || DefaultStructureColor
      break
    case 'moleculetype':
      color = MolecuteTypeColor[token] || DefaultMoleculeTypeColor
  }
  return color
}

let byres = ColormakerRegistry.addScheme(function (this: Colormaker) {
  this.atomColor = function (atom: AtomProxy) {
    return ResidueColors2[atom.resname] || DefaultResidueColor2
  }
}, 'byres')

export {
  getColor,
  byres
}
