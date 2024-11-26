<!DOCTYPE html>
<html>
<body>
    <a href="../front-end/index.html">Atrás</a>
    <form action="subirPDF.php" method="post" enctype="multipart/form-data">
        <h2>Subir PDF</h2>
        <br>
        <input type="file" name="archivos[]" accept="application/pdf" multiple>
        <br><br>
        <input type="submit" value="Subir archivos" name="subir">
    </form>
</body>
</html>

<?php
require 'vendor/autoload.php'; // Ruta actualizada para autoload
require 'config.php'; // Configuración BASE_URL y SOLR_URL
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Smalot\PdfParser\Parser;
use voku\helper\StopWords;
use ICanBoogie\Inflector;
use LanguageDetector\LanguageDetector;

header('Access-Control-Allow-Origin: *');

// Usar las configuraciones desde el archivo de configuración
$server = $BASE_URL;
$solrUrl = "$SOLR_URL/ProyectoFinal/update/?commit=true"; // Ruta completa a Solr
$directorio = 'archivos/';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['archivos'])) {
    $archivos = guardarArchivos($directorio);

    if ($archivos) {
        indexarArchivos($archivos, $directorio);
        echo "Archivos indexados correctamente.";
    } else {
        echo "No se pudo procesar ningún archivo válido.";
    }
} else {
    echo "No se enviaron archivos.";
}

function guardarArchivos($directorio)
{
    $archivosGuardados = [];
    $cantidadArchivos = count($_FILES['archivos']['name']);

    for ($i = 0; $i < $cantidadArchivos; $i++) {
        $tipo = $_FILES['archivos']['type'][$i];
        $nombreOriginal = $_FILES['archivos']['name'][$i];
        $nombreFinal = generarNombreUnico($directorio, $nombreOriginal);

        if ($tipo !== "application/pdf") {
            echo "El archivo $nombreOriginal no es un PDF válido.";
            continue;
        }

        if (move_uploaded_file($_FILES['archivos']['tmp_name'][$i], $directorio . $nombreFinal)) {
            $archivosGuardados[] = $nombreFinal;
        } else {
            echo "Error al subir el archivo $nombreOriginal.";
        }
    }

    return $archivosGuardados;
}

function generarNombreUnico($directorio, $nombre)
{
    $nombreSinExt = pathinfo($nombre, PATHINFO_FILENAME);
    $extension = pathinfo($nombre, PATHINFO_EXTENSION);
    $contador = 0;

    $nombreFinal = $nombreSinExt . '.' . $extension;
    while (file_exists($directorio . $nombreFinal)) {
        $contador++;
        $nombreFinal = $nombreSinExt . "_$contador." . $extension;
    }

    return $nombreFinal;
}

function indexarArchivos($archivos, $directorio)
{
    global $server, $solrUrl;
    $parser = new Parser();

    foreach ($archivos as $archivo) {
        $rutaArchivo = $directorio . $archivo;
        try {
            $pdf = $parser->parseFile($rutaArchivo);
            $contenido = $pdf->getText();

            if (!$contenido) {
                echo "No se pudo extraer contenido del archivo $archivo.";
                continue;
            }

            $contenidoLimpio = limpiarTexto($contenido);
            $url = "$server/$directorio$archivo";

            $datos = [
                'id' => uniqid(),
                'title' => $archivo,
                'content' => "Archivo subido por el usuario",
                'url' => $url,
                'keywords_s' => generarPalabrasClave($contenidoLimpio, 20),
                'icon' => "./pdf.svg",
                'language' => detectarIdioma($contenidoLimpio)
            ];

            indexarEnSolr($datos);
        } catch (Exception $e) {
            echo "Error procesando el archivo $archivo: " . $e->getMessage();
        }
    }
}

function indexarEnSolr($datos)
{
    global $solrUrl;
    $client = new Client();

    try {
        $response = $client->request('POST', $solrUrl, [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => json_encode([$datos])
        ]);

        if ($response->getStatusCode() === 200) {
            echo "Archivo indexado correctamente: " . $datos['title'];
        } else {
            echo "Error al indexar en Solr: " . $response->getReasonPhrase();
        }
    } catch (RequestException $e) {
        echo "Error al conectar con Solr: " . $e->getMessage();
    }
}

function limpiarTexto($texto)
{
    return strtolower(preg_replace('/\s+/', ' ', preg_replace('/[^a-zA-Záéíóúüñ\s]+/u', '', $texto)));
}

function generarPalabrasClave($contenido, $cantidad)
{
    $sw = new StopWords();
    $inflector = Inflector::get('es');
    $contenido = strtolower($contenido);
    $palabras = array_filter(explode(' ', $contenido));

    $normalizadas = [];
    foreach ($palabras as $palabra) {
        $normalizada = $inflector->singularize($palabra);
        $normalizadas[$normalizada] = ($normalizadas[$normalizada] ?? 0) + 1;
    }

    arsort($normalizadas);
    return array_slice(array_keys($normalizadas), 0, $cantidad);
}

function detectarIdioma($contenido)
{
    $detector = new LanguageDetector();
    $detected = $detector->evaluate(substr($contenido, 0, 1000))->getLanguage();

    return $detected ? $detected->getCode() : 'es';
}
?>
