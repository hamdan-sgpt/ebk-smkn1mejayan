/**
/**
 * Instrumen Asesmen Career Self-Efficacy Siswa SMK
 * Berdasarkan Social Cognitive Career Theory (SCCT) Albert Bandura
 * SMKN 1 Mejayan - Bimbingan: Drs. M. Rofik, M.Pd
 */

export const DEFAULT_ASSESSMENT_QUESTIONS = [
  { 
    id: "q1", 
    text: "Saya yakin dapat mengenali kemampuan dan bakat teknis yang saya miliki untuk mendukung pilihan karier kejuruan.", 
    dimId: 1 
  },
  { 
    id: "q2", 
    text: "Saya yakin dapat menentukan pilihan bidang pekerjaan yang paling sesuai dengan keterampilan kejuruan saya.", 
    dimId: 3 
  },
  { 
    id: "q3", 
    text: "Saya mampu mencari dan menggali informasi standar kualifikasi industri (IDUKA) yang saya minati.", 
    dimId: 2 
  },
  { 
    id: "q4", 
    text: "Saya yakin mampu menguasai keterampilan baru yang dituntut oleh perkembangan teknologi industri saat ini.", 
    dimId: 2 
  },
  { 
    id: "q5", 
    text: "Saya mampu bersikap tenang dan tetap mencari solusi ketika menghadapi kendala dalam praktik kejuruan.", 
    dimId: 4 
  },
  { 
    id: "q6", 
    text: "Saya yakin dapat mengambil keputusan secara mandiri ketika dihadapkan pada beberapa pilihan masa depan (BMW).", 
    dimId: 4 
  },
  { 
    id: "q7", 
    text: "Saya mampu menyusun rencana langkah konkret untuk mencapai target karier pasca lulus dari SMKN 1 Mejayan.", 
    dimId: 3 
  },
  { 
    id: "q8", 
    text: "Saya yakin dapat menyesuaikan diri dengan budaya disiplin dan standar etos kerja di dunia industri.", 
    dimId: 4 
  },
  { 
    id: "q9", 
    text: "Saya mampu menjelaskan keunggulan kompetensi kejuruan yang saya miliki secara percaya diri kepada pihak lain.", 
    dimId: 1 
  },
  { 
    id: "q10", 
    text: "Saya memiliki keyakinan kuat bahwa cita-cita karier yang saya rencanakan dapat tercapai dengan ketekunan.", 
    dimId: 3 
  }
];

export const DIMENSIONS = [
  { 
    id: 1, 
    title: "1. Penilaian Potensi Diri (Self-Appraisal)", 
    short: "Potensi Diri",
    desc: "Keyakinan mengenali bakat, minat, dan kompetensi teknis kejuruan."
  },
  { 
    id: 2, 
    title: "2. Informasi Dunia Kerja (Occupational Information)", 
    short: "Info Industri",
    desc: "Pemahaman kualifikasi IDUKA dan dinamika peluang kerja."
  },
  { 
    id: 3, 
    title: "3. Pemilihan Tujuan Karier (Goal Selection)", 
    short: "Tujuan Karier",
    desc: "Kemampuan merumuskan arah masa depan (Bekerja, Kuliah, Wirausaha)."
  },
  { 
    id: 4, 
    title: "4. Perencanaan & Pemecahan Masalah (Problem Solving)", 
    short: "Daya Juang",
    desc: "Ketangguhan mental menyusun strategi dan mengatasi rintangan."
  }
];
