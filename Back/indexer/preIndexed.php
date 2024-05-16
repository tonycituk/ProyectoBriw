<?php 
include "utils.php";


$index = "pages/index.txt";
$index = fopen($index, "r");

while (($line = fgets($index)) !== false) {
    $line = trim($line);
    $restul = utils::indexContentToSolr($line);
    echo "$line: $restul";
    echo"<br>";
}







?>