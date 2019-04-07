# Sélectionner avec le langage de sélection
Cette zone de texte permet de saisir une commande de sélection pour réaliser des sélections plus complexes ou plus rapidement qu'avec le mode séquence.  
Tous les atomes dont les caractéristiques correspondent aux mots clés sont sélectionnés.

Pour valider la sélection, utiliser la touche Entrée ou cliquer sur le bouton de validation.  

La pré-visualisation de la sélection s'affiche transitoirement au survol de la souris et permet de vérifier la qualité de la sélection réalisée. Le nombre d'atomes correspondants est indiqué dans la barre de sélection. Si la sélection n'est pas reconnue par le logiciel, le texte apparaît en rouge.

## Exemples de commandes de sélection
| Commande | Sélection correspondante |
|----------|--------------------------|
|`val`     | toutes les valines       |
|`val and 10`| toutes les valines en position 10 dans les chaînes  
|`:B`      | chaîne B (**Attention à la majuscule**)
|`10:B`    | l'acide aminé (ou le nucléotide) en position 10 dans la chaîne B
|`_C`      | tous les atomes de carbone
|`ala and .ca and not 10`  | tous les carbones alpha des alanines sauf dans l'acide aminé en position 10
|`protein and not (:C,:B)`| tous les atomes appartenant à des protéines mais pas aux chaînes C et B

## Mots clés
| Mot clé   | Signification
|-----------|------
|`all`      | tous les atomes
|`protein`  | protéines et acides aminés
|`nucleic`  | ADN, ARN et nucléotides
|`dna`      | ADN
|`rna`      | ARN
|`hetero`   | Hétéroatomes
|`saccharide`| Glucides
|`ion`      | Ions
|`water`    | Eau
|`polymer`  | Protéine, ADN ou ARN
|`backbone` | Squelette d'une protéine  ou d'un acide nucléique
|`sidechain`| Chaîne latérale (acide aminé) ou base nucléique
|`helix`    | Hélices
|`sheet`    | Feuillets
|`turn`     | Structure secondaire ni en hélice, ni en feuillet
Voir la suite des mots clés dans la documentation de [NGL](http://arose.github.io/ngl/api/tutorial-selection-language.html)

## Syntaxe
|Expression     | Signification
|---------------|---------------
|`1,2,3`        | Sélection des résidus par leur numéro
|`1-10`         | Sélection d'une suite de résidus (ici, de 1 à 10)
|`:A`           | Sélection d'une chaîne à partir de son identifiant
|`#H,#C,#O`     | Sélection des atomes par leur symbole chimique
|`.CA,.N3`      | Sélection des atomes par leur nom dans le fichier PDB
|`ALA,HEM`      | Sélection des résidus par leurs noms
|`[032],[CT1]`  | Sélection des résidus dont les noms contiennent des chiffres
Se référer à la documentation de [NGL](http://arose.github.io/ngl/api/tutorial-selection-language.html) pour des exemples plus avancés

Les expressions et les mots clés peuvent être combinés entre eux par des opérateurs logiques (`AND`, `OR`, `NOT`). Des parenthèses peuvent être utilisées pour grouper les expressions.
