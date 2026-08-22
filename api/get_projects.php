<?php
require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Non autorizzato."]);
    exit;
}

$pdo = getDBConnection();
$stmt = $pdo->prepare("SELECT id, title, grid_data, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC");
$stmt->execute([$_SESSION['user_id']]);
$projects = $stmt->fetchAll();

echo json_encode(["success" => true, "projects" => $projects]);
