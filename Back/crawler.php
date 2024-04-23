<?php
include("../Back/http.php");
include("../Back/parse.php");
include("../Back/addresses.php");
include("../Back/httpCodes.php");
require '../vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use ICanBoogie\Inflector;
use voku\helper\StopWords;

set_time_limit(300);
//header('Content-Type: application/xml');
set_time_limit(300);
//header('Content-Type: application/xml');
class WebCrawler
{
    private $client;
    private $baseDomain;
    private $maxDepth;
    private $visitedUrls;
    private $urlsToCrawl;

    public function __construct($startUrl, $maxDepth = 5)
    {
        $this->client = new Client();
        $this->baseDomain = parse_url($startUrl, PHP_URL_HOST);
        $this->maxDepth = $maxDepth;
        $this->visitedUrls = [];
        $this->urlsToCrawl = [[$startUrl, 0]]; // Guarda la profundidad de cada URL
    }

    private function get_title($content)
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($content); // Ignora los errores de HTML mal formado
        $titles = $dom->getElementsByTagName('title');
        if ($titles->length > 0) {
            return $titles->item(0)->nodeValue;
        }
        return null;
    }

    private function indexContentToSolr($content, $url)
    {
        $solrUrl = 'http://localhost:8983/solr/ProyectoFinal/update/?commit=true';
        //Obtener los datos en el <head> de la pagina
        $meta = getUrlData($url);
        
        //Obtener los datos en el <head> de la pagina
        $meta = getUrlData($url);
        
        // Datos a indexar en Solr con el título real del contenido
        $contenido = contenido($content);
        $data_to_index = [
            'id' => uniqid(), // Generar un ID único para el documento
            'title' => $meta["title"],
            //Si la pagina ya tiene descripcion, entonces usarla, si no, sacarla del contenido de la pagina
            'content' => isset($meta["metaTags"]["description"]) ?$meta["metaTags"]["description"]["value"]: substr($contenido,0,1000),
            'title' => $meta["title"],
            //Si la pagina ya tiene descripcion, entonces usarla, si no, sacarla del contenido de la pagina
            'content' => isset($meta["metaTags"]["description"]) ?$meta["metaTags"]["description"]["value"]: substr($contenido,0,1000),
            'url' => $url,
            'keywords_s'=> palabrasClave($contenido, 20, $meta),
            'language'=> lenguaje($contenido),
            'icon' => "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=$url&size=128"
        ];
        echo "<pre>";
        var_dump($data_to_index);
        echo "</pre>";
        // Conexión y envío de datos a Solr
        //$client = new Client();
        $url = $solrUrl;
        $data = json_encode([$data_to_index]);

        // use key 'http' even if you send the request to https://...
        $options = [
            'http' => [
                'timeout' => 3, // 3 segundos
                'header' => array(
                    "Content-type: application/json",
                    "Connection: close"
                ),
                'method' => 'POST',
                'content' => $data,
            ],
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        if ($result === false) {
            return 'Error al indexar datos en Solr: ';
        }else{
            return 'Datos indexados correctamente en Solr.';
        //$client = new Client();
        $url = $solrUrl;
        $data = json_encode([$data_to_index]);

        // use key 'http' even if you send the request to https://...
        $options = [
            'http' => [
                'timeout' => 3, // 3 segundos
                'header' => array(
                    "Content-type: application/json",
                    "Connection: close"
                ),
                'method' => 'POST',
                'content' => $data,
            ],
        ];

        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        if ($result === false) {
            return 'Error al indexar datos en Solr: ';
        }else{
            return 'Datos indexados correctamente en Solr.';
        }
    }

    public function startCrawling()
    {
        while (!empty($this->urlsToCrawl)) {
            [$url, $depth] = array_shift($this->urlsToCrawl);

            if (!in_array($url, $this->visitedUrls) && $depth <= $this->maxDepth) {
                $this->crawlUrl($url);
                $this->visitedUrls[] = $url;
            }
        }
    }

    private function crawlUrl($url)
    {
        try {
            $response = $this->client->request('GET', $url);
            $statusCode = $response->getStatusCode();

            if ($statusCode === 200) {
                $body = $response->getBody()->getContents();
                echo "URL: $url";

                // Indexar el contenido en Solr
                $indexingResult = $this->indexContentToSolr($body, $url);
                echo "Resultado de indexación en Solr: $indexingResult<br>";

                // Continuar con la extracción de enlaces
                $this->extractAndQueueLinks($body, $url);
            }
        } catch (RequestException $e) {
            echo "Error al obtener la URL $url: " . $e->getMessage();
        }
    }

    private function extractAndQueueLinks($content, $baseUrl)
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($content); // Ignora los errores de HTML mal formado
        $links = $dom->getElementsByTagName('a');

        foreach ($links as $link) {
            $href = $link->getAttribute('href');
            $absoluteUrl="";
            //Hay paginas que hacen referencia a si mismas, pero con url referenciales, (/casa/noticias)
            //estas hay que convertirlas en url absolutas (https://pagina.com/casa/noticias)
            //Hay paginas que hacen referencia a si mismas, pero con url referenciales, (/casa/noticias)
            //estas hay que convertirlas en url absolutas (https://pagina.com/casa/noticias)
            if (strpos($href,'http') !== false) {
                $absoluteUrl=$href;
            } else {
                $absoluteUrl = $this->resolveUrl($href, $baseUrl);
            }
            //Si no es una seccion en la misma pagina, Es una url valida y no estaba ya en la cola.
            //Entonces añadela a la cola
            if (strpos($href,'#') == false && $this->isValidUrl($absoluteUrl) && !$this->urlAlreadyQueued($absoluteUrl)) {
            //Si no es una seccion en la misma pagina, Es una url valida y no estaba ya en la cola.
            //Entonces añadela a la cola
            if (strpos($href,'#') == false && $this->isValidUrl($absoluteUrl) && !$this->urlAlreadyQueued($absoluteUrl)) {
                $this->urlsToCrawl[] = [$absoluteUrl, $this->getCurrentDepth($baseUrl) + 1];
            }
        }
    }

    private function resolveUrl($href, $baseUrl)
    {
        $href = trim($href);
        $baseUrl = trim($baseUrl);
        return rtrim($baseUrl, '/') . '/' . ltrim($href, '/');
    }

    private function isValidUrl($url)
    {
        $parsedUrl = parse_url($url);
        return isset($parsedUrl['host']) && $parsedUrl['host'] === $this->baseDomain;
    }

    private function urlAlreadyQueued($url)
    {
        return in_array($url, array_column($this->urlsToCrawl, 0));
    }

    private function getCurrentDepth($url)
    {
        foreach ($this->urlsToCrawl as $u) {
            if ($u[0] === $url) {
                return $u[1];
            }
        }
        return 0;
    }
}

function palabrasClave($content, int $cantidad,$meta = []){
    //Limpiar texto,
    if(isset($meta["metaTags"]["keywords"])){
        return explode(",",$meta["metaTags"]["keywords"]["value"]);
    }else{
    $sw = new StopWords();
    $resultado = contenido($content);//Quitar tags de html
    $resultado = strtolower($resultado);
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
    return $regresar;
    }
}

function page_title($body) {
    $tags = [
        'title',
        'h1',
        'h2',
        'h3',
        'h4',
        'p',
        'div'
    ];
    $res = "";
    $i=0;
    for($i = 0; $i< sizeof($tags); $i++){
        $res = preg_match("/<$tags[$i]>(.*)<\/$tags[$i]>/siU", $body, $title_matches);
        if(!empty($res)){
            $title = preg_replace('/\s+/', ' ', $title_matches[1]);
            $title = trim($title);
            return $title;
        }
    }
        return null;
}

function contenido($content){
    $html = new \Html2Text\Html2Text($content);
    $contenido = $html->getText();
    $contenido = preg_replace('/\s+/', ' ', preg_replace('/[^a-zA-ZáéíóúÁÉÍÓÚ\s]+/u',' ', $contenido));
    //$contenido = eliminarTildes($contenido);
    return $contenido; //Quitar tags de html
}

function lenguaje($contenido){
    $detector = new LanguageDetector\LanguageDetector();
    $detectedLanguage = $detector->evaluate(substr($contenido, 0, 1000))->getLanguage();
    
    // Si no se puede detectar el idioma, retornar un idioma por defecto
    if ($detectedLanguage === null || ($detectedLanguage->getCode() !== 'es' && $detectedLanguage->getCode() !== 'en')) {
        return 'es'; // Puedes cambiar esto a 'en' si prefieres un idioma diferente por defecto
    }

    echo " Lenguaje: " . $detectedLanguage->getCode();
    echo "<br>";
    return $detectedLanguage->getCode();
}

// Uso del WebCrawler
// URLs de inicio


$startUrls = [
    'https://www.xataka.com.mx/',
    'https://es.wikipedia.org/'
];

$maxDepth = 2;
foreach ($startUrls as $startUrl) {
    $crawler = new WebCrawler($startUrl, $maxDepth);
    $crawler->startCrawling();
}

function getUrlData($url) {
    $result = false;
    
    $contents = getUrlContents($url);
    
    if (isset($contents) && is_string($contents)) {
        $title = null;
        $metaTags = null;
    
        preg_match('/<title>([^>]*)<\/title>/si', $contents, $match);
    
        if (isset($match) && is_array($match) && count($match) > 0) {
            $title = strip_tags($match[1]);
        }
    
        preg_match_all('/<[\s]*meta[\s]*name="?' . '([^>"]*)"?[\s]*' . 'content="?([^>"]*)"?[\s]*[\/]?[\s]*>/si', $contents, $match);
    
        if (isset($match) && is_array($match) && count($match) == 3) {
            $originals = $match[0];
            $names = $match[1];
            $values = $match[2];
            //Es una funcion copiada de internet, no le hagan caso a los errores
            if (count($originals) == count($names) && count($names) == count($values)) {
                $metaTags = array();
    
                for ($i = 0, $limiti = count($names); $i < $limiti; $i++) {
                    $metaTags[$names[$i]] = array(
                        'html' => htmlentities($originals[$i]),
                        'value' => $values[$i]
                    );
                }
            }
        }
    
        $result = array(
            'title' => $title,
            'metaTags' => $metaTags
        );
    }
    return $result;
}
    
    
function getUrlContents($url, $maximumRedirections = null, $currentRedirection = 0) {
    $result = false;
    
    $contents = @file_get_contents($url);
    
    // Check if we need to go somewhere else
    
    if (isset($contents) && is_string($contents)) {
        preg_match_all('/<[\s]*meta[\s]*http-equiv="?REFRESH"?' . '[\s]*content="?[0-9]*;[\s]*URL[\s]*=[\s]*([^>"]*)"?' . '[\s]*[\/]?[\s]*>/si', $contents, $match);
    
        if (isset($match) && is_array($match) && count($match) == 2 && count($match[1]) == 1) {
            if (!isset($maximumRedirections) || $currentRedirection < $maximumRedirections) {
                return getUrlContents($match[1][0], $maximumRedirections, ++$currentRedirection);
            }
    
            $result = false;
        } else {
            $result = $contents;
        }
    }
    
    return $contents;
}