/**
 * 5 Career Mastery Challenges untuk Siswa Kelas 11 SMKN 1 Mejayan
 */

export const DEFAULT_CHALLENGES = [
  {
    id: 0,
    title: "Mengenali Kekuatan Diri",
    desc: "Tuliskan minimal 3 kekuatan utama atau keterampilan teknis yang paling Anda kuasai untuk mendukung rencana karier.",
    response: "",
    completed: false
  },
  {
    id: 1,
    title: "Eksplorasi Pekerjaan Impian",
    desc: "Tentukan satu bidang pekerjaan yang diminati, lalu catat minimal 3 kualifikasi kompetensi yang dicari oleh industri saat ini.",
    response: "",
    completed: false
  },
  {
    id: 2,
    title: "Target Keterampilan 30 Hari",
    desc: "Rancang satu target peningkatan keterampilan spesifik (hard skill atau soft skill) yang akan Anda latih dalam 30 hari ke depan.",
    response: "",
    completed: false
  },
  {
    id: 3,
    title: "Simulasi Jawaban Wawancara",
    desc: "Tuliskan jawaban singkat dan percaya diri untuk pertanyaan: 'Mengapa industri atau perusahaan harus memilih Anda?'",
    response: "",
    completed: false
  },
  {
    id: 4,
    title: "Peta Rencana 1 Tahun Pasca SMK",
    desc: "Tentukan satu jalur utama pilihan Anda (Bekerja, Melanjutkan studi, atau Wirausaha) beserta langkah konkret yang harus disiapkan sebelum kelulusan.",
    response: "",
    completed: false
  }
];

export const DEFAULT_ASSESSMENT_QUESTIONS = [
  { id: "q1", text: "Saya yakin dapat mengenali kemampuan yang saya miliki untuk mendukung karier.", dimId: 1 },
  { id: "q2", text: "Saya yakin dapat menentukan pilihan pekerjaan yang sesuai dengan kemampuan saya.", dimId: 3 },
  { id: "q3", text: "Saya mampu mencari informasi tentang bidang pekerjaan yang saya minati.", dimId: 2 },
  { id: "q4", text: "Saya yakin dapat mempelajari keterampilan baru yang dibutuhkan dunia kerja.", dimId: 2 },
  { id: "q5", text: "Saya mampu menghadapi kesulitan ketika merencanakan karier.", dimId: 4 },
  { id: "q6", text: "Saya yakin dapat mengambil keputusan ketika memiliki beberapa pilihan karier.", dimId: 4 },
  { id: "q7", text: "Saya mampu membuat langkah konkret untuk mencapai tujuan karier.", dimId: 3 },
  { id: "q8", text: "Saya yakin dapat menyesuaikan diri dengan perubahan di dunia industri.", dimId: 4 },
  { id: "q9", text: "Saya mampu memperkenalkan keunggulan kompetensi diri kepada orang lain.", dimId: 1 },
  { id: "q10", text: "Saya yakin dapat mencapai tujuan karier yang saya rencanakan.", dimId: 3 }
];

export const DIMENSIONS = [
  { id: 1, title: "1. Mengenal Bakat & Kemampuan Diri", short: "Bakat & Potensi" },
  { id: 2, title: "2. Wawasan Industri & Peluang Kerja", short: "Info Dunia Kerja" },
  { id: 3, title: "3. Rencana & Target Masa Depan", short: "Pilihan Karier" },
  { id: 4, title: "4. Mental Pantang Menyerah & Solusi", short: "Mental & Solusi" }
];
