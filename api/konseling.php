<?php
/**
 * Endpoint Layanan Konseling Karier Daring & Catatan Pembimbing
 * SMKN 1 Mejayan
 */

require_once __DIR__ . '/config.php';

$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: Ambil percakapan konseling atau catatan konselor
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    // Ambil daftar sesi aktif untuk Guru BK
    if ($action === 'threads') {
        $sql = "SELECT DISTINCT k.siswa_nisn, s.nama, s.kelas, s.jurusan,
                (SELECT pesan FROM konseling_pesan WHERE siswa_nisn = k.siswa_nisn ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM konseling_pesan WHERE siswa_nisn = k.siswa_nisn ORDER BY created_at DESC LIMIT 1) as last_time
                FROM konseling_pesan k
                INNER JOIN siswa s ON k.siswa_nisn = s.nisn
                ORDER BY last_time DESC LIMIT 50";
        $threads = $db->query($sql)->fetchAll();
        json_response(['success' => true, 'threads' => $threads]);
    }

    $nisn = trim($_GET['nisn'] ?? '');
    if (empty($nisn)) {
        json_response(['success' => false, 'message' => 'NISN siswa wajib disertakan'], 400);
    }

    // Ambil riwayat chat
    $stmtChat = $db->prepare("SELECT * FROM konseling_pesan WHERE siswa_nisn = ? ORDER BY created_at ASC");
    $stmtChat->execute([$nisn]);
    $messages = $stmtChat->fetchAll();

    // Ambil catatan resmi konselor
    $stmtNote = $db->prepare("SELECT * FROM catatan_konselor WHERE siswa_nisn = ? LIMIT 1");
    $stmtNote->execute([$nisn]);
    $note = $stmtNote->fetch();

    json_response([
        'success' => true,
        'messages' => $messages,
        'counselorNote' => $note ? $note['catatan'] : null,
        'counselorName' => $note ? $note['guru_nama'] : null,
        'updatedAt' => $note ? $note['updated_at'] : null
    ]);
}

// 2. POST: Kirim pesan atau simpan catatan
if ($method === 'POST') {
    $input = get_json_input();
    $action = $input['action'] ?? '';

    // A. Kirim Pesan Konseling Daring
    if ($action === 'send_message') {
        $nisn = trim($input['nisn'] ?? '');
        $senderType = trim($input['senderType'] ?? 'siswa'); // 'siswa' atau 'guru'
        $senderName = trim($input['senderName'] ?? '');
        $pesan = trim($input['pesan'] ?? '');

        if (empty($nisn) || empty($pesan)) {
            json_response(['success' => false, 'message' => 'NISN dan isi pesan wajib diisi'], 400);
        }

        $stmt = $db->prepare("INSERT INTO konseling_pesan (siswa_nisn, sender_type, sender_name, pesan) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nisn, $senderType, $senderName, $pesan]);

        json_response([
            'success' => true,
            'message' => 'Pesan konseling berhasil terkirim.',
            'entry' => [
                'id' => $db->lastInsertId(),
                'siswa_nisn' => $nisn,
                'sender_type' => $senderType,
                'sender_name' => $senderName,
                'pesan' => $pesan,
                'created_at' => date('Y-m-d H:i:s')
            ]
        ]);
    }

    // B. Simpan Catatan / Rekomendasi Guru BK
    if ($action === 'save_note') {
        $nisn = trim($input['nisn'] ?? '');
        $guruNama = trim($input['guruNama'] ?? 'Drs. M. Rofik, M.Pd');
        $catatan = trim($input['catatan'] ?? '');

        if (empty($nisn)) {
            json_response(['success' => false, 'message' => 'NISN siswa wajib diisi'], 400);
        }

        // Cek apakah sudah ada catatan sebelumnya
        $stmtCheck = $db->prepare("SELECT id FROM catatan_konselor WHERE siswa_nisn = ?");
        $stmtCheck->execute([$nisn]);
        $existing = $stmtCheck->fetch();

        if ($existing) {
            $stmtUpdate = $db->prepare("UPDATE catatan_konselor SET catatan = ?, guru_nama = ?, updated_at = NOW() WHERE siswa_nisn = ?");
            $stmtUpdate->execute([$catatan, $guruNama, $nisn]);
        } else {
            $stmtInsert = $db->prepare("INSERT INTO catatan_konselor (siswa_nisn, guru_nama, catatan) VALUES (?, ?, ?)");
            $stmtInsert->execute([$nisn, $guruNama, $catatan]);
        }

        json_response([
            'success' => true,
            'message' => 'Catatan konseling Guru BK berhasil diperbarui ke database SQL.'
        ]);
    }

    json_response(['success' => false, 'message' => 'Aksi POST tidak valid'], 400);
}
