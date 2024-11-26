<?php
include "consulta.php";
include "config.php";

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = $_GET['q'] ?? '';
    $query = consulta::prepararConsulta($query);
    $faceta = $_GET['f'] ?? '';
    $rows = 100;
    $start = $_GET['start'] ?? 0;

    $baseurl = "http://$SOLR_URL/solr/ProyectoFinal/select";

    $mensaje = [
        "defType" => "lucene",
        "facet.field" => 'title',
        "facet.contains" => $faceta,
        "facet.contains.ignoreCase" => 'true',
        "fq" => "title:*$faceta*",
        'facet.sort' => 'count',
        'facet' => 'true',
        'indent' => 'true',
        'q.op' => 'OR',
        'q' => "(title:($query) OR content:($query) OR keywords_s:($query))",
        'start' => $start,
        'rows' => $rows,
        'sort' => 'score desc'
    ];

    $resultado = apiMensaje($baseurl, $mensaje);

    if (!$resultado || !isset($resultado["response"]['docs'])) {
        echo json_encode(["results" => [], "categories" => null]);
        exit();
    }

    $json_results = ['results' => []];
    $facets = $resultado["facet_counts"]["facet_fields"]['title'] ?? [];

    foreach ($resultado["response"]['docs'] as $index => $pagina) {
        $json_results['results'][] = [
            'index' => (string) $index,
            'value' => $pagina["title"][0] ?? '',
            'id' => $pagina["content"][0] ?? '',
            'icon_url' => $pagina["icon"][0] ?? '',
            'url' => $pagina["url"][0] ?? ''
        ];
    }

    $json_results["categories"] = !empty($facets) ? $facets : null;

    echo json_encode($json_results);
    exit();
}

function apiMensaje($url, $parametros)
{
    $url = $url . "?" . http_build_query($parametros);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $output = curl_exec($ch);

    if (curl_errno($ch)) {
        return null;
    }

    curl_close($ch);
    return json_decode($output, true);
}
