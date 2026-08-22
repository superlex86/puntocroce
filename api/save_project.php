<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Non autorizzato."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (empty($data['title']) || empty($data['grid_data'])) {
    echo json_encode(["success" => false, "message" => "Dati incompleti."]);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("INSERT INTO projects (user_id, title, grid_data) VALUES (?, ?, ?)");
if ($stmt->execute([$_SESSION['user_id'], $data['title'], json_encode($data['grid_data'])])) {
    echo json_encode(["success" => true, "message" => "Progetto salvato con successo."]);
} else {
    echo json_encode(["success" => false, "message" => "Errore durante il salvataggio."]);
}
