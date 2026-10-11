# e-BK Career Self-Efficacy (Mobile Web App / PWA)
**Sistem Layanan Bimbingan dan Konseling Karier Berbasis TIK**  
*SMKN 1 Mejayan · Bimbingan: Drs. M. Rofik, M.Pd*

---

## 📖 Ringkasan Aplikasi

Aplikasi **e-BK Career Self-Efficacy** adalah platform layanan bimbingan dan konseling karier berbasis web progresif (PWA) yang dirancang khusus untuk memfasilitasi pemetaan keyakinan diri dan perencanaan karier **500 Siswa Kelas 11 SMKN 1 Mejayan** lintas 14 rombongan belajar (XI RPL 1-3, XI TKR 1-2, XI TO 1-3, XI TSM 1-3, XI APHP 1-3).

Aplikasi ini mengintegrasikan kerangka teoretis **Social Cognitive Career Theory (SCCT)** dari **Albert Bandura**, memetakan efikasi diri karier ke dalam 4 dimensi utama:
1. **Self-Appraisal (Penilaian Potensi Diri)**: Keyakinan mengenali bakat, minat, dan nilai kerja kejuruan.
2. **Occupational Information (Eksplorasi Informasi Pekerjaan)**: Pemahaman profil kompetensi dan tuntutan IDUKA.
3. **Goal Selection (Penetapan Tujuan Karier)**: Kemampuan merumuskan arah karier pasca lulus SMK (BMW).
4. **Planning and Problem Solving (Perencanaan & Pemecahan Masalah)**: Ketangguhan menyusun langkah konkret dan mengatasi hambatan.

---

## 📱 Cara Menjalankan Aplikasi

Aplikasi ini menggunakan arsitektur **Mobile-First PWA** tanpa ketergantungan server luar (100% offline-ready):

### Cara 1: Langsung Buka Berkas (Tanpa Instalasi)
1. Buka folder `aplikasi-EBK`.
2. Klik dua kali berkas `index.html`.
3. Aplikasi akan langsung berjalan di peramban (Chrome, Edge, Safari, Firefox) dengan tampilan bingkai smartphone modern.

### Cara 2: Menjalankan Server Lokal (Fitur PWA Penuh di Ponsel)
Jika ingin mencoba langsung di ponsel (smartphone) dalam satu jaringan Wi-Fi:
1. Buka terminal di folder ini.
2. Jalankan perintah:
   ```bash
   npm start
   ```
3. Buka alamat `http://localhost:3000` di laptop, atau buka IP lokal komputer di peramban ponsel (contoh: `http://192.168.1.10:3000`).
4. Di ponsel, pilih menu **"Tambahkan ke Layar Utama" (Add to Home Screen)** untuk menginstal e-BK seperti aplikasi native Android/iOS.

---

## 🔑 Akses Cepat Pengujian (1-Klik Masuk)

Pada layar login telah disediakan tombol akses cepat satu-klik:
- **Panel Guru BK:** `Drs. M. Rofik, M.Pd` (Akses dashboard analitik 500 siswa)

---

## ✨ Fitur-Fitur Unggulan

### 1. Pengalaman Siswa (Student Experience)
- **Verifikasi NISN Instan:** Kartu identitas siswa digital otomatis muncul saat siswa mengetikkan 10 digit NISN atau mencari nama di modal pencarian 500 siswa.
- **Asesmen Efikasi Diri Karier (10 Butir):** Skala Likert 1-5 dengan tombol sentuh 44px ramah jempol.
- **Analisis 4 Dimensi Bandura:** Grafik persentase dan rekomendasi psikologis untuk tiap dimensi efikasi.
- **Rekomendasi Spesifik Kejuruan:** Saran bimbingan karier terarah sesuai jurusan siswa (RPL, TKR, TO, TSM, atau APHP).
- **Modul Karier & Symbolic Modeling Alumni:**
  - Profil 4 alumni sukses SMKN 1 Mejayan (RPL, TKR, APHP, TSM/TO).
  - Simulator audio/podcast rekaman inspirasi alumni.
- **Career Mastery Challenge:** 5 tahapan aksi nyata (mengenali kekuatan, eksplorasi kualifikasi, target 30 hari, simulasi wawancara STAR, dan peta karier 1 tahun).
- **Sertifikat Kesiapan Karier Vokasional Mandiri:** Terbuka otomatis saat 5 tantangan tuntas, lengkap dengan nomor resmi dan fitur cetak/PDF.
- **Pengajuan Konseling Daring:** Formulir jadwal bimbingan dengan notifikasi tanggapan ruang dan waktu dari Guru BK.
- **Lembar Refleksi & Evaluasi Layanan:** Instrumen umpan balik mandiri siswa.

### 2. Panel Guru BK (Counselor Dashboard)
- **Metrik Populasi 500 Siswa:** Jumlah responden, persentase partisipasi, rata-rata skor, dan jumlah siswa prioritas bimbingan.
- **Bar Distribusi Proporsional:** Visualisasi rasio kategori Tinggi, Sedang, dan Perlu Penguatan tanpa elemen dekoratif semu.
- **Analisis Partisipasi per Rombel (14 Kelas):** Kartu statistik interaktif per rombel yang berfungsi sebagai filter cepat tabel.
- **Simulator 500 Siswa Sekali Klik:** Tombol aktifasi simulasi data untuk mendemonstrasikan aplikasi dalam skala penuh 500 siswa dengan distribusi skor alami.
- **Tabel Pemantauan & Screening Lengkap:** Dilengkapi pencarian nama/NISN, filter rombel, filter status, dan pagination rapi.
- **Modal Analisis Siswa & Catatan Rahasia:** Tinjauan 10 butir pertanyaan, analisis 4 dimensi, serta form penyimpanan catatan konselor persisten.
- **Pencetakan Dokumen Resmi Sekolah (@media print):**
  - **Lembar Laporan Hasil Asesmen Siswa (PDF):** Lengkap dengan Kop Surat SMKN 1 Mejayan, data siswa, tabel dimensi, tabel 10 butir, catatan konselor, dan tanda tangan (Siswa & Guru BK).
  - **Laporan Rekapitulasi Screening Sekolah (PDF):** Rekapitulasi 14 rombel dan daftar siswa prioritas untuk arsip bimbingan konseling dan Kepala Sekolah.
  - **Ekspor Data (.CSV):** Berkas data 500 siswa siap olah di Microsoft Excel.
- **Manajemen Jadwal Bimbingan Dua Arah:** Guru BK dapat menyetujui jadwal, memilih ruang bimbingan (Ruang BK 1, Ruang BK 2, Bengkel, atau Daring), dan mengirim arahan persiapan.

### 3. Standar Kualitas Antarmuka & Aksesibilitas (Antislop Framework)
- **Tipografi Institusional:** Plus Jakarta Sans dengan hirarki visual jelas dan font monospaced untuk NISN/NIS.
- **Palet Warna Harmonis:** Warna resmi pendidikan bahari dan toska (Deep Navy `#1b4965`, Teal Accent `#0d9488`).
- **Aksesibilitas Tinggi:** Kontras warna memenuhi WCAG AA, navigasi keyboard (Escape untuk menutup modal), dan target sentuh minimal 44x44px.
- **Bebas AI Slop:** Nol karakter em dash panjang, copy edukatif berbasis data nyata SMKN 1 Mejayan, ikon SVG fungsional tanpa emoji dekoratif.

---

## 📂 Struktur Berkas

```
aplikasi-EBK/
├── index.html            # Berkas utama aplikasi mobile & wadah print resmi
├── manifest.json         # Konfigurasi PWA (Add to Home Screen)
├── sw.js                 # Service Worker cache offline
├── package.json          # Script server lokal
├── css/
│   └── mobile.css        # Sistem desain mobile, token tema, dan @media print A4
├── js/
│   ├── app.js            # Logika asesmen, Bandura 4-dimensi, panel konselor, dan cetak
│   └── database-siswa.js # Basis data 500 siswa Kelas 11 SMKN 1 Mejayan (14 rombel)
├── assets/
│   ├── logo-bk-mejayan.jpeg # Logo resmi BK SMKN 1 Mejayan
│   └── icon.svg          # Ikon vektor aplikasi e-BK
└── README.md             # Dokumentasi teknis & panduan operasional
```

