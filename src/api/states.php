<?php
ob_start();
/*
 * ce script permet de :
 * - id fournit --> récupérer un JSON décrivant un state à partir d'un identifiant de state
 * - json fournit --> stocker le json et renvoyer un identifiant de state
 */

/*
 * connexion à la base de données
 */
$db = new PDO('sqlite:states.sqlite');

/*
 * definition des constantes
 */

 	$data = json_decode(file_get_contents('php://input'), true);
	$result = array();
	
	if (isset($data['id'])) {
	
 		$sql = $db->prepare("SELECT json FROM states where states.id = ?");
		$sql->execute(array($data['id']));
		while ($row = $sql->fetch(PDO::FETCH_ASSOC)) {
			$result = array('json'=>json_decode($row['json']));
		}

	} else if (isset($data['json'])) {
		
		$sql = $db->prepare("INSERT INTO states (json) VALUES (?)");
		$sql->execute(array(json_encode($data['json'])));
		$id = $db->lastInsertId();

		$result = array('id'=>$id);
		
	}
	
	header('Access-Control-Allow-Origin: *');
    header('Content-Type: text/javascript; charset=utf-8');
	echo json_encode($result) ; 
	ob_end_flush();

?>