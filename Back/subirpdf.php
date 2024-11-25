<!DOCTYPE html>
<html>
<body>
<a href="../Front/index.html">Atras</a>
<form action="subirPDF.php" method="post" enctype="multipart/form-data">
 <h2> Subir PDF</h2> <br>
  <input type="file" name="archivos[]" accept="file/txt" multiple>
  <br>
  <br>
  <input type="submit" value="Subir archivos" name="subir">
</form>

<?php

header('Access-Control-Allow-Origin: *');

if(!(isset($_FILES["archivos"]) && !empty($_FILES["archivos"]["name"][0]))){
   return;
}

//Quitar cuando se termine
/*
echo '<pre>';
echo var_dump($_FILES["archivos"]);
echo "</pre>";
*/
//--------

?>
</body>
</html>

<?php
require '/vendor/autoload.php';
if(!(isset($_FILES["archivos"]) && !empty($_FILES["archivos"]["name"][0]))){
  return;
}

$server = 'localhost/BRIW/ProyectoBRIW/Back/';
$directorio = 'archivos/';
$archivos = guardarArchivos($directorio);

indexarArchivos($archivos, $directorio);
echo "Archivos indexados";

function guardarArchivos($directorio){
  $archivos = [];
  $cantidad = sizeof($_FILES["archivos"]["name"]);
  for($i =0; $i<$cantidad; $i++){
    
    $nombre = nombreArchivo( $_FILES["archivos"]["name"][$i]);
    echo $nombre;
    if($_FILES["archivos"]["type"][$i]!=="application/pdf"){
      echo "No es un archivo pdf";
      return;
    }
    move_uploaded_file($_FILES["archivos"]["tmp_name"][$i],$directorio.$nombre);
    $archivos[] = $nombre;
  }
  return $archivos;
}

function indexarArchivos($archivos){
  //$invertedIndex = [];
  global $server;
  global $directorio;
  foreach($archivos as $archivo){

    $parser = new Smalot\PdfParser\Parser();
    $pdf = $parser->parseFile($directorio.$archivo);
    $contenido = $pdf->getText();
    

    if($contenido === false) die('Unable to read file: ' . $archivo);
    $contenido  = limpiar($contenido);
    //echo $contenido;

    $url = "http://$server$directorio$archivo";
    $nombre = $archivo;
    $datos= [
        'id' => uniqid(),
        'title'=> $nombre,
        'content'=> "Archivo subido por el usuario",
        'url' => $url,
        'keywords_s'=> palabrasClave($contenido, 20),
        'icon'=> "./pdf.svg",
        'language'=> lenguaje($contenido)
    ];
    var_dump($datos);
    indexarPDF($datos);
}

}
include("../Back/http.php");
include("../Back/parse.php");
include("../Back/addresses.php");
include("../Back/httpCodes.php");
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

function indexarPDF($datos)
    {
        $solrUrl = 'http://localhost:8983/solr/ProyectoFinal/update/?commit=true';
        echo "<pre>";
        //var_dump($datos);
        echo "</pre>";
        // Conexión y envío de datos a Solr
        $client = new Client();
        try {
            $response = $client->request('POST', $solrUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode([$datos]),
            ]);
            $statusCode = $response->getStatusCode();
            if ($statusCode === 200) {
                return 'Datos indexados correctamente en Solr.';
            } else {
                return 'Error al indexar datos en Solr: ' . $response->getReasonPhrase();
            }
        } catch (RequestException $e) {
            return 'Error al indexar datos en Solr: ' . $e->getMessage();
        }
    }



function nombreArchivo(string $nombre){
  $actual = 0;
  $archivo = explode('.',$nombre);
  $devolver = $archivo[0];

  while(file_exists($GLOBALS['directorio'].$devolver.'.'.$archivo[1])){
    $devolver=$archivo[0].$actual;
    $actual ++;
  };
  return $devolver.'.'.$archivo[1];
}

use voku\helper\StopWords;
use ICanBoogie\Inflector;
function palabrasClave($content, int $cantidad,$meta = []){
  //Limpiar texto,
  if(isset($meta["metaTags"]["keywords"])){
      return explode(",",$meta["metaTags"]["keywords"]["value"]);
  }else{
  $sw = new StopWords();
  $resultado = strtolower($content);
  $lenguaje = lenguaje($resultado);

  $listaPV = $sw->getStopWordsFromLanguage($lenguaje);
  $resultado = preg_replace('/\b('.implode('|',$listaPV).')\b/','',$resultado);//Quitar palabras vacias
  $tokens = explode(' ', $resultado); //Dividir en palabras
  
  $normalizado= [];
  $inflector = Inflector::get($lenguaje);
  foreach($tokens as $token){//Normalizar todas las palabras, para eliminar repetidos
      $normal=  $inflector->singularize($token); 
      if(!array_key_exists($normal, $normalizado)){
          $normalizado[$normal] = 1;
      }else{
          $normalizado[$normal]+= 1;
      }
  } 
  //Obtener las mas importantes
  arsort($normalizado);
  
  $palabrasClave = array_slice($normalizado, 0, $cantidad);
  $palabrasClave = array_keys($palabrasClave);
  $regresar = [];
  for($i = 0 ;$i< sizeof($palabrasClave); $i++){
      //$palabrasClave[$i] = preg_replace('/\b('.implode('|',$listaPV).')\b/',' ',$palabrasClave[$i]);
      if($palabrasClave[$i] != "" && strlen($palabrasClave[$i])>4 ){
          $regresar[]  = $inflector->titleize($palabrasClave[$i]);
          
      }
  }
  array_push($regresar,"PDF","pdf");
  return $regresar;
  }
}
function lenguaje($contenido){
    $detector = new LanguageDetector\LanguageDetector();
    $detectedLanguage = $detector->evaluate(substr($contenido, 0, 1000))->getLanguage();
    
    // Si no se puede detectar el idioma, retornar un idioma por defecto
    if ($detectedLanguage === null || ($detectedLanguage->getCode() !== 'es' && $detectedLanguage->getCode() !== 'en')) {
        return 'es'; // Puedes cambiar esto a 'en' si prefieres un idioma diferente por defecto
    }

    echo " Lenguaje: " . $detectedLanguage->getCode();
    return $detectedLanguage->getCode();
}
function limpiar($var) {
  return strtolower(preg_replace('/\s+/', ' ', preg_replace('/[^a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s]+/u', '', $var)));
}
?>