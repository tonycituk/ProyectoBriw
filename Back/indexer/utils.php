<?php
require '../../vendor/autoload.php';
use ICanBoogie\Inflector;
use voku\helper\StopWords;

class utils{
    public static  function lenguaje(string $contenido): string{
        $detector = new LanguageDetector\LanguageDetector();
        $detectedLanguage = $detector->evaluate(substr($contenido, 0, 1000))->getLanguage();
        
        // Si no se puede detectar el idioma, retornar un idioma por defecto
        if ($detectedLanguage === null || ($detectedLanguage->getCode() !== 'es' && $detectedLanguage->getCode() !== 'en')) {
            return 'es'; // Puedes cambiar esto a 'en' si prefieres un idioma diferente por defecto
        }
        return $detectedLanguage->getCode();
    }

    public static function getUrlContents($url, $maximumRedirections = null, $currentRedirection = 0) {
        $result = false;
        $context = utils::getContex();
        $contents = @file_get_contents($url, false, $context);
        
        // Check if we need to go somewhere else
        
        if (isset($contents) && is_string($contents)) {
            preg_match_all('/<[\s]*meta[\s]*http-equiv="?REFRESH"?' . '[\s]*content="?[0-9]*;[\s]*URL[\s]*=[\s]*([^>"]*)"?' . '[\s]*[\/]?[\s]*>/si', $contents, $match);
        
            if (isset($match) && is_array($match) && count($match) == 2 && count($match[1]) == 1) {
                if (!isset($maximumRedirections) || $currentRedirection < $maximumRedirections) {
                    return utils::getUrlContents($match[1][0], $maximumRedirections, ++$currentRedirection);
                }
        
                $result = false;
            } else {
                $result = $contents;
            }
        }
        return  $contents;
    }

    public static  function getUrlData(string $url, $contents = null): array| bool{
        $result = false;
        if($contents == null){
            $contents = utils::getUrlContents($url);
        }
        if (isset($contents) && is_string($contents)) {
            $title = null;
            $metaTags = null;
        
            preg_match('/<title>([^>]*)<\/title>/si', $contents, $match);
        
            if (isset($match) && is_array($match) && count($match) > 0) {
                $title = strip_tags($match[1]);
            }
        
            preg_match_all('/<[\s]*meta[\s]*name="?' . '([^>"]*)"?[\s]*' . 'content="?([^>"]*)"?[\s]*[\/]?[\s]*>/si', $contents, $match);
        
            if (isset($match) && is_array($match) && count($match) == 3) {
                $originals = (array)$match[0];
                $names = (array)$match[1];
                $values = (array)$match[2];
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

    public static function palabrasClave($content, int $cantidad,$meta = []){
        //Limpiar texto,
        if(isset($meta["metaTags"]["keywords"])){
            return explode(",",$meta["metaTags"]["keywords"]["value"]);
        }else{
        $sw = new StopWords();
        $resultado = $content;//Quitar tags de html
        $resultado = strtolower($resultado);
        $lenguaje = utils::lenguaje($resultado);
    
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

    public static function getFavicon($url, $html) {
    
        // Verificar si se pudo obtener el contenido
        if ($html === false) {
            return null;
        }
    
        // Crear un nuevo DOMDocument
        $dom = new DOMDocument();
    
        // Cargar el HTML en el DOMDocument
        // Suprimir errores y advertencias ya que algunas páginas tienen HTML no válido
        @$dom->loadHTML($html);
    
        // Obtener todas las etiquetas <link>
        $links = $dom->getElementsByTagName('link');
    
        // Buscar la etiqueta <link> con rel="icon" o rel="shortcut icon"
        foreach ($links as $link) {
            $rel = $link->getAttribute('rel');
            if ($rel === 'icon' || $rel === 'shortcut icon' || $rel === 'apple-touch-icon') {
                // Devolver la URL del favicon
                $href = $link->getAttribute('href');
                if (parse_url($href, PHP_URL_SCHEME) === null) {
                    // Si la URL es relativa, hacerla absoluta
                    $parsedUrl = parse_url($url);
                    $base = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
                    if ($href[0] !== '/') {
                        $href = '/' . $href;
                    }
                    $href = $base . $href;
                }
                return $href;
            }
        }
    
        // Si no se encontró la etiqueta <link>, intentar buscar en la ubicación por defecto /favicon.ico
        $parsedUrl = parse_url($url);
        $defaultFavicon = $parsedUrl['scheme'] . '://' . $parsedUrl['host'] . '/favicon.ico';
    
        // Verificar si el favicon por defecto existe
        if (@get_headers($defaultFavicon)[0] === 'HTTP/1.1 200 OK') {
            return $defaultFavicon;
        }
    
        // Si no se encontró ningún favicon
        return null;
    }

    public static function getContex(){
        return stream_context_create(
            array(
                "http" => array(
                    "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
                )
            )
        );
    }

    public static function urlType(string $url): string{
        if (strpos($url, '#') === 0) {
            return 'ref';
        } elseif (filter_var($url, FILTER_VALIDATE_URL)) {
            return 'abs';
        } else {
            return 'rel';
        }
    }
}

?>
