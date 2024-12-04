<?php
include "consulta.php";
//"facet.field" => 'title',
//"facet.contains" => $_GET['q'],
 header("Access-Control-Allow-Origin: *");
 header('Content-Type: application/json; charset=utf-8');
$boolean_query = false;
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = $_GET['q'] ?? '';
    //$query = consulta::prepararConsulta($query);
    if (!preg_match('/\b(?:AND|OR|NOT)\b/i', $query)) {
        $query = consulta::prepararConsulta($query);
        $boolean_query = true;
    }
    $faceta = $_GET['f'] ?? '';
    $facetType = $_GET['facetType'] ?? '';
    $facetValue = $_GET['facetValue'] ?? '';
    $f = $_GET['f'] ?? '';
    if (!empty($query)) {
        $baseurl = "http://localhost:8983/solr/ProyectoFinal/select";
        $rows = 100;
        $start = $_GET['start'] ?? 0;
        if (!empty($faceta)) {
            $faceta = "AND keywords_s:$faceta";
        }
        $facetQuery = '';
        if (!empty($facetType) && !empty($facetValue)) {
            if ($facetType === 'date') {
                // Asumiendo que facetValue es un rango con el formato "start|end"
                $dates = explode('|', $facetValue);
                if (count($dates) == 2) {
                    $facetQuery = "date:[\"$dates[0]\" TO \"$dates[1]\"]";

                }
            }
            if ($facetType === 'size') {
                // Asumiendo que facetValue es un rango con el formato "start|end"
                $sizes = explode('-', $facetValue);
                if (count($sizes) == 2) {
                    $facetQuery = "size_bytes:[$sizes[0] TO $sizes[1]]";
                }
            }
            if ($facetType === 'site') {
                $facetQuery = "url_str: \"$facetValue\"";
                
            }
        }
        
        //$fq = $boolean_query ? '*:*' : "title:*$f*";
        //$fq = $boolean_query ? '*:*' : (!empty($f) ? "(title:*$f* OR content:*$f* OR keywords_s:*$f*)" : '*:*');
        $fq = $boolean_query ? '*:*' : (!empty($f) ? "title:*$f*" : '*:*');

        $mensaje = [
            /*
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
            */
            "defType" => "lucene",
            "facet.field" => 'title',
            "facet.contains" => $f,
            "facet.contains.ignoreCase" => 'true',
            //"fq" => "title:*$f*",
            "fq" => $fq,

            "facet.sort" => 'count',
            "facet" => 'true',
            "indent" => 'true',
            "q.op" => 'OR',
            "q" => "(title:($query) OR content:($query) OR keywords_s:($query))",
            "start" => 0,
            "rows" => $rows,
            "sort" => 'score desc',
            "sw" => 'true',
            "useParams" => '',
            "json.facet" => json_encode([
                'size' => [
                    'type' => 'range',
                    'field' => 'size_bytes',
                    'start' => 0,
                    'end' => 100000,
                    'gap' => 10000,
                ],
                'date_facet' => [
                    'type' => 'range',
                    'field' => 'date',
                    'start' => 'NOW-1DAY',
                    'end' => 'NOW',
                    'gap' => '+6HOURS',
                ],
                'url_facet' => [
                    'type' => 'terms',
                    'field' => 'url_str',
                    'limit' => 10, // Limita el número de términos devueltos
                    'sort' => 'count', // Ordena por la cantidad de documentos
                ]
            ])
        ];
        if (!empty($facetQuery)) {
            $mensaje["fq"] = "$facetQuery";
        }
        $resultado = apiMensaje($baseurl, $mensaje);
        //echo json_encode($resultado);
        // Obtener las URLs de las páginas
        $facets = $resultado["facet_counts"]["facet_fields"]['title'];
        $facets2 = $resultado["facets"];
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
            $json_results["facets"] = $facets2;
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
    //var_dump($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);
    curl_close($ch);
    $result = json_decode($output, true);
    return $result;
}

