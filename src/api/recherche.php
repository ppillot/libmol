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
	// error_log($data['txt']);
	if (isset($data['txt'])) {
	
 		$sql = $db->prepare("SELECT titre,id,fichier FROM molecule where molecule.FTINDEX LIKE ? ORDER BY molecule.titre");
		$sql->execute(array("%".$data['txt']."%"));
		$result = array();
		while ($row = $sql->fetch(PDO::FETCH_ASSOC)) {
			array_push($result, array('label'=>$row['TITRE'], 'molId'=>$row['ID'], 'file'=>$row['FICHIER']));
		}
	} else if (isset($_REQUEST['id'])) {
		$sql = $db->prepare("SELECT titre,id,source,molecule.description,modification,adresse,idsource FROM molecule WHERE id = ?");
		$sql->execute(array($_REQUEST['id']));
		$row = $sql->fetch(PDO::FETCH_ASSOC);
		$result = array('label'=>$row['TITRE'], 
						'molId'=>$row['ID'], 
						'source'=>$row['FICHIER'], 
						'description'=>$row['DESCRIPTION'], 
						'modification'=>$row['MODIFICATION'], 
						'adresse'=>$row['adresse'], 
						'molIdSource'=>$row['IDSOURCE']);
	}
	
	header('Access-Control-Allow-Origin: *');
    header('Content-Type: text/javascript; charset=utf-8');
	echo json_encode($result) ; 
	ob_end_flush();

?>