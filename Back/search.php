<?php


// Imprimir los estilos CSS dentro de la etiqueta <style>
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = $_GET['q'] ?? '';
    $faceta = $_GET['f'] ?? '';
    if (!empty($query)) {
        $baseurl = "http://localhost:8983/solr/ProyectoFinal/select";
        $rows = 30;
        $start = $_GET['start'] ?? 0;
        if (!empty($faceta)) {
            $faceta = "AND keywords_s:$faceta";
        }
        $mensaje = [
            "defType" => "lucene",
            "facet.field" => 'keywords_s',
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

        // Obtener las URLs de las páginas
        $facets = $resultado["facet_counts"]["facet_fields"]['keywords_s'];
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
        /*/
        foreach ($batches as $batch) {
            $responses = process_batch($batch);
            foreach ($responses as $url => $content) {
                */
                foreach ($resultado["response"]['docs'] as $pagina) {
                        $url = $pagina["url"][0]; // URL de la página

                        // Obtener el título de la página
                        $title = isset($pagina["title"][0]) ? $pagina["title"][0] : '';

                        // Obtener el contenido del snippet
                        
                        // URL del logo (icon)
                        $logo = './pat.svg'; // ¡Ajusta esta ruta a tu imagen local!
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
        $json_results["categories"] = $facets;

        // Convertir el array de resultados en JSON y enviar como respuesta
       
        echo json_encode($json_results);
        exit();
    }
}


// Función para procesar un lote de URL en paralelo
function process_batch($urls) {
    $responses = [];
    $mh = curl_multi_init();

    foreach ($urls as $url) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        curl_multi_add_handle($mh, $ch);
        $responses[$url] = $ch;
    }

    $running = null;
    do {
        curl_multi_exec($mh, $running);
        curl_multi_select($mh);
    } while ($running > 0);

    foreach ($urls as $url) {
        $ch = $responses[$url];
        $content = curl_multi_getcontent($ch);
        $responses[$url] = $content;
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }

    curl_multi_close($mh);
    
    return $responses;
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

