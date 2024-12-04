<?php

include "robotsParser.php";
include "../config.php";
header("Access-Control-Allow-Origin: *");

class Crawler{
    public string $baseUrl;
    private RobotsParser $robot;
    public array $pages;
    private array $visitedUrls;
    public string $path;

    public function __construct(string $url)
    {
        $this->baseUrl = $url;
        $this->robot = new RobotsParser($url);
        $this->visitedUrls = [];
        $this->pages = [];
        $base = parse_url($this->baseUrl);
        $this->path = "pages/" . $base['host'] . ".json";
    }

    public function startCrawl(int $depth, int $length, string $url){
        if ($depth < 0) return;
        echo "$url, Profundidad: $depth";
        echo "<br>";
        if (!in_array($url, $this->visitedUrls)) {
            // Crear página y añadirla al resultado
            try {
                $page = new Pagina($url);
                $this->pages[] = $page->data;
                // Añadir las URLs ya visitadas
                $this->visitedUrls[] = $url;
                // Obtener las URLs a visitar
                $depUrls = $page->getUrls();
            } catch (Exception $e) {
                echo "No visitada: $url";
                echo "<br>";
                $depUrls = [];
            }
            $depUrls = array_slice($depUrls, 0, $length);
            $depUrls = $this->robot->prune($depUrls);
            foreach ($depUrls as $actualUrl) {
                $this->startCrawl($depth - 1, $length, $actualUrl);
            }
        }
    }

    public function printResults(){
        $data = json_encode($this->pages);
        $file = fopen($this->path, "w");
        fwrite($file, $data);
        fclose($file);
        return utils::indexContentToSolr($this->path);
    }
}

if (isset($_GET['url']) && filter_var($_GET['url'], FILTER_VALIDATE_URL)) {
    $url = $_GET['url'];
    $tremendoCrawler = new Crawler($url);
    // 2 de profundidad
    // 10 enlaces por sitio
    // Máximo de 100 páginas por sitio
    $tremendoCrawler->startCrawl(2, 10, $url);
    echo "<br>";
    echo $tremendoCrawler->printResults();
    utils::savePageIndex($tremendoCrawler->path);
} else {
    echo "Por favor, proporcione una URL válida en el parámetro 'url'.";
}
?>
