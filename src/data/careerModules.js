/**
 * Modul Pembelajaran Karier Vokasional & Inspirasi Alumni SMKN 1 Mejayan
 */

export const DEFAULT_CAREER_MODULES = [
  {
    id: "mengenal-diri",
    iconKey: "target",
    title: "Mengenal Bakat & Kekuatan Diri",
    subtitle: "Pemetaan potensi kejuruan, minat teknis, dan keunikan pribadi siswa",
    badge: "Fondasi Karier",
    summary: "Memahami kelebihan dan area pengembangan diri secara objektif sebagai dasar perencanaan karier yang kokoh.",
    content: `
      <h4>1. Memetakan Potensi Diri Siswa SMK</h4>
      <p>Setiap siswa di SMKN 1 Mejayan memiliki kombinasi kecerdasan dan keterampilan unik. Mengenali potensi diri bukan sekadar melihat nilai rapor semester, melainkan mengenali aktivitas praktik kejuruan apa yang membuat Anda bersemangat dan tekun menyelesaikannya.</p>
      
      <h4>2. Hard Skill vs Soft Skill Kejuruan</h4>
      <ul>
        <li><b>Hard Skill (Keahlian Teknis):</b> Kemampuan spesifik sesuai jurusan Anda (coding web, instalasi kelistrikan motor, pengujian pangan APHP, permesinan presisi).</li>
        <li><b>Soft Skill (Keterampilan Personal):</b> Komunikasi santun, kerja sama tim di bengkel, etika disiplin 5S industri, dan daya juang menyelesaikan kendala teknis.</li>
      </ul>

      <div class="tip-box">
        <b>Tips Praktis:</b> Catat minimal 3 hal teknis yang paling Anda kuasai selama praktik kejuruan di sekolah sebagai modal portofolio awal.
      </div>
    `
  },
  {
    id: "eksplorasi-karier",
    iconKey: "compass",
    title: "Pilihan Karier BMW: Bekerja, Melanjutkan, Wirausaha",
    subtitle: "Riset standar industri, profil jurusan, dan jalur kelulusan SMK",
    badge: "Wawasan Industri",
    summary: "Menelaah peluang dan kualifikasi yang dibutuhkan pada tiga pilar masa depan lulusan SMK.",
    content: `
      <h4>Tiga Pilar Pilihan Masa Depan Lulusan SMK</h4>
      <p>Lulusan SMKN 1 Mejayan memiliki fleksibilitas tinggi dengan prinsip BMW:</p>
      
      <div class="bmw-grid">
        <div class="bmw-item">
          <b>B - Bekerja di Industri:</b> Memasuki dunia industri rekanan sekolah melalui seleksi BKK (Bursa Kerja Khusus). Pastikan sertifikasi kompetensi BNSP Anda tuntas.
        </div>
        <div class="bmw-item">
          <b>M - Melanjutkan Pendidikan:</b> Melanjutkan studi ke Politeknik Negeri atau Universitas (jalur SNBP, SNBT, atau beasiswa vokasi terapan).
        </div>
        <div class="bmw-item">
          <b>W - Wirausaha Mandiri:</b> Membuka jasa perbaikan, produksi olahan pangan lokal, atau usaha digital mandiri berbasis keahlian jurusan.
        </div>
      </div>
    `
  },
  {
    id: "tujuan-smart",
    iconKey: "award",
    title: "Menetapkan Target Karier SMART",
    subtitle: "Metode konkret merumuskan sasaran karier yang terukur dan realistis",
    badge: "Perencanaan",
    summary: "Menghindari keraguan dengan menyusun langkah nyata berbasis kerangka SMART (Specific, Measurable, Achievable, Relevant, Time-bound).",
    content: `
      <h4>Kerangka Sasaran SMART Siswa Vokasi</h4>
      <ul>
        <li><b>S (Specific):</b> Target jelas, bukan umum. Contoh: "Lolos sertifikasi teknis kelistrikan" bukan sekadar "jadi pintar".</li>
        <li><b>M (Measurable):</b> Memiliki tolok ukur. Contoh: "Nilai ujian praktik kejuruan minimal 85".</li>
        <li><b>A (Achievable):</b> Masuk akal dengan sumber daya yang dimiliki di sekolah.</li>
        <li><b>R (Relevant):</b> Selaras dengan minat jurusan di SMKN 1 Mejayan.</li>
        <li><b>T (Time-bound):</b> Memiliki tenggat waktu terukur sebelum semester 6 kelulusan.</li>
      </ul>
    `
  },
  {
    id: "persiapan-kerja",
    iconKey: "briefcase",
    title: "Persiapan Portofolio & Wawancara Kerja",
    subtitle: "Portofolio praktik bengkel, resume profesional, dan simulasi rekrutmen",
    badge: "Kesiapan Kerja",
    summary: "Mempersiapkan bukti nyata hasil karya praktik dan mental menghadapi rekrutmen industri.",
    content: `
      <h4>Menyusun Portofolio Praktik Kejuruan</h4>
      <p>Industri modern membutuhkan bukti nyata hasil kerja praktik, bukan sekadar nilai tertulis:</p>
      <ul>
        <li>Dokumentasikan foto atau video proyek praktik bengkel yang pernah Anda selesaikan.</li>
        <li>Simpan laporan praktik kerja lapangan (PKL) dan sertifikat penilaian industri.</li>
        <li>Lampirkan sertifikat uji kompetensi keahlian dan pelatihan eksternal.</li>
      </ul>

      <div class="tip-box">
        <b>Metode STAR Wawancara:</b> Gunakan metode Situation, Task, Action, Result saat menjelaskan pengalaman praktik kejuruan Anda di hadapan tim penguji rekrutmen.
      </div>
    `
  }
];

export const ALUMNI_STORIES = [
  {
    id: 1,
    name: "Rizky Pratama, S.Kom",
    alumniMeta: "Alumni RPL (Lulus 2021) · Frontend Developer di Surabaya",
    initials: "RP",
    quote: "Saat kelas 11 saya sempat ragu karena merasa coding saya lebih lambat dari teman. Guru BK menyarankan saya tidak membandingkan diri ke orang lain, tapi ke progres diri kemarin. Saya mulai buat portofolio web nyata.",
    keyStrategy: "Membangun proyek riil di GitHub, aktif konsultasi dengan guru pembimbing, dan menuntaskan sertifikasi BNSP pemrograman."
  },
  {
    id: 2,
    name: "Bayu Setiawan",
    alumniMeta: "Alumni TKR (Lulus 2022) · Diagnostic Technician di Dealer Madiun",
    initials: "BS",
    quote: "Kedisiplinan 5S dan kebersihan alat saat praktik bengkel di SMKN 1 Mejayan membuat saya langsung dipercaya saat magang PKL hingga direkrut sebelum wisuda kelulusan.",
    keyStrategy: "Menguasai wiring diagram kelistrikan dan scanner EFI di luar jam pelajaran, serta berani bertanya teknis kepada mekanik senior."
  },
  {
    id: 3,
    name: "Siti Rahmawati, A.Md",
    alumniMeta: "Alumni APHP (Lulus 2020) · Owner UMKM Pangan Lokal & Suplier Retail",
    initials: "SR",
    quote: "Lulusan APHP punya keunggulan ilmu keamanan pangan dan sanitasi higienis. Dari tugas praktik olahan keripik dan sari buah, kini saya punya 8 karyawan lokal.",
    keyStrategy: "Menerapkan standar HACCP/PIRT sejak awal dan memanfaatkan bimbingan kewirausahaan sekolah untuk membangun mental pantang menyerah."
  },
  {
    id: 4,
    name: "Dimas Wahyudi",
    alumniMeta: "Alumni TSM (Lulus 2023) · Kepala Mekanik Mitra & Mahasiswa D4",
    initials: "DW",
    quote: "SMK bukan jalan buntu. Berkat bimbingan perencanaan karier terarah di sekolah, saya bisa bekerja profesional sekaligus melanjutkan studi diploma terapan tanpa membebani orang tua.",
    keyStrategy: "Menetapkan target SMART sejak kelas 11 dan disiplin membagi waktu antara pekerjaan bengkel dengan studi vokasi."
  }
];

export const DEFAULT_MODULE_QUIZZES = [
  {
    id: "qz1",
    moduleId: "mengenal-diri",
    question: "Manakah di bawah ini yang merupakan contoh Hard Skill kejuruan siswa SMK?",
    options: [
      "A. Kemampuan berkomunikasi santun",
      "B. Keterampilan pengoperasian mesin bengkel atau coding perangkat lunak",
      "C. Keinginan bekerja keras",
      "D. Kemampuan menahan emosi"
    ],
    correctKey: "B",
    explanation: "Hard skill adalah keahlian teknis spesifik yang dapat dilatih dan diuji langsung sesuai bidang kejuruan Anda di SMKN 1 Mejayan."
  },
  {
    id: "qz2",
    moduleId: "eksplorasi-karier",
    question: "Konsep BMW dalam perencanaan lulusan SMK merupakan singkatan dari...",
    options: [
      "A. Bekerja, Menunggu, Wirausaha",
      "B. Belajar, Magang, Wawasan",
      "C. Bekerja, Melanjutkan studi, Wirausaha",
      "D. Berkarya, Mandiri, Waspada"
    ],
    correctKey: "C",
    explanation: "Tiga pilar pilihan utama lulusan SMK adalah Bekerja di industri rekanan, Melanjutkan studi (D3/D4/S1), dan Wirausaha mandiri."
  },
  {
    id: "qz3",
    moduleId: "tujuan-smart",
    question: "Dalam prinsip penetapan target karier SMART, huruf 'T' merepresentasikan kriteria...",
    options: [
      "A. Technical (Keahlian teknik)",
      "B. Time-bound (Terikat batas waktu yang jelas)",
      "C. Teamwork (Kerja sama tim)",
      "D. Transparent (Transparan)"
    ],
    correctKey: "B",
    explanation: "Time-bound berarti tujuan karier harus memiliki tenggat waktu terukur (misal: sebelum semester 6 kelulusan)."
  },
  {
    id: "qz4",
    moduleId: "persiapan-kerja",
    question: "Dalam wawancara kerja kejuruan, metode STAR digunakan untuk...",
    options: [
      "A. Menghafal profil perusahaan",
      "B. Menjelaskan pengalaman teknis dengan alur: Situation, Task, Action, dan Result",
      "C. Menentukan negosiasi gaji pokok",
      "D. Memilih pakaian seragam bengkel"
    ],
    correctKey: "B",
    explanation: "STAR memudahkan tim rekrutmen memahami peran dan kontribusi nyata Anda dalam menyelesaikan masalah teknis saat praktik."
  }
];
