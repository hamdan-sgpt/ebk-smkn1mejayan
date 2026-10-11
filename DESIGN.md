# Design Direction: e-BK Career Self-Efficacy SMKN 1 Mejayan

> Panduan Arah Desain & Standar Antislop untuk Aplikasi Layanan Bimbingan dan Konseling Karier Siswa SMKN 1 Mejayan.

## 1. Identitas & Karakter Produk
- **Nama Produk:** e-BK Career Self-Efficacy
- **Instansi:** SMKN 1 Mejayan, Kabupaten Madiun, Jawa Timur
- **Sasaran Pengguna:** Siswa Kelas 11 (RPL, TKR, TSM, APHP, dll.) & Guru BK (Pembimbing: Drs. M. Rofik, M.Pd)
- **Tujuan Utama:** Memfasilitasi asesmen efikasi diri karier 10 butir skala Bandura, modul eksplorasi dunia industri (Bekerja, Melanjutkan, Wirausaha), tantangan aksi karier, dan konsultasi konseling daring dengan privasi terjamin.

## 2. Parameter Dials (Liveliness Toolkit)
- **ENERGY: 2 (Balanced)**
  Antarmuka segar, ramah remaja vokasi dan guru pendidik, berenergi positif tanpa terkesan norak atau berlebihan.
- **RHYTHM: 2 (Structured with Intentional Breaks)**
  Struktur kartu teratur, hierarki informasi jelas, pemisahan tajam antara kartu data skor, modul bacaan, dan formulir interaktif.
- **MOTION: 1 (Calm & Purposeful)**
  Transisi halus (150ms-250ms), tanpa animasi melayang/pulsing berulang yang mengganggu fokus membaca dan pengisian asesmen.

## 3. Palet Warna (WCAG AA Certified - Harmonized Crimson Ruby Red)
### Light Mode
- **Primary (Signature Crimson Red):** `#be123c` (Rose / Crimson 700 - selaras dengan navbar merah)
- **Primary Hover:** `#9f1239` (Crimson 800)
- **Primary Active:** `#881337` (Deep Ruby 900)
- **Primary Subtle:** `#fff1f2` (Rose 50 - surface lembut beraksen hangat)
- **Primary Border:** `#fecdd3` (Rose 200)
- **Accent (Growth Emerald):** `#059669` (Simbol pertumbuhan karier dan efikasi diri)
- **Accent Hover:** `#047857`
- **Accent Subtle:** `#ecfdf5`
- **Accent Border:** `#a7f3d0`
- **Canvas (Background):** `#fbfbfb`
- **Surface (Card & Sheet):** `#ffffff`
- **Surface Raised:** `#fff5f6`
- **Border:** `#f1e4e6`
- **Border Strong:** `#e2cbd0`
- **Text Main:** `#0f172a` (Rasio kontras > 15:1 terhadap putih)
- **Text Muted:** `#334155` (Rasio kontras > 9:1 terhadap putih)
- **Text Faint:** `#64748b` (Rasio kontras > 4.5:1 terhadap putih)

### Dark Mode
- **Primary:** `#fb7185` (Rose 400 - kontras tinggi tajam terhadap kanvas gelap)
- **Primary Hover:** `#f43f5e`
- **Primary Active:** `#e11d48`
- **Primary Subtle:** `#4c0519`
- **Primary Border:** `#881337`
- **Accent:** `#10b981`
- **Accent Subtle:** `#064e3b`
- **Canvas:** `#0d0f15`
- **Surface:** `#151822`
- **Surface Raised:** `#1f2332`
- **Border:** `#2c3144`
- **Border Strong:** `#404760`
- **Text Main:** `#f8fafc`
- **Text Muted:** `#cbd5e1`
- **Text Faint:** `#94a3b8`

## 4. Tipografi & Tata Letak (Layout Architecture)
- **Font Family:** `Plus Jakarta Sans`, sans-serif
- **Prinsip Skala:**
  - H1 Judul Layanan: 20px - 24px, Semi-Bold / Bold (700-800)
  - H2 Subjudul Bagian: 16px - 18px, Semi-Bold (600-700)
  - Body Text: 14px - 15px, Regular (400) / Medium (500), line-height 1.5
  - Caption & Meta: 11px - 12px, Semi-Bold (600)
  - Angka Skor / Statistik: Tabular Numbers (`font-variant-numeric: tabular-nums`)
- **Arsitektur Responsif Bebas Gimmick:**
  - Tidak menggunakan bingkai smartphone tiruan (no fake iPhone bezel, no fake dynamic island, no fake battery icon) di layar desktop.
  - Tampilan beradaptasi mulus: Pada mobile (<640px) mengisi layar penuh dengan safe area insets. Pada tablet & desktop (>=640px), terpusat secara rapi dengan lebar optimal (540px untuk alur siswa, dapat melebar hingga 1024px untuk dashboard tabel Guru BK).
  - Target sentuh minimum 44px x 44px dengan ruang antar kontrol yang lapang.

## 5. Komitmen Antislop
- Bebas tanda pisah em dash (`—`) dalam seluruh teks antarmuka.
- Bebas buzzword hampa ("AI-Powered", "Revolutionary", "Seamless").
- Seluruh 500 data siswa adalah data riil kejuruan SMKN 1 Mejayan.
- Semua elemen tombol dan modal memiliki fungsi riil dan keyboard accessible (Escape, Tab, Enter).
- Keadaan UI lengkap: Empty state informatif, Loading state, dan Validasi formulir.
