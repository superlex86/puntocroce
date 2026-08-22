<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['username']) || empty($data['password'])) {
    echo json_encode(["success" => false, "message" => "Compila tutti i campi."]);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
$stmt->execute([$data['username'], $data['username']]);
$user = $stmt->fetch();

if ($user && password_verify($data['password'], $user['password_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    echo json_encode([
        "success" => true,
        "user" => ["id" => $user['id'], "username" => $user['username']]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Credenziali errate."]);
}
