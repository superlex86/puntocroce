<?php
header('Content-Type: application/json');
session_start();

define('DB_HOST', 'localhost');
define('DB_NAME', 'nomeutente_puntocroce');
define('DB_USER', 'nomeutente_dbuser');
define('DB_PASS', 'LA_TUA_PASSWORD_DB');

function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Errore di connessione al database."]);
        exit;
    }
}
