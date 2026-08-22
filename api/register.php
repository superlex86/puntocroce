<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
    echo json_encode(["success" => false, "message" => "Tutti i campi sono obbligatori."]);
    exit;
}

$pdo = getDBConnection();

$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->execute([$data['username'], $data['email']]);
if ($stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Username o Email già in uso."]);
    exit;
}

$hash = password_hash($data['password'], PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");

if ($stmt->execute([$data['username'], $data['email'], $hash])) {
    echo json_encode(["success" => true, "message" => "Registrazione avvenuta con successo."]);
} else {
    echo json_encode(["success" => false, "message" => "Errore nella registrazione."]);
}
