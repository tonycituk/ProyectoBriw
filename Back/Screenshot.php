<?php
$link = $_GET['link'] ?? 'https://www.google.com/';
//https://www.google.com/
//https://www.xataka.com.mx/categoria/empresas-y-economia
header('Content-type:image/png');
$output=null;
$retval=null;
$imagenName = "Imagen/prueba.jpg";
exec("wkhtmltoimage --width 1600 --height 900 $link $imagenName", $output, $retval); 

readfile($imagenName);

?>