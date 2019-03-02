<?php
ob_start();
header('Access-Control-Allow-Origin: *');

/*
 * connexion à la base de données
 */
$db = new PDO('sqlite:libmol.sqlite');

/*
 * definition des constantes
 */

	if (isset($_REQUEST['id'])) {
	
 		$sql = $db->prepare("SELECT titre,fichier FROM molecule where molecule.ID LIKE ?");
		$sql->execute(array($_REQUEST['id']));
    $row = $sql->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
      ob_end_flush();
      exit('Record not found in database');
    }

    $fileName = $row['FICHIER'];
    $extmmtf = strripos($fileName, '.mmtf.gz');
		$extcif = strripos($fileName, '.cif');
		$extpdb = strripos($fileName, '.pdb');
		$extsdf = strripos($fileName, '.sdf');
    if ($extmmtf !== FALSE) {
      $file = realpath('../static/mol/'.$fileName);
      if (!$file) die('File not found');

      header('Content-Type: application/x-gzip');
      header('Content-Length: '.filesize($file));
      readfile($file);
    } elseif ($extsdf !== FALSE) {
			$file = realpath('../static/mol/'.$fileName);
      if (!$file) die('File not found');

      header('Content-Type: chemical/x-sdf');
      header('Content-Length: '.filesize($file));
      readfile($file);
		} elseif ($extcif !== FALSE) {
			$file = realpath('../static/mol/'.$fileName);
      if (!$file) die('File not found');

      header('Content-Type: chemical/x-cif');
      header('Content-Length: '.filesize($file));
      readfile($file);
		} else {
			$file = realpath('../static/mol/pdb/'.$fileName.'.pdb');
			if (!$file) die('File not found');

      header('Content-Type: chemical/x-pdb');
      header('Content-Length: '.filesize($file));
      readfile($file);
		}

	}
	
	ob_end_flush();

?>