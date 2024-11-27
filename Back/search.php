<?php
include "config.php";
include "consulta.php";
//"facet.field" => 'title',
//"facet.contains" => $_GET['q'],
 header("Access-Control-Allow-Origin: *");
 header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = $_GET['q'] ?? '';
    $query = consulta::prepararConsulta($query);
    $faceta = $_GET['f'] ?? '';
    $f = $_GET['f'] ?? '';
    if (!empty($query)) {
        $baseurl = "http://$SOLR_URL/solr/ProyectoFinal/select";
        $rows = 100;
        $start = $_GET['start'] ?? 0;
        if (!empty($faceta)) {
            $faceta = "AND keywords_s:$faceta";
        }
        $mensaje = [
            "defType" => "lucene",
            "facet.field" => 'title',
            "facet.contains" => $f,
            "facet.contains.ignoreCase"=>'true',
            "fq"=>"title:*$f*",
            'facet.sort' => 'count',
            'facet' => 'true',
            'indent' => 'true',
            'q.op' => 'OR',
            'q' => "(title:($query) OR content:($query) OR keywords_s:($query) ) ",
            'start' => 0,
            'rows' => $rows,
            'sort' => 'score desc',
            'sw' => 'true',
            'useParams' => ''
        ];
        $resultado = apiMensaje($baseurl, $mensaje);
        //echo json_encode($resultado);
        // Obtener las URLs de las páginas
        $facets = $resultado["facet_counts"]["facet_fields"]['title'];
        //$resultado = $resultado["response"]['docs'];
        $urls = [];
        foreach ($resultado["response"]['docs'] as $pagina) {
            $urls[] = $pagina["url"][0];
        }
        $index = 0;
        // Dividir las URLs en lotes para procesamiento en paralelo
        $batch_size = 30;
        $batches = array_chunk($urls, $batch_size);

        // Array para almacenar los resultados finales en formato JSON
        $json_results = ['results' => []];

        foreach ($resultado["response"]['docs'] as $pagina) {
                // Obtener el título de la página
                $title = isset($pagina["title"][0]) ? $pagina["title"][0] : '';
                $snippet = isset($pagina["content"][0]) ? $pagina["content"][0] : '';
                $title = isset($pagina["title"][0]) ? $pagina["title"][0] : '';
                // Obtener el contenido del snippet
                // URL del logo (icono)
                $logo = isset($pagina["icon"][0]) ? $pagina["icon"][0] : '';
                $url = isset($pagina["url"][0]) ? $pagina["url"][0] : '';
                // Construir el resultado para esta página en formato JSON
                $json_results['results'][] = [
                    'index' => (string) $index,
                    'value' => $title,
                    'id' => $pagina["content"],
                    'icon_url' => $pagina["icon"],
                    'url' => $url
                ];
                $index++;
            
        }


        // Agregar las facetas al resultado final
        if(!$index == 0){
            $json_results["categories"] = $facets;
        }else{
            $json_results["categories"]  = null;
        }

        // Convertir el array de resultados en JSON y enviar como respuesta
       //echo $json_results;
        echo json_encode($json_results);
        exit();
    }
}


function apiMensaje($url, $parametros)
{
    $url = $url . "?" . http_build_query($parametros);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);
    curl_close($ch);
    $result = json_decode($output, true);
    return $result;
}

