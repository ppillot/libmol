<?php
ob_start();
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/javascript; charset=utf-8');

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
function removeAccents($str) {
	$search = explode(",","ç,æ,œ,á,é,í,ó,ú,à,è,ì,ò,ù,ä,ë,ï,ö,ü,ÿ,â,ê,î,ô,û,å,e,i,ø,u");
	$replace = explode(",","c,ae,oe,a,e,i,o,u,a,e,i,o,u,a,e,i,o,u,y,a,e,i,o,u,a,e,i,o,u");
	$strWOAccents = str_replace($search, $replace, $str);
	return $strWOAccents;
}
	//this was used by fetch method in javascript : sends a json
 	// $data = json_decode(file_get_contents('php://input'), true);
	// $data['txt'] = $_REQUEST['txt'];
	// error_log($data['txt']);
	if (isset($_REQUEST['txt'])) {
	
 		$sql = $db->prepare("SELECT titre,id,fichier FROM molecule where molecule.FTINDEX LIKE ? ORDER BY molecule.titre");
		$sql->execute(array("%".removeAccents($_REQUEST['txt'])."%"));
		$result = array();
		while ($row = $sql->fetch(PDO::FETCH_ASSOC)) {
			array_push($result, array('label'=>$row['TITRE'], 'molId'=>$row['ID'], 'file'=>$row['FICHIER']));
		}
		echo json_encode($result) ; 
		
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
		echo json_encode($result) ; 
						
	} else if (isset($_REQUEST['meta'])) {
		$sql = $db->prepare("SELECT meta FROM molecule WHERE id = ?");
		$sql->execute(array($_REQUEST['meta']));
		$row = $sql->fetch(PDO::FETCH_ASSOC);
		$result = $row['META'];
		echo $result;
	}
	
	ob_end_flush();

?>