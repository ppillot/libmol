# Balls and sticks representation
![Balls and sticks](static/img/bs1.png)  

This representation displays :
* **(1)** atoms as spheres, **the balls**, 
* **(2)** covalent bonds as segments, **the sticks**.   

It is used to visualized all atoms that are part of a molecules and the covalent connexions between them.  
Due to [hydrogen coordinates determination limitations](lexicon-techniques), water molecules usually appear as single oxygen atoms spheres with this representation. 
Bond assignement is infered from the amino acid or nucleotide name in polymers, and should be provided in the coordinate file for every other compound. If not present, a bonding computation is performed and might lead to discrepant results.