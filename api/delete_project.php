<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Non autorizzato."]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$pdo = getDBConnection();
$stmt = $pdo->prepare("DELETE FROM projects WHERE id = ? AND user_id = ?");
if ($stmt->execute([$data['id'], $_SESSION['user_id']])) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Errore durante l'eliminazione."]);
}
