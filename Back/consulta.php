<?php


class consulta{
private static function expandSem($palabra) {
    if(empty($palabra)){
        return [];
    }
    $inflexores = [
        "/r/DerivedFrom",
        "/r/RelatedTo",
    ];
    $resultado = [];

    foreach($inflexores as $inflexor){
        $url = "https://api.conceptnet.io/query?node=/c/es/$palabra&rel=$inflexor&limit=10";
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($response, true);
        $data = $data["edges"];
        //var_dump($data);
        $resultado = array_merge($resultado, $data);
    }
    
    
    $labels  = [];
    foreach($resultado as $node){
        if($node["start"]["language"] == "es"){
            $labels[] = $node["start"]["label"];
        }
    }
    $labels = (sizeof($labels)< 1)? [$palabra] : $labels;
    return array_unique($labels);
}

private static function limpiarConsulta($query) {
    // Eliminar caracteres especiales
    $query = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚ\s]/', '', $query);
    // Eliminar espacios adicionales
    $query = trim(preg_replace('/\s+/', ' ', $query));
    return $query;
}

private static function arrToQuery(array $terminos): string{
    if(empty($terminos)){
        return "";
    }
    $retornar = "(". $terminos[0];
    array_shift($terminos);
    foreach($terminos as $termino){
        $retornar.= " OR $termino";
    }
    $retornar.= ")";
    return $retornar;
}

public static function prepararConsulta(string $consulta): string{
    $consulta = consulta::limpiarConsulta($consulta);
    $retornar = "";
    $terminos = explode(" ", $consulta);
    $termino = $terminos[0];
    $termino = strtolower($termino);
    $expansion = consulta::expandSem($termino);
    $contact = consulta::arrToQuery($expansion);
    $retornar.= $contact;
    array_shift($terminos);

    foreach($terminos as $termino){
        $termino = strtolower($termino);
        $expansion = consulta::expandSem($termino);
        $contact = consulta::arrToQuery($expansion);
        $retornar.= " OR ". $contact;
    }
    return $retornar;
}
}
?>
