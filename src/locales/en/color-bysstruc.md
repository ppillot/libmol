# Colour by secondary structure

This color scheme reveals specific motifs of amino acids disposition favored in proteic chains, known as **secondary structures**. This option is only available when proteins are selected and displayed with a simplified representation ([backbone](display-backbone) or [cartoon](display-cartoon)).

Secondary structures recognized are:
* [beta strands](lexicon-strand),  
Beta strands (β strands) are linear successions of amino acids generally combined to make planar or cylindrical associations in the protein structure.
* [turns](lexicon-turn),  
Turns are brutal change of direction in the orientation of an amino acids chain.
* [alpha helices](lexicon-helix),  
Alpha helix (α helix) appears when the amino acid chain coils along an axis. Alpha helix contains an average of 3.6 amino acids per helical turn.
* [3-10 helices](lexicon-helix).  
3-10 helix is a shorter motif compared to alpha helix, having only 3 amino-acids per helical turn.

These motifs are stabilized through hydrogen bonding between amino acids.

Labels in the status bar beneath the visualization frame list each secondary structure with its corresponding color.  
Secondary structures assignment to specific portions of the amino acid chain is provided by the molecular file. If this information is not available, a computation is performed using fast Zhang & Skolnick TM-align method, which may lead to discrepant results.