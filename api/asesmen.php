<?php
/**
 * Endpoint Asesmen Multi-Paket Career Self-Efficacy & Bank Soal Real-time
 * SMKN 1 Mejayan - Dibimbing oleh: Drs. M. Rofik, M.Pd
 */

require_once __DIR__ . '/config.php';

$db = get_db();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

// Pastikan tabel paket_asesmen ada jika belum ter-create
$db->exec("CREATE TABLE IF NOT EXISTS `paket_asesmen` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `package_id` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `target_class` VARCHAR(50) NOT NULL DEFAULT 'ALL',
  `deadline` DATETIME NULL,
  `instructions` TEXT NULL,
  `questions_json` MEDIUMTEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

try {
    $db->exec("ALTER TABLE `paket_asesmen` MODIFY COLUMN `status` VARCHAR(20) DEFAULT 'active'");
} catch (Exception $e) {}

// Pastikan kolom package_id ada di asesmen_jawaban
try {
    $db->exec("ALTER TABLE `asesmen_jawaban` ADD COLUMN `package_id` VARCHAR(50) DEFAULT 'active_package'");
} catch (Exception $e) {}

// Pastikan tabel asesmen_riwayat_sesi ada untuk arsip sesi ditutup
$db->exec("CREATE TABLE IF NOT EXISTS `asesmen_riwayat_sesi` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `session_code` VARCHAR(50) NOT NULL UNIQUE,
  `package_id` VARCHAR(50) NOT NULL,
  `package_title` VARCHAR(150) NOT NULL,
  `closed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_peserta` INT(11) NOT NULL DEFAULT 0,
  `rerata_skor` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `data_json` LONGTEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$defaultQuestions = [
    ["id" => "q1", "text" => "Saya yakin dapat mengenali kemampuan dan bakat teknis yang saya miliki untuk mendukung pilihan karier kejuruan.", "dimId" => 1],
    ["id" => "q2", "text" => "Saya yakin dapat menentukan pilihan bidang pekerjaan yang paling sesuai dengan keterampilan kejuruan saya.", "dimId" => 3],
    ["id" => "q3", "text" => "Saya mampu mencari dan menggali informasi standar kualifikasi industri (IDUKA) yang saya minati.", "dimId" => 2],
    ["id" => "q4", "text" => "Saya yakin mampu menguasai keterampilan baru yang dituntut oleh perkembangan teknologi industri saat ini.", "dimId" => 2],
    ["id" => "q5", "text" => "Saya mampu bersikap tenang dan tetap mencari solusi ketika menghadapi kendala dalam praktik kejuruan.", "dimId" => 4],
    ["id" => "q6", "text" => "Saya yakin dapat mengambil keputusan secara mandiri ketika dihadapkan pada beberapa pilihan masa depan (BMW).", "dimId" => 4],
    ["id" => "q7", "text" => "Saya mampu menyusun rencana langkah konkret untuk mencapai target karier pasca lulus dari SMKN 1 Mejayan.", "dimId" => 3],
    ["id" => "q8", "text" => "Saya yakin dapat menyesuaikan diri dengan budaya disiplin dan standar etos kerja di dunia industri.", "dimId" => 4],
    ["id" => "q9", "text" => "Saya mampu menjelaskan keunggulan kompetensi kejuruan yang saya miliki secara percaya diri kepada pihak lain.", "dimId" => 1],
    ["id" => "q10", "text" => "Saya memiliki keyakinan kuat bahwa cita-cita karier yang saya rencanakan dapat tercapai dengan ketekunan.", "dimId" => 3]
];

// -----------------------------------------------------------------------------
// 1. GET REQUESTS
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    // A. Daftar Semua Paket Asesmen (Multi-Paket untuk Guru & Siswa)
    if ($action === 'list_packages') {
        $stmt = $db->query("SELECT * FROM paket_asesmen WHERE status != 'deleted' ORDER BY id ASC");
        $packages = $stmt->fetchAll();

        $resultList = [];
        foreach ($packages as $pkg) {
            $q = json_decode($pkg['questions_json'], true) ?: [];
            $resultList[] = [
                'id' => $pkg['id'],
                'packageId' => $pkg['package_id'],
                'title' => $pkg['title'],
                'targetClass' => $pkg['target_class'],
                'deadline' => $pkg['deadline'],
                'instructions' => $pkg['instructions'],
                'status' => $pkg['status'],
                'questionsCount' => count($q),
                'questions' => $q,
                'createdAt' => $pkg['created_at'] ?? $pkg['updated_at'],
                'updatedAt' => $pkg['updated_at']
            ];
        }

        json_response([
            'success' => true,
            'packages' => $resultList
        ]);
    }

    // B. Ambil Satu Paket Asesmen Tertentu
    if ($action === 'get_package') {
        $pkgId = trim($_GET['package_id'] ?? '');

        if (!empty($pkgId)) {
            $stmt = $db->prepare("SELECT * FROM paket_asesmen WHERE package_id = ? AND status != 'deleted' LIMIT 1");
            $stmt->execute([$pkgId]);
            $pkg = $stmt->fetch();
        } else {
            // Ambil paket aktif pertama atau paket terbaru
            $stmt = $db->query("SELECT * FROM paket_asesmen WHERE status != 'deleted' ORDER BY id ASC LIMIT 1");
            $pkg = $stmt->fetch();
        }

        if (!$pkg) {
            json_response([
                'success' => false,
                'message' => 'Belum ada paket asesmen yang aktif.',
                'package' => null
            ]);
        }

        $questions = json_decode($pkg['questions_json'], true) ?: [];
        json_response([
            'success' => true,
            'package' => [
                'id' => $pkg['id'],
                'packageId' => $pkg['package_id'],
                'title' => $pkg['title'],
                'targetClass' => $pkg['target_class'],
                'deadline' => $pkg['deadline'],
                'instructions' => $pkg['instructions'],
                'status' => $pkg['status'],
                'questionsCount' => count($questions),
                'questions' => $questions,
                'createdAt' => $pkg['created_at'] ?? $pkg['updated_at'],
                'updatedAt' => $pkg['updated_at']
            ]
        ]);
    }

    // C. Riwayat Asesmen Siswa (Semua Paket yang Pernah Dikerjakan Siswa)
    if ($action === 'student_submissions') {
        $nisn = trim($_GET['nisn'] ?? '');
        if (empty($nisn)) {
            json_response(['success' => false, 'message' => 'NISN wajib disertakan'], 400);
        }

        // Ambil riwayat pengerjaan siswa yang masih valid (tidak dari paket yang berstatus deleted)
        $stmt = $db->prepare("SELECT a.*, COALESCE(p.title, 'Asesmen 1: Pemetaan Kesiapan Karier') as package_title, COALESCE(p.status, 'active') as pkg_status
            FROM asesmen_jawaban a
            LEFT JOIN paket_asesmen p ON (a.package_id = p.package_id OR (a.package_id IS NULL AND p.package_id = 'active_package'))
            WHERE a.siswa_nisn = ?
            ORDER BY a.completed_at DESC");
        $stmt->execute([$nisn]);
        $allRows = $stmt->fetchAll();

        // Saring: abaikan jika paket sudah dihapus dari sistem
        $rows = array_values(array_filter($allRows, function($item) {
            return ($item['pkg_status'] ?? '') !== 'deleted';
        }));

        $byPackage = [];
        foreach ($rows as $r) {
            $pkgKey = $r['package_id'] ?: 'active_package';
            if (!isset($byPackage[$pkgKey])) {
                $r['answers'] = json_decode($r['answers_json'], true);
                $byPackage[$pkgKey] = $r;
            }
        }

        json_response([
            'success' => true,
            'submissions' => $rows,
            'byPackage' => $byPackage
        ]);
    }

    // D. Rekapitulasi & Statistik untuk Dasbor Guru BK
    if ($action === 'summary') {
        $totalStudents = $db->query("SELECT COUNT(*) FROM siswa")->fetchColumn();
        $targetPackage = trim($_GET['package_id'] ?? '');

        // Ambil SEMUA submisi untuk pemetaan per-paket di dasbor guru
        $sqlAll = "SELECT a.*, s.nama, s.nis, s.gender, s.kelas, s.jurusan, p.title as package_title
                   FROM asesmen_jawaban a
                   INNER JOIN siswa s ON a.siswa_nisn = s.nisn
                   LEFT JOIN paket_asesmen p ON a.package_id = p.package_id
                   ORDER BY a.completed_at DESC";
        $allSubmissions = $db->query($sqlAll)->fetchAll();

        foreach ($allSubmissions as &$row) {
            $row['answers'] = json_decode($row['answers_json'], true);
            if (empty($row['package_id'])) {
                $row['package_id'] = 'active_package';
            }
        }
        unset($row);

        if (!empty($targetPackage) && $targetPackage !== 'ALL') {
            $assessments = array_values(array_filter($allSubmissions, function($item) use ($targetPackage) {
                return $item['package_id'] === $targetPackage;
            }));
        } else {
            // Submisi terbaru per siswa
            $seen = [];
            $assessments = [];
            foreach ($allSubmissions as $item) {
                if (!isset($seen[$item['siswa_nisn']])) {
                    $seen[$item['siswa_nisn']] = true;
                    $assessments[] = $item;
                }
            }
        }

        $assessedCount = count($assessments);
        $totalScoreSum = 0;
        $counts = [
            'Tinggi' => 0,
            'Sedang' => 0,
            'Perlu Penguatan' => 0
        ];
        $classDistribution = [];

        foreach ($assessments as &$row) {
            $totalScoreSum += intval($row['total_score']);
            
            $lvl = $row['level'];
            if (isset($counts[$lvl])) {
                $counts[$lvl]++;
            }

            $cls = $row['kelas'];
            if (!isset($classDistribution[$cls])) {
                $classDistribution[$cls] = ['total' => 0, 'assessed' => 0, 'tinggi' => 0, 'sedang' => 0, 'rendah' => 0];
            }
            $classDistribution[$cls]['assessed']++;
            if ($lvl === 'Tinggi') $classDistribution[$cls]['tinggi']++;
            if ($lvl === 'Sedang') $classDistribution[$cls]['sedang']++;
            if ($lvl === 'Perlu Penguatan') $classDistribution[$cls]['rendah']++;
        }
        unset($row);

        $avgScore = $assessedCount > 0 ? round($totalScoreSum / $assessedCount, 1) : 0;

        json_response([
            'success' => true,
            'stats' => [
                'totalStudents' => intval($totalStudents),
                'assessedCount' => $assessedCount,
                'percentage' => $totalStudents > 0 ? round(($assessedCount / $totalStudents) * 100, 1) : 0,
                'averageScore' => $avgScore,
                'levels' => $counts,
                'classes' => $classDistribution
            ],
            'assessments' => $assessments,
            'allSubmissions' => $allSubmissions
        ]);
    }

    // E. Daftar Riwayat Sesi Ditutup (Arsip Hasil Asesmen)
    if ($action === 'list_closed_sessions') {
        $stmt = $db->query("SELECT id, session_code, package_id, package_title, closed_at, total_peserta, rerata_skor 
            FROM asesmen_riwayat_sesi ORDER BY closed_at DESC");
        $sessions = $stmt->fetchAll();
        json_response([
            'success' => true,
            'sessions' => $sessions
        ]);
    }

    // F. Ambil Detail Arsip Sesi Tertentu untuk Ekspor Ulang Excel
    if ($action === 'get_closed_session') {
        $code = trim($_GET['session_code'] ?? '');
        $stmt = $db->prepare("SELECT * FROM asesmen_riwayat_sesi WHERE session_code = ? LIMIT 1");
        $stmt->execute([$code]);
        $row = $stmt->fetch();
        if ($row) {
            $row['data'] = json_decode($row['data_json'], true);
            unset($row['data_json']);
            json_response(['success' => true, 'session' => $row]);
        } else {
            json_response(['success' => false, 'message' => 'Arsip sesi tidak ditemukan.'], 404);
        }
    }

    json_response(['success' => false, 'message' => 'Aksi GET tidak valid.'], 400);
}

// -----------------------------------------------------------------------------
// 2. POST REQUESTS
// -----------------------------------------------------------------------------
$input = get_json_input();
$action = $input['action'] ?? $action;

// A. GURU BUAT PAKET ASESMEN BARU (Mandiri & Terpisah)
if ($action === 'create_package') {
    $title = trim($input['title'] ?? '');
    if (empty($title)) {
        json_response(['success' => false, 'message' => 'Judul asesmen wajib diisi.'], 400);
    }

    $packageId = 'pkg_' . time() . '_' . rand(100, 999);
    $targetClass = trim($input['targetClass'] ?? 'ALL');
    $deadline = !empty($input['deadline']) ? date('Y-m-d H:i:s', strtotime($input['deadline'])) : date('Y-m-d H:i:s', strtotime('+14 days'));
    $instructions = trim($input['instructions'] ?? 'Pilihlah skala 1 (Sangat Ragu) sampai 5 (Sangat Yakin) sesuai keyakinan dirimu saat ini.');
    $questions = $input['questions'] ?? [];

    $jsonQuestions = json_encode($questions, JSON_UNESCAPED_UNICODE);

    $stmt = $db->prepare("INSERT INTO paket_asesmen 
        (package_id, title, target_class, deadline, instructions, questions_json, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')");
    $stmt->execute([$packageId, $title, $targetClass, $deadline, $instructions, $jsonQuestions]);

    json_response([
        'success' => true,
        'message' => 'Paket asesmen baru berhasil dibuat di database MySQL!',
        'package' => [
            'id' => $db->lastInsertId(),
            'packageId' => $packageId,
            'title' => $title,
            'targetClass' => $targetClass,
            'deadline' => $deadline,
            'instructions' => $instructions,
            'status' => 'active',
            'questionsCount' => count($questions),
            'questions' => $questions
        ]
    ]);
}

// B. GURU SIMPAN / PERBARUI PAKET ASESMEN TERTENTU
if ($action === 'save_package') {
    $packageId = trim($input['packageId'] ?? ($input['package_id'] ?? 'active_package'));
    $title = trim($input['title'] ?? 'Asesmen Karier');
    $targetClass = trim($input['targetClass'] ?? 'ALL');
    $deadline = !empty($input['deadline']) ? date('Y-m-d H:i:s', strtotime($input['deadline'])) : date('Y-m-d H:i:s', strtotime('+30 days'));
    $instructions = trim($input['instructions'] ?? '');
    $questions = $input['questions'] ?? [];
    $status = trim($input['status'] ?? 'active');

    $jsonQuestions = json_encode($questions, JSON_UNESCAPED_UNICODE);

    // Cek apakah paket sudah ada
    $stmtCheck = $db->prepare("SELECT id FROM paket_asesmen WHERE package_id = ?");
    $stmtCheck->execute([$packageId]);
    $exists = $stmtCheck->fetch();

    if ($exists) {
        $stmt = $db->prepare("UPDATE paket_asesmen SET 
            title = ?, 
            target_class = ?, 
            deadline = ?, 
            instructions = ?, 
            questions_json = ?, 
            status = ?, 
            updated_at = NOW() 
            WHERE package_id = ?");
        $stmt->execute([$title, $targetClass, $deadline, $instructions, $jsonQuestions, $status, $packageId]);
    } else {
        $stmt = $db->prepare("INSERT INTO paket_asesmen 
            (package_id, title, target_class, deadline, instructions, questions_json, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$packageId, $title, $targetClass, $deadline, $instructions, $jsonQuestions, $status]);
    }

    json_response([
        'success' => true,
        'message' => 'Paket asesmen berhasil disimpan ke database MySQL.',
        'package' => [
            'packageId' => $packageId,
            'title' => $title,
            'targetClass' => $targetClass,
            'deadline' => $deadline,
            'instructions' => $instructions,
            'status' => $status,
            'questionsCount' => count($questions),
            'questions' => $questions
        ]
    ]);
}

// C. TUTUP ATAU BUKA SESI ASESMEN SPESIFIK
if ($action === 'toggle_package_status') {
    $packageId = trim($input['packageId'] ?? ($input['package_id'] ?? 'active_package'));
    $status = ($input['status'] ?? 'active') === 'closed' ? 'closed' : 'active';
    
    $stmt = $db->prepare("UPDATE paket_asesmen SET status = ?, updated_at = NOW() WHERE package_id = ?");
    $stmt->execute([$status, $packageId]);
    json_response(['success' => true, 'packageId' => $packageId, 'status' => $status]);
}

// C2. TUTUP SESI ASESMEN, BUAT RANGKUMAN EXCEL & RESET PENGERJAAN SISWA
if ($action === 'close_and_reset_package') {
    $packageId = trim($input['packageId'] ?? ($input['package_id'] ?? 'active_package'));
    $resetAnswers = !empty($input['resetAnswers']); // true / false
    $counselorName = trim($input['counselorName'] ?? 'Drs. M. Rofik, M.Pd');

    // Ambil info paket
    $stmtPkg = $db->prepare("SELECT * FROM paket_asesmen WHERE package_id = ? LIMIT 1");
    $stmtPkg->execute([$packageId]);
    $pkg = $stmtPkg->fetch();

    if (!$pkg) {
        json_response(['success' => false, 'message' => 'Paket asesmen tidak ditemukan.'], 404);
    }

    $pkgTitle = $pkg['title'];

    // Ambil seluruh jawaban siswa untuk paket ini
    if ($packageId === 'active_package') {
        $stmtSub = $db->prepare("SELECT a.*, s.nama, s.nis, s.kelas, s.jurusan, s.gender 
            FROM asesmen_jawaban a
            INNER JOIN siswa s ON a.siswa_nisn = s.nisn
            WHERE (a.package_id = 'active_package' OR a.package_id IS NULL)
            ORDER BY a.completed_at ASC");
        $stmtSub->execute();
    } else {
        $stmtSub = $db->prepare("SELECT a.*, s.nama, s.nis, s.kelas, s.jurusan, s.gender 
            FROM asesmen_jawaban a
            INNER JOIN siswa s ON a.siswa_nisn = s.nisn
            WHERE a.package_id = ?
            ORDER BY a.completed_at ASC");
        $stmtSub->execute([$packageId]);
    }
    $submissions = $stmtSub->fetchAll();

    $totalPeserta = count($submissions);
    $totalScoreSum = 0;
    foreach ($submissions as &$s) {
        $s['answers'] = json_decode($s['answers_json'], true);
        $totalScoreSum += intval($s['total_score']);
    }
    unset($s);

    $rerataSkor = $totalPeserta > 0 ? round($totalScoreSum / $totalPeserta, 1) : 0;
    $sessionCode = 'SESI_' . date('Ymd_His') . '_' . substr(md5(uniqid($packageId, true)), 0, 6);

    // Simpan arsip snapshot ke asesmen_riwayat_sesi
    $jsonSnapshot = json_encode([
        'packageId' => $packageId,
        'packageTitle' => $pkgTitle,
        'closedAt' => date('Y-m-d H:i:s'),
        'counselor' => $counselorName,
        'totalPeserta' => $totalPeserta,
        'rerataSkor' => $rerataSkor,
        'submissions' => $submissions
    ], JSON_UNESCAPED_UNICODE);

    $stmtArchive = $db->prepare("INSERT INTO asesmen_riwayat_sesi 
        (session_code, package_id, package_title, total_peserta, rerata_skor, data_json)
        VALUES (?, ?, ?, ?, ?, ?)");
    $stmtArchive->execute([$sessionCode, $packageId, $pkgTitle, $totalPeserta, $rerataSkor, $jsonSnapshot]);

    // Jika Guru memilih untuk mereset pengerjaan:
    if ($resetAnswers) {
        if ($packageId === 'active_package') {
            $db->exec("DELETE FROM asesmen_jawaban WHERE package_id = 'active_package' OR package_id IS NULL");
        } else {
            $stmtDel = $db->prepare("DELETE FROM asesmen_jawaban WHERE package_id = ?");
            $stmtDel->execute([$packageId]);
        }
    }

    // Ubah status paket menjadi 'closed' atau 'deleted' jika dipilih untuk dihapus permanen
    $deletePackage = !empty($input['deletePackage']);
    if ($deletePackage) {
        $stmtClose = $db->prepare("UPDATE paket_asesmen SET status = 'deleted', updated_at = NOW() WHERE package_id = ?");
    } else {
        $stmtClose = $db->prepare("UPDATE paket_asesmen SET status = 'closed', updated_at = NOW() WHERE package_id = ?");
    }
    $stmtClose->execute([$packageId]);

    json_response([
        'success' => true,
        'message' => $deletePackage 
            ? "Sesi \"{$pkgTitle}\" berhasil diarsipkan ke Excel dan paket resmi dihapus permanen dari Bank Soal." 
            : "Sesi \"{$pkgTitle}\" berhasil ditutup" . ($resetAnswers ? " dan pengerjaan siswa di-reset untuk sesi baru." : "."),
        'sessionCode' => $sessionCode,
        'packageId' => $packageId,
        'packageTitle' => $pkgTitle,
        'totalPeserta' => $totalPeserta,
        'rerataSkor' => $rerataSkor,
        'resetAnswers' => $resetAnswers,
        'deleted' => $deletePackage,
        'submissions' => $submissions
    ]);
}

// D. HAPUS PAKET ASESMEN DARI MYSQL
if ($action === 'delete_package') {
    $packageId = trim($input['packageId'] ?? ($input['package_id'] ?? ''));
    if (empty($packageId)) {
        json_response(['success' => false, 'message' => 'ID Paket Asesmen wajib disertakan.'], 400);
    }

    $stmt = $db->prepare("DELETE FROM paket_asesmen WHERE package_id = ?");
    $stmt->execute([$packageId]);
    if ($packageId === 'active_package') {
        $db->exec("DELETE FROM asesmen_jawaban WHERE package_id = 'active_package' OR package_id IS NULL OR package_id = ''");
    } else {
        $stmtAns = $db->prepare("DELETE FROM asesmen_jawaban WHERE package_id = ?");
        $stmtAns->execute([$packageId]);
    }
    json_response(['success' => true, 'message' => 'Paket asesmen dan seluruh data pengerjaannya berhasil dihapus dari database MySQL.']);
}

// D2. HAPUS / RESET JAWABAN SISWA TERTENTU SECARA REAL-TIME
if ($action === 'reset_student_submission') {
    $nisn = trim($input['nisn'] ?? '');
    $packageId = trim($input['packageId'] ?? ($input['package_id'] ?? ''));

    if (empty($nisn)) {
        json_response(['success' => false, 'message' => 'NISN wajib disertakan.'], 400);
    }

    if (!empty($packageId) && $packageId !== 'ALL') {
        if ($packageId === 'active_package') {
            $stmt = $db->prepare("DELETE FROM asesmen_jawaban WHERE siswa_nisn = ? AND (package_id = 'active_package' OR package_id IS NULL OR package_id = '')");
            $stmt->execute([$nisn]);
        } else {
            $stmt = $db->prepare("DELETE FROM asesmen_jawaban WHERE siswa_nisn = ? AND package_id = ?");
            $stmt->execute([$nisn, $packageId]);
        }
    } else {
        $stmt = $db->prepare("DELETE FROM asesmen_jawaban WHERE siswa_nisn = ?");
        $stmt->execute([$nisn]);
    }

    json_response([
        'success' => true,
        'message' => "Jawaban asesmen siswa berhasil dihapus dan di-reset dari database."
    ]);
}

// D3. RESET / KOSONGKAN SELURUH DATA JAWABAN ASESMEN SISWA (RESET KE 0 PESERTA)
if ($action === 'reset_all_submissions') {
    $packageId = trim($input['packageId'] ?? ($input['package_id'] ?? ''));
    if (!empty($packageId) && $packageId !== 'ALL') {
        if ($packageId === 'active_package') {
            $db->exec("DELETE FROM asesmen_jawaban WHERE package_id = 'active_package' OR package_id IS NULL OR package_id = ''");
        } else {
            $stmtDel = $db->prepare("DELETE FROM asesmen_jawaban WHERE package_id = ?");
            $stmtDel->execute([$packageId]);
        }
    } else {
        $db->exec("DELETE FROM asesmen_jawaban");
    }

    json_response([
        'success' => true,
        'message' => 'Seluruh data pengerjaan siswa berhasil dibersihkan dari database. Status 500 siswa kembali ke 0 peserta.'
    ]);
}

// E. HAPUS SATU BUTIR SOAL DARI PAKET SPESIFIK
if ($action === 'delete_question_item') {
    $packageId = trim($input['packageId'] ?? ($input['package_id'] ?? 'active_package'));
    $qId = trim($input['question_id'] ?? '');

    if (empty($qId)) {
        json_response(['success' => false, 'message' => 'ID butir soal wajib disertakan'], 400);
    }

    $stmt = $db->prepare("SELECT questions_json FROM paket_asesmen WHERE package_id = ? LIMIT 1");
    $stmt->execute([$packageId]);
    $pkg = $stmt->fetch();

    if ($pkg) {
        $questions = json_decode($pkg['questions_json'], true) ?: [];
        $filtered = array_values(array_filter($questions, function ($item) use ($qId) {
            return ($item['id'] ?? '') !== $qId;
        }));
        $jsonQ = json_encode($filtered, JSON_UNESCAPED_UNICODE);
        $stmtUp = $db->prepare("UPDATE paket_asesmen SET questions_json = ?, updated_at = NOW() WHERE package_id = ?");
        $stmtUp->execute([$jsonQ, $packageId]);

        json_response([
            'success' => true,
            'message' => 'Butir soal berhasil dihapus dari paket asesmen ini.',
            'remainingCount' => count($filtered),
            'questions' => $filtered
        ]);
    } else {
        json_response(['success' => false, 'message' => 'Paket asesmen tidak ditemukan.'], 404);
    }
}

// F. SISWA SUBMIT JAWABAN ASESMEN (Tersimpan ke paket_id yang sesuai)
if ($action === 'submit_jawaban' || !empty($input['answers'])) {
    $nisn = trim($input['nisn'] ?? '');
    $packageId = trim($input['package_id'] ?? ($input['packageId'] ?? 'active_package'));
    $answers = $input['answers'] ?? [];

    if (empty($nisn)) {
        json_response(['success' => false, 'message' => 'NISN siswa wajib disertakan'], 400);
    }

    if (!is_array($answers) || count($answers) === 0) {
        json_response(['success' => false, 'message' => 'Jawaban asesmen tidak boleh kosong'], 400);
    }

    // Pastikan siswa ada
    $stmtSiswa = $db->prepare("SELECT nisn, nama, kelas, jurusan FROM siswa WHERE nisn = ?");
    $stmtSiswa->execute([$nisn]);
    $student = $stmtSiswa->fetch();
    if (!$student) {
        json_response(['success' => false, 'message' => 'NISN tidak terdaftar di sistem'], 404);
    }

    // Bersihkan nilai jawaban ke rentang 1-5
    $cleanAnswers = array_map(function ($val) {
        $n = intval($val);
        return ($n < 1) ? 1 : (($n > 5) ? 5 : $n);
    }, $answers);

    $totalScore = array_sum($cleanAnswers);
    $qCount = count($cleanAnswers);
    $maxScore = $qCount * 5;

    // Kalkulasi level proporsional terhadap jumlah butir soal
    $ratio = $maxScore > 0 ? ($totalScore / $maxScore) : 0;
    if ($ratio >= 0.76) {
        $level = 'Tinggi';
    } elseif ($ratio >= 0.52) {
        $level = 'Sedang';
    } else {
        $level = 'Perlu Penguatan';
    }

    // Hitung dimensi
    $dimTugas = 0; $dimEksplorasi = 0; $dimKeputusan = 0; $dimKetahanan = 0;
    $half = ceil($qCount / 4);
    $dimTugas = array_sum(array_slice($cleanAnswers, 0, $half));
    $dimEksplorasi = array_sum(array_slice($cleanAnswers, $half, $half));
    $dimKeputusan = array_sum(array_slice($cleanAnswers, $half * 2, $half));
    $dimKetahanan = array_sum(array_slice($cleanAnswers, $half * 3));

    $jsonAnswers = json_encode($cleanAnswers);

    $stmtInsert = $db->prepare("INSERT INTO asesmen_jawaban 
        (siswa_nisn, package_id, answers_json, total_score, level, dimensi_tugas, dimensi_eksplorasi, dimensi_keputusan, dimensi_ketahanan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmtInsert->execute([
        $nisn,
        $packageId,
        $jsonAnswers,
        $totalScore,
        $level,
        $dimTugas,
        $dimEksplorasi,
        $dimKeputusan,
        $dimKetahanan
    ]);

    json_response([
        'success' => true,
        'message' => 'Hasil asesmen berhasil disimpan ke database terpusat.',
        'assessment' => [
            'id' => $db->lastInsertId(),
            'nisn' => $nisn,
            'packageId' => $packageId,
            'answers' => $cleanAnswers,
            'totalScore' => $totalScore,
            'level' => $level,
            'completedAt' => date('Y-m-d H:i:s')
        ]
    ]);
}

json_response(['success' => false, 'message' => 'Aksi POST tidak valid.'], 400);
