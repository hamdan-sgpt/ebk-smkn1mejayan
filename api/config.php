<?php
/**
 * Konfigurasi Database & Helper API
 * e-BK Career Self-Efficacy - SMKN 1 Mejayan
 * Dibimbing oleh: Drs. M. Rofik, M.Pd
 */

// Aktifkan pelaporan error untuk debugging jika diperlukan
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Header CORS (Cross-Origin Resource Sharing) agar bisa diakses dari frontend mana saja
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Tangani HTTP OPTIONS Preflight request
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Konfigurasi Database MySQL (Sesuaikan dengan kredensial hosting Anda)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'ebk_mejayan');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');

/**
 * Mendapatkan koneksi PDO MySQL
 * @return PDO
 */
function get_db() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 3,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            json_response([
                'success' => false,
                'message' => 'Gagal terhubung ke database MySQL: ' . $e->getMessage()
            ], 500);
            exit();
        }
    }
    return $pdo;
}

/**
 * Helper untuk mengirim response JSON
 * @param array $data
 * @param int $status
 */
function json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

/**
 * Helper untuk membaca input JSON dari request body
 * @return array
 */
function get_json_input() {
    $raw = file_get_contents('php://input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}
