<?php
/**
 * Endpoint Pengaturan Sistem & Sesi Asesmen
 * SMKN 1 Mejayan
 */

require_once __DIR__ . '/config.php';

$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM pengaturan");
    $rows = $stmt->fetchAll();
    $settings = [];
    foreach ($rows as $r) {
        $settings[$r['kunci']] = $r['nilai'];
    }
    json_response(['success' => true, 'settings' => $settings]);
}

if ($method === 'POST') {
    $input = get_json_input();
    $kunci = trim($input['kunci'] ?? '');
    $nilai = trim($input['nilai'] ?? '');

    if (empty($kunci)) {
        json_response(['success' => false, 'message' => 'Kunci pengaturan wajib diisi'], 400);
    }

    $stmt = $db->prepare("INSERT INTO pengaturan (kunci, nilai) VALUES (?, ?) ON DUPLICATE KEY UPDATE nilai = ?");
    $stmt->execute([$kunci, $nilai, $nilai]);

    json_response(['success' => true, 'message' => 'Pengaturan berhasil diperbarui']);
}
