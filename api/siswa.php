<?php
/**
 * Endpoint Data Siswa & Rombel Kelas 11 SMKN 1 Mejayan
 */

require_once __DIR__ . '/config.php';

$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    json_response(['success' => false, 'message' => 'Metode HTTP harus GET'], 405);
}

// 1. Ambil detail siswa tunggal jika parameter nisn disertakan
if (isset($_GET['nisn'])) {
    $nisn = trim($_GET['nisn']);
    $stmt = $db->prepare("SELECT * FROM siswa WHERE nisn = ?");
    $stmt->execute([$nisn]);
    $student = $stmt->fetch();

    if (!$student) {
        json_response(['success' => false, 'message' => 'Siswa tidak ditemukan'], 404);
    }

    // Riwayat asesmen
    $stmtAsmt = $db->prepare("SELECT * FROM asesmen_jawaban WHERE siswa_nisn = ? ORDER BY completed_at DESC");
    $stmtAsmt->execute([$nisn]);
    $asmts = $stmtAsmt->fetchAll();
    foreach ($asmts as &$a) {
        $a['answers'] = json_decode($a['answers_json'], true);
    }

    // Catatan konselor
    $stmtNote = $db->prepare("SELECT * FROM catatan_konselor WHERE siswa_nisn = ? LIMIT 1");
    $stmtNote->execute([$nisn]);
    $note = $stmtNote->fetch();

    json_response([
        'success' => true,
        'student' => $student,
        'assessments' => $asmts,
        'counselorNote' => $note ? $note['catatan'] : null
    ]);
}

// 2. Filter berdasarkan kelas / rombel
if (isset($_GET['kelas'])) {
    $kelas = trim($_GET['kelas']);
    $stmt = $db->prepare("SELECT s.*, a.total_score, a.level, a.completed_at 
                          FROM siswa s 
                          LEFT JOIN (
                              SELECT siswa_nisn, total_score, level, completed_at
                              FROM asesmen_jawaban 
                              WHERE id IN (SELECT MAX(id) FROM asesmen_jawaban GROUP BY siswa_nisn)
                          ) a ON s.nisn = a.siswa_nisn
                          WHERE s.kelas = ? 
                          ORDER BY s.nama ASC");
    $stmt->execute([$kelas]);
    $students = $stmt->fetchAll();
    json_response(['success' => true, 'count' => count($students), 'students' => $students]);
}

// 3. Pencarian nama / NISN
if (isset($_GET['search'])) {
    $q = '%' . trim($_GET['search']) . '%';
    $stmt = $db->prepare("SELECT s.*, a.total_score, a.level, a.completed_at 
                          FROM siswa s 
                          LEFT JOIN (
                              SELECT siswa_nisn, total_score, level, completed_at
                              FROM asesmen_jawaban 
                              WHERE id IN (SELECT MAX(id) FROM asesmen_jawaban GROUP BY siswa_nisn)
                          ) a ON s.nisn = a.siswa_nisn
                          WHERE s.nama LIKE ? OR s.nisn LIKE ? 
                          ORDER BY s.nama ASC LIMIT 50");
    $stmt->execute([$q, $q]);
    $students = $stmt->fetchAll();
    json_response(['success' => true, 'count' => count($students), 'students' => $students]);
}

// 4. Daftar semua siswa (500 siswa) dengan status asesmen terbarunya
$stmt = $db->query("SELECT s.*, a.total_score, a.level, a.completed_at 
                    FROM siswa s 
                    LEFT JOIN (
                        SELECT siswa_nisn, total_score, level, completed_at
                        FROM asesmen_jawaban 
                        WHERE id IN (SELECT MAX(id) FROM asesmen_jawaban GROUP BY siswa_nisn)
                    ) a ON s.nisn = a.siswa_nisn
                    ORDER BY s.kelas ASC, s.nama ASC");
$students = $stmt->fetchAll();

json_response([
    'success' => true,
    'total' => count($students),
    'students' => $students
]);
