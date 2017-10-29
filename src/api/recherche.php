<?php
ob_start();
/*
 *  démarrage session
 */
//session_start();

/*
 * connexion à la base de données
 */
$db = new PDO('sqlite:libmol.sqlite');

/*
 * definition des constantes
 */
	//this was used by fetch method in javascript : sends a json
 	// $data = json_decode(file_get_contents('php://input'), true);
	$data['txt'] = $_REQUEST['txt'];
	error_log($data['txt']);
	if (isset($data['txt'])) {
	
 		$sql = $db->prepare("SELECT titre,id,fichier FROM molecule where molecule.FTINDEX LIKE ?");
		$sql->execute(array("%".$data['txt']."%"));
		
	} else if (isset($_REQUEST['cat'])) {
		$requete = "SELECT titre,id,fichier FROM molecule where 1=1";
		
		require ("inc/classification.class.php");
		$categories = new classification("chimique.xml");
		//$categories->selid($_GET['cat']);
		$categories->selnoeud('//categorie[@id="'.$_REQUEST['cat'].'"]/descendant::molecule');///descendant::molecule');
		$listeid = $categories->listeAttr('molid');
		if (count($listeid)>0) {
			$in = "";
			//print_r($listeid);
			foreach ($listeid as $id) {
				//echo $id;
				$in .= $id.",";
			}
			$in = substr($in,0,-1);
			$requete .= " AND molecule.id IN ($in)";
		} else $requete .= " AND 0=1";
		$requete .= " ORDER BY molecule.titre";
		
		$sql = $db->prepare($requete);
		$sql->execute(array());
	}
	$result = array();
	while ($row = $sql->fetch(PDO::FETCH_ASSOC)) {
		array_push($result, array('label'=>$row['TITRE'], 'molId'=>$row['ID'], 'file'=>$row['FICHIER']));
	}
	header('Access-Control-Allow-Origin: *');
    header('Content-Type: text/javascript; charset=utf-8');
	echo json_encode($result) ; 
	ob_end_flush();

?>