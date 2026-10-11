# Panduan Penggunaan Database MySQL & REST API (PHP)
## e-BK Career Self-Efficacy - SMKN 1 Mejayan
**Dibimbing oleh: Drs. M. Rofik, M.Pd**

Dokumen ini memandu Anda dalam menyiapkan database MySQL, baik untuk uji coba lokal di laptop (menggunakan XAMPP) maupun ketika nanti diunggah ke web hosting / cPanel sekolah.

---

### 1. Struktur Berkas Backend yang Disiapkan

```text
├── database.sql           # Skema tabel relasional + 500 data riil siswa siap import
├── api/
│   ├── config.php         # Koneksi database PDO MySQL & konfigurasi CORS
│   ├── auth.php           # Otentikasi login Siswa (NISN) & Guru BK (Password)
│   ├── siswa.php          # API pencarian siswa & filter rombel kelas 11
│   ├── asesmen.php        # API simpan jawaban & kalkulasi rekapitulasi sekolah
│   ├── konseling.php      # API percakapan konseling & catatan rekomendasi pembimbing
│   ├── pengaturan.php     # API kontrol sesi asesmen
│   └── .htaccess          # Pengamanan folder API
├── js/
│   └── api-client.js      # Jembatan komunikasi Frontend PWA ke REST API MySQL
```

---

### 2. Langkah Import Database ke phpMyAdmin

#### A. Jika Menggunakan XAMPP Lokal di Komputer Anda:
1. Buka aplikasi **XAMPP Control Panel**, lalu klik **Start** pada modul **Apache** dan **MySQL**.
2. Buka browser dan kunjungi `http://localhost/phpmyadmin`.
3. Klik menu **New / Baru** di panel kiri, beri nama database: `ebk_mejayan`, lalu klik **Create**.
4. Pilih database `ebk_mejayan`, lalu buka tab **Import**.
5. Klik **Choose File / Pilih Berkas**, pilih berkas `database.sql` yang ada di folder proyek ini.
6. Klik tombol **Import / Kirim** di bagian bawah.
7. Selesai! Sebanyak **500 data siswa Kelas 11 SMKN 1 Mejayan** beserta akun Guru BK langsung tersedia di database.

#### B. Jika Nanti Sudah Membeli / Mendapatkan Hosting (cPanel):
1. Masuk ke cPanel hosting Anda.
2. Buka menu **MySQL Databases**:
   - Buat database baru (contoh: `u12345_ebk`).
   - Buat user database baru dan password (contoh user: `u12345_guru`, pass: `rahasia123`).
   - Tambahkan user tersebut ke database dengan mencentang **ALL PRIVILEGES**.
3. Buka menu **phpMyAdmin** di cPanel.
4. Klik database Anda, pilih tab **Import**, unggah berkas `database.sql`, lalu klik **Import**.
5. Buka berkas `api/config.php` via File Manager cPanel, sesuaikan baris:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'u12345_ebk');     // Ganti nama DB hosting Anda
   define('DB_USER', 'u12345_guru');    // Ganti user DB hosting Anda
   define('DB_PASS', 'rahasia123');     // Ganti password DB hosting Anda
   ```

---

### 3. Akun Bawaan (Default Credentials)

| Peran Akun | Username / NISN | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Koordinator / Pembimbing BK** | `guru_rofik` | `bk12345` | Drs. M. Rofik, M.Pd |
| **Admin Tim Konselor BK** | `admin` | `bk12345` | Tim Konselor SMKN 1 Mejayan |
| **Wali Kelas (14 Rombel)** | `wali_rpl1` s/d `wali_aphp3` | `bk12345` | Wali kelas masing-masing rombel |
| **Siswa (500 Siswa)** | Cukup ketik 10 digit NISN siswa | Tanpa password | Otomatis terdeteksi nama & rombelnya |
| **Kode Registrasi Guru Baru** | - | `BK-MEJAYAN-2026` | Untuk pendaftaran akun guru baru |

---

### 4. Keunggulan Arsitektur Dual-Mode (Online & Offline PWA)

Aplikasi ini telah dirancang dengan arsitektur **Offline-First Resilience**:
- **Saat Terhubung ke MySQL**: Setiap asesmen yang diisi siswa dan catatan konseling otomatis tersimpan terpusat di server hosting.
- **Saat Internet Lemot / Offline**: Siswa dan guru tetap bisa menggunakan aplikasi dengan lancar. Data akan disimpan di memori lokal HP (`localStorage`) terlebih dahulu sehingga tidak pernah macet atau hilang.
- **Sinkronisasi Dasbor Guru**: Guru BK memiliki tombol sinkronisasi untuk menarik seluruh data siswa dari database MySQL secara *real-time*.
