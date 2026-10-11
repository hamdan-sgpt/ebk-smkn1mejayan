<?php
/**
 * Endpoint Otentikasi Siswa & Guru BK
 * e-BK Career Self-Efficacy - SMKN 1 Mejayan
 */

require_once __DIR__ . '/config.php';

$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

if ($method === 'GET' && $action === 'roster_guru') {
    // Ambil daftar guru BK & wali kelas untuk dropdown login/informasi
    $stmt = $db->query("SELECT id, username, nama, role_title, nip FROM guru_bk ORDER BY id ASC");
    $teachers = $stmt->fetchAll();
    json_response(['success' => true, 'teachers' => $teachers]);
}

if ($method !== 'POST') {
    json_response(['success' => false, 'message' => 'Metode HTTP harus POST'], 405);
}

$input = get_json_input();
$action = $input['action'] ?? $action;

// 1. LOGIN SISWA (Berdasarkan NISN & ID)
if ($action === 'login_siswa') {
    $nisn = trim($input['nisn'] ?? '');
    $studentId = intval($input['id'] ?? 0);

    if (empty($nisn) && $studentId <= 0) {
        json_response(['success' => false, 'message' => 'Nomor NISN wajib diisi'], 400);
    }

    if ($studentId > 0) {
        $stmt = $db->prepare("SELECT id, nisn, nis, nama, gender, kelas, jurusan FROM siswa WHERE id = ?");
        $stmt->execute([$studentId]);
        $student = $stmt->fetch();
    } else {
        $stmt = $db->prepare("SELECT id, nisn, nis, nama, gender, kelas, jurusan FROM siswa WHERE nisn = ?");
        $stmt->execute([$nisn]);
        $allMatched = $stmt->fetchAll();
        if (count($allMatched) > 1) {
            json_response([
                'success' => true,
                'multiple' => true,
                'message' => 'Terdapat lebih dari 1 siswa dengan nomor NISN ini. Silakan pilih akun Anda.',
                'candidates' => $allMatched
            ]);
        }
        $student = $allMatched[0] ?? null;
    }

    if (!$student) {
        json_response([
            'success' => false,
            'message' => 'NISN tidak ditemukan dalam basis data 500 siswa Kelas 11 SMKN 1 Mejayan.'
        ], 404);
    }

    // Ambil riwayat asesmen terakhir
    $stmtAsmt = $db->prepare("SELECT * FROM asesmen_jawaban WHERE siswa_nisn = ? ORDER BY completed_at DESC LIMIT 1");
    $stmtAsmt->execute([$nisn]);
    $latestAsmt = $stmtAsmt->fetch();
    if ($latestAsmt) {
        $latestAsmt['answers'] = json_decode($latestAsmt['answers_json'], true);
    }

    // Ambil catatan konselor jika ada
    $stmtNote = $db->prepare("SELECT catatan, guru_nama, updated_at FROM catatan_konselor WHERE siswa_nisn = ? LIMIT 1");
    $stmtNote->execute([$nisn]);
    $note = $stmtNote->fetch();

    json_response([
        'success' => true,
        'user' => [
            'id' => $student['id'],
            'nisn' => $student['nisn'],
            'nis' => $student['nis'],
            'name' => $student['nama'],
            'gender' => $student['gender'],
            'kelas' => $student['kelas'],
            'jurusan' => $student['jurusan'],
            'role' => 'siswa'
        ],
        'assessment' => $latestAsmt ?: null,
        'counselorNote' => $note ? $note['catatan'] : null
    ]);
}

// 2. LOGIN GURU BK / WALI KELAS
if ($action === 'login_guru') {
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        json_response(['success' => false, 'message' => 'Username dan kata sandi wajib diisi'], 400);
    }

    $stmt = $db->prepare("SELECT * FROM guru_bk WHERE username = ?");
    $stmt->execute([$username]);
    $guru = $stmt->fetch();

    if (!$guru) {
        json_response(['success' => false, 'message' => 'Username tidak terdaftar di sistem e-BK'], 401);
    }

    // Verifikasi password (password_verify atau fallback default bk12345)
    $isValid = password_verify($password, $guru['password_hash']) || ($password === 'bk12345');

    if (!$isValid) {
        json_response(['success' => false, 'message' => 'Kata sandi tidak sesuai. Silakan hubungi Koordinator BK'], 401);
    }

    json_response([
        'success' => true,
        'user' => [
            'id' => $guru['id'],
            'username' => $guru['username'],
            'name' => $guru['nama'],
            'roleTitle' => $guru['role_title'],
            'nip' => $guru['nip'],
            'role' => 'guru'
        ]
    ]);
}

// 3. REGISTRASI GURU BK BARU
if ($action === 'register_guru') {
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');
    $nama = trim($input['nama'] ?? '');
    $roleTitle = trim($input['roleTitle'] ?? 'Guru Pembimbing BK');
    $nip = trim($input['nip'] ?? '-');
    $regCode = trim($input['regCode'] ?? '');

    // Cek kode registrasi instansi
    $stmtCode = $db->prepare("SELECT nilai FROM pengaturan WHERE kunci = 'registration_code'");
    $stmtCode->execute();
    $validCode = $stmtCode->fetchColumn() ?: 'BK-MEJAYAN-2026';

    if ($regCode !== $validCode) {
        json_response(['success' => false, 'message' => 'Kode registrasi resmi instansi tidak valid.'], 403);
    }

    if (strlen($username) < 3 || strlen($password) < 5) {
        json_response(['success' => false, 'message' => 'Username minimal 3 karakter dan password minimal 5 karakter.'], 400);
    }

    // Cek apakah username sudah ada
    $stmtCheck = $db->prepare("SELECT id FROM guru_bk WHERE username = ?");
    $stmtCheck->execute([$username]);
    if ($stmtCheck->fetch()) {
        json_response(['success' => false, 'message' => 'Username sudah digunakan oleh akun lain.'], 409);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmtInsert = $db->prepare("INSERT INTO guru_bk (username, nama, role_title, nip, password_hash) VALUES (?, ?, ?, ?, ?)");
    $stmtInsert->execute([$username, $nama, $roleTitle, $nip, $hash]);

    json_response([
        'success' => true,
        'message' => 'Akun Guru BK / Wali Kelas berhasil didaftarkan.',
        'user' => [
            'id' => $db->lastInsertId(),
            'username' => $username,
            'name' => $nama,
            'roleTitle' => $roleTitle,
            'nip' => $nip,
            'role' => 'guru'
        ]
    ]);
}

json_response(['success' => false, 'message' => 'Aksi tidak dikenal'], 400);
