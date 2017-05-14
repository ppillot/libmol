# Select by Selection Command
This text box allows you to enter a selection command to make more complex selections or faster than through the sequence mode.
Atoms whose characteristics match the keywords are selected.

Once the command is correct, enable the selection by pressing the Enter key or clicking on the validation button.

The pre-visualization of the selection is transiently displayed on mouseover and allows to check the quality of the selection made. The number of atoms included is dislayed in the selection bar. If the selection can not be processed, the text appears in red.

## Examples of select commands
| Commands | Related Selections |
| ---------- | -------------------------- |
| `val` | All the valines |
| `val and 10` | All valines in position 10 in the chains
| `:B` | Chain B **(case sensitive)**
| `10:B` | The amino acid (or nucleotide) at position 10 in the B chain
| `_C` | All carbon atoms
| `ala and .ca and not 10` | All alpha carbons of alanines except in the amino acid at position 10
| `protein and not (:C,:B)` | All atoms belonging to proteins but not to chains C nor B

## Keywords
| Keyword | Meaning
| ----------- | ------
| `all` | All atoms
| `protein` | Proteins and amino acids
| `nucleic` | DNA, RNA and nucleotides
| `dna` | DNA
| `rna` | RNA
| `hetero` | hetero
| `saccharide` | Carbohydrates
| `ion` | Ions
| `water` | Water
| `polymer` | Protein, DNA or RNA
| `backbone` | Skeleton of a Protein or a Nucleic Acid
| `sidechain` | Side chain (amino acid) or nucleic base
| `helix` | Helices
| `sheet` | Beta sheets
| `turn` | Secondary structure neither in helices nor in sheets
See more keywords in the [NGL documentation](http://arose.github.io/ngl/api/tutorial-selection-language.html)

## Syntax
| Expression | Meaning
| --------------- | ---------------
| `1,2,3` | | Selection of residues by their number
| `1-10` | Selection of a sequence of residues (here, from 1 to 10)
| `:A` | Selecting a string from its identifier
| `#H,#C,#O` | Selection of atoms by their chemical symbol
| `.CA,.N3` | Selection of atoms by name in the PDB file
| `ALA,HEM` | Selection of residues by their names
| `[032],[CT1]` | Selection of residues whose names contain digits
Refer to [NGL documentation](http://arose.github.io/ngl/api/tutorial-selection-language.html) for more advanced examples

Expressions and keywords can be combined using logical operators (`AND`,` OR`, `NOT`). Parentheses can be used to group expressions and set priorities between combinations.