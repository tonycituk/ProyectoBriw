<?php 
include "pagina.php";


class RobotsParser{
    //private string $baseUrl;
    public array $rules;
    public string $baseUrl;
    public function __construct(string $url)
    {
        $parsedUrl = parse_url($url);
        $baseUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'] . '/robots.txt';
        $contentType = get_headers($baseUrl, true, utils::getContex());
        $contentType = isset($contentType['Content-Type'])? $contentType['Content-Type'] : "no/format";
        if(str_contains($contentType,'text/plain')){
            $this->parse($baseUrl);
        }else{
           $this->rules = [
            ]
            ;
        }
        
    }

    private function parse(string $url): void{
        $content = file_get_contents($url, context: utils::getContex());
        $lines = explode("\n", $content);
        $rules = [];
        $currentUser = "*";

        foreach($lines as $line){
            if (empty($line) || strpos($line, '#') === 0)continue;
            if(strpos($line, "User-Agent") === 0 ||strpos($line, "User-agent") === 0){
                $currentUser = trim(explode(":", $line)[1]);
                $rules[$currentUser] = [];
            }
            if(strpos($line, "Disallow:") === 0){
                
                $rule = explode(": ", $line);
                $rule = isset($rule[1])? $rule[1] : "";
                $rule =preg_quote(trim($rule), "/");
                $rule = str_replace("\*", "[^.]*", $rule);
                $rules[$currentUser]["Disallow"][] = $rule;
            }
        }

        $this->rules  =$rules["*"]["Disallow"];;
        return;
        
    }

    public function isAllowed(string $url){
        $parsed = parse_url($url);
        foreach($this->rules as $rule){
            if(preg_match("/^$rule/", $parsed['path'])){
                return false;
            }
        }
        return true;
    }



    public function prune(array $urls): array{
        $result = []; 
        foreach($urls as $url){
            if($this->isAllowed($url)){
                $result[] = $url;
            }
        }
        return $result;
    }
}

/*
$baseUrl = "https://www.matematicas.uady.mx/";
$pagina = new Pagina($baseUrl);
$test = new RobotsParser($baseUrl);

$referencias = $pagina->getUrls();
$urls = $test->prune($referencias);
echo "<pre>";
var_dump($referencias );
//var_dump($test->rules);
//var_dump($test->isAllowed("https://www.xataka.com.mx/trackback/asdf"));
var_dump($urls);
echo "</pre>";
*/
?>