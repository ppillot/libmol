# Selecionar mediante Comandos de selección
Esta caixa de texto permite introducir un comando de selección para realizar seleccións máis complexas ou máis axiña que a través do modo secuencia.
Os átomos que teñan as características indicadas polas palabras chave serán seleccionados.

Despois de introducir un comando correcto realice a selección premendo a tecla Intro ou facendo click no botón de validación.

A previsualización da selección móstrase mentres se pasa o rato por riba da molécula e permite verificar a calidade da selección. A barra de selección mostrará o número de átomos seleccionados. Se non fose posible procesar a selección o texto aparecerá en vermello.

## Exemplos de comandos de selección
| Comandos | Seleccións asignadas |
| ---------- | -------------------------- |
| `val` | Todas as valinas |
| `val and 10` | Todas as valinas en posición 10 nas cadeas
| `:B` | Cadea B **(distingue maiúsculas e minúsculas)**
| `10:B` | O aminoácido (ou nucleótido) en posición 10 na cadea B
| `_C` | Todos os átomos de carbono
| `ala and .ca and not 10` | Todos os carbonos alfa das alaninas excepto o aminoácido en posición 10
| `protein and not (:C,:B)` | Todos os átomos pertencentes a proteínas pero non ás cadeas C nin B

## Palabras chave
| Palabra chave | Significado
| ----------- | ------
| `all` | Todos os átomos
| `protein` | Proteínas e aminoácidos
| `nucleic` | ADN, ARN e nucleótidos
| `dna` | ADN
| `rna` | ARN
| `hetero` | hetero
| `saccharide` | Carbohidratos
| `ion` | Ións
| `water` | Auga
| `polymer` | Proteína, ADN or ARN
| `backbone` | Esqueleto dunha proteína ou ácido nucleico
| `sidechain` | Cadea lateral dun aminoácido ou base nitroxenada
| `helix` | Hélices
| `sheet` | Follas dobradas
| `turn` | Estrutura secundaria sen hélices nin follas dobradas
Ver máis palabras chave na [Documentation NGL](http://arose.github.io/ngl/api/tutorial-selection-language.html)

## Sintaxe
| Expresión | Significacdo
| --------------- | ---------------
| `1,2,3` | Selección de residuos polo seu número
| `1-10` | Selección dunha secuencia de residuos (aquí, do 1 ao 10)
| `:A` | Seleccionar unha cadea polo seu identificador
| `#H,#C,#O` | Selección de átomos polo seu símbolo
| `.CA,.N3` | Selección de átomos polo seu nome no ficheiro PDB
| `ALA,HEM` | Selección de residuos polo seus nomes
| `[032],[CT1]` | Selección de residuos cuxos nomes conteñen díxitos
Busque na [Documentation NGL](http://arose.github.io/ngl/api/tutorial-selection-language.html) exemplos máis avanzados
As expresións e palabras chave poden ser combinadas usando operadores lóxicos (`AND`,` OR`, `NOT`). Pódense usar parénteses para agrupar expresións e establecer prioridades entre as combinacións.
