<?php
include "utils.php";

class Pagina{
    public string $url;
    private array $meta;
    public array $data;
    public string $content;

    public function __construct(string $url)
    {
        $this->url = $url;
        $content = utils::getUrlContents($url);
        try{
            $this->meta = utils::getUrlData($url, $content);
        }catch(Error){
            $this->meta = [
                "title"=> "no title",
                "metaTags"=> []
            ];
        }
        $contenido = $this->getBody($content);
        $lastModified = utils::getLastModified($url) ?? date("Y-m-d H:i:s"); // Fecha actual como fallback
        $contentSize = strlen($content) ?: 0;
        $this->data = [
            'id' => uniqid(), // Generar un ID único para el documento
            'title' => $this->meta["title"],
            //Si la pagina ya tiene descripcion, entonces usarla, si no, sacarla del contenido de la pagina
            'content' => isset($this->meta["metaTags"]["description"]) ?$this->meta["metaTags"]["description"]["value"]: substr($contenido,0,100),
            'url' => $url,
            'keywords_s'=> utils::palabrasClave($contenido, 20, $this->meta),
            'date' => $lastModified,
            'size' => $contentSize,

            //'icon' => "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=$url&size=128"
            'icon'=> utils::getFavicon($this->url, $content)
        ];
        $this->content = $content;
        
    }

    public function print(): void{
        echo "<pre>";
        var_dump($this->data);
        echo "</pre>"; 
    }
    
    public function getBody($file = null): string{
        if($file == null){
            $context = utils::getContex();
            $file = file_get_contents($this->url, false, $context);
        }
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($file);
        libxml_use_internal_errors(false);
        $bodies = $dom->getElementsByTagName('body');
        assert($bodies->length === 1);
        $stringbody = $dom->saveHTML($bodies[0]);
        $stringbody = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $stringbody);

        $html = new \Html2Text\Html2Text($stringbody);
        $contenido = $html->getText();
        $contenido = preg_replace('/^.*\[(http|https|s|\/\/).*?\].*$/m', '', $contenido);
        $contenido = preg_replace('/\s+/', ' ', preg_replace('/[^a-zA-ZáéíóúÁÉÍÓÚ]+/u',' ', $contenido));
        return  $contenido;
       
    }

    public function getUrls(){

        $dom = new DOMDocument();
        @$dom->loadHTML($this->content); // Ignora los errores de HTML mal formado
        $links = $dom->getElementsByTagName('a');
        $urls = [];
        $parsedUrl = parse_url($this->url);
        foreach ($links as $link) {
            $href = $link->getAttribute('href');
           
            $tipo = utils::urlType($href);
            switch($tipo){
                case 'ref':
                    break;
                case 'abs':
                    if($parsedUrl["scheme"]."://".$parsedUrl['host'] == $href){
                        break;
                    }
                    $actualhref = parse_url($href);

                    if(!isset($actualhref['host'])){break;}
                    if($actualhref['host'] == $parsedUrl['host']){
                        $urls[] = $href;
                    }
                    break;
                case 'rel':
                    if(str_contains($href, "javascript") || empty($href) || $href == "/"){
                        break;
                    }
                    $path = isset($parsedUrl['path']) ? $parsedUrl['path']: "";
                    $path = ($path == "/") ? "": $path;
                    if ($href[0] !== '/') {
                        $href = '/' . $href;
                    }
                    $href =  $parsedUrl["scheme"]."://".$parsedUrl['host'].$href;
                    $parsedref = parse_url($href);
                    $href = $parsedref["scheme"]."://".$parsedref['host'].$parsedref["path"];
                    $urls[] = (string) $href;
                    break;
            }
        }
        
        return array_unique($urls, SORT_STRING);
    }

}



?>