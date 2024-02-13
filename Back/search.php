<?php
header("Access-Control-Allow-Origin: *");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $query = $_GET['q'] ?? '';
    $faceta = $_GET['f'] ?? '';

    if (!empty($query)) {
        $baseurl = "http://localhost:8983/solr/ProyectoFinal/select";
        $rows = 30;
        $start = $_GET['start'] ?? 0;
        if(!empty($faceta)){
            $faceta = "AND keywords_s:$faceta";
        }
        $mensaje = [
            "defType" => "lucene",
            "facet.field" => 'keywords_s',
            'facet.sort' => 'count',
            'facet' => 'true',

            'indent' => 'true',
            'q.op' => 'OR',
            'q' => "(title:($query) OR content:($query) OR keywords_s:($query) )$faceta ",
            //'q' => "title:$query~ OR content:$query~ OR keywords_s:$query",
            'start' => 0,
            'rows' => $rows,
            'sort' => 'score desc',
            'sw' => 'true',
            'useParams' => ''
        ];
        $resultado = apiMensaje($baseurl, $mensaje);

        //facetas
        $facets = $resultado["facet_counts"]["facet_fields"]['keywords_s'];
        $resultado = $resultado["response"]['docs'];


        
        echo "Estás son palabras que se han buscado recientemente:<br>";
        $numFacetas = 10;
        for($i =0; $i< ($numFacetas* 2); $i++){
            if(strlen($facets[$i])<=3 && $i%2==0){
                $i+=2;
            }
            echo "<input type='radio' id='$facets[$i]' name='f' value='$facets[$i]'>";
            $cantidad =$facets[$i+1];
            echo "<label for='$facets[$i]'>$facets[$i] $cantidad</label><br>";
            $i++;
        }

        
        foreach ($resultado as $pagina) {
            echo "<h3><b>";
            echo $pagina["title"][0];
            echo "</b>";
            $url =  $pagina["url"][0];
            echo "<a href='$url'> ir</a>";
            echo "<br>";
            echo "</h3>";
            echo "     ";
       
    
            echo "     ";
            $content = $pagina["content"];
            $words = str_word_count($content, 1);
            // Limitar el contenido a 100 palabras
            $limitedContent = implode(' ', array_slice($words, 0, 100));
            // Imprimir el contenido limitado a 100 palabras
            echo $limitedContent;
            echo "     ";
            echo "<br>";
        }
      

        //echo "<pre>";
        //var_dump($facets);
        //echo "</pre>";
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
