<?php
$url = 'https://api.football-data.org/v4/competitions/CL/teams';
$apiKey = '25d1021df1ca4a8cafe6c9b9e3088f24';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-Auth-Token: ' . $apiKey]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo $response;
?>
