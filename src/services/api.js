/**
 * e-BK Career Self-Efficacy - REST API Service Layer
 * SMKN 1 Mejayan - Terhubung ke Backend PHP & Database MySQL
 */

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform()) {
    const saved = localStorage.getItem('ebk_backend_url');
    return saved ? `${saved}/api` : 'http://192.168.1.3:8000/api';
  }
  return '/api';
};

const API_BASE = getApiBase();

export const api = {
  /**
   * Health Check server MySQL
   */
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth.php?action=roster_guru`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return !!data.success;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Login Siswa berdasarkan NISN
   */
  loginSiswa: async (nisn, studentId) => {
    try {
      const res = await fetch(`${API_BASE}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login_siswa', nisn, id: studentId || null })
      });
      return await res.json();
    } catch (err) {
      console.warn('API Offline, menggunakan fallback data lokal:', err);
      return { success: false, offline: true, message: 'Server tidak terjangkau' };
    }
  },

  /**
   * Login Guru BK / Wali Kelas
   */
  loginGuru: async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login_guru', username, password })
      });
      return await res.json();
    } catch (err) {
      console.warn('API Offline, menggunakan fallback data lokal:', err);
      return { success: false, offline: true, message: 'Server tidak terjangkau' };
    }
  },

  /**
   * Ambil Semua Daftar Paket Asesmen dari MySQL
   */
  fetchPackages: async () => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php?action=list_packages&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, packages: [] };
    }
  },

  /**
   * Ambil Paket Soal Asesmen (Spesifik atau Default)
   */
  fetchActivePackage: async (packageId = null) => {
    try {
      const q = packageId ? `&package_id=${encodeURIComponent(packageId)}` : '';
      const res = await fetch(`${API_BASE}/asesmen.php?action=get_package${q}&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Guru Buat Paket Asesmen Baru (Terpisah & Mandiri)
   */
  createPackage: async (pkg) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_package',
          title: pkg.title,
          targetClass: pkg.targetClass || 'ALL',
          deadline: pkg.deadline,
          instructions: pkg.instructions,
          questions: pkg.questions || []
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, message: 'Gagal membuat paket asesmen di MySQL' };
    }
  },

  /**
   * Simpan / Perbarui Paket Soal Tertentu ke MySQL
   */
  saveActivePackage: async (pkg) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_package',
          packageId: pkg.packageId || pkg.package_id || 'active_package',
          title: pkg.title,
          targetClass: pkg.targetClass || 'ALL',
          deadline: pkg.deadline,
          instructions: pkg.instructions,
          status: pkg.status || 'active',
          questions: pkg.questions
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, message: 'Gagal menghubungi server MySQL' };
    }
  },

  /**
   * Hapus Satu Butir Soal dari Paket Tertentu di MySQL
   */
  deleteQuestionItem: async (packageId, questionId) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'delete_question_item', 
          packageId: packageId || 'active_package',
          question_id: questionId 
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Hapus Paket Asesmen Permanen dari MySQL
   */
  deletePackage: async (packageId) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_package', packageId })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Buka / Tutup Sesi Asesmen Spesifik (Quick Toggle)
   */
  togglePackageStatus: async (packageId, status) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'toggle_package_status', 
          packageId: packageId || 'active_package',
          status 
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Tutup Sesi Asesmen, Simpan Arsip & Reset Pengerjaan Siswa
   */
  closeAndResetPackage: async ({ packageId, resetAnswers = true, deletePackage = false, counselorName = 'Drs. M. Rofik, M.Pd' }) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close_and_reset_package',
          packageId: packageId || 'active_package',
          resetAnswers: !!resetAnswers,
          deletePackage: !!deletePackage,
          counselorName
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, message: 'Gagal menghubungi server' };
    }
  },

  /**
   * Ambil Daftar Riwayat Sesi Ditutup (Arsip)
   */
  fetchClosedSessions: async () => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php?action=list_closed_sessions&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, sessions: [] };
    }
  },

  /**
   * Ambil Detail Arsip Sesi Tertentu
   */
  fetchClosedSession: async (sessionCode) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php?action=get_closed_session&session_code=${encodeURIComponent(sessionCode)}&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Kirim Jawaban Asesmen Siswa ke MySQL untuk Paket Tertentu
   */
  submitAsesmen: async (nisn, answers, packageId = 'active_package') => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'submit_jawaban', 
          nisn, 
          package_id: packageId,
          answers 
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Ambil Riwayat Pengisian Asesmen Siswa (Multi-Paket)
   */
  fetchStudentSubmissions: async (nisn) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php?action=student_submissions&nisn=${encodeURIComponent(nisn)}&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, submissions: [], byPackage: {} };
    }
  },

  /**
   * Hapus / Reset Pengisian Asesmen Siswa Spesifik oleh Guru BK
   */
  resetStudentSubmission: async (nisn, packageId = null) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reset_student_submission', 
          nisn, 
          packageId: packageId || 'ALL' 
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, message: 'Gagal menghubungi server' };
    }
  },

  /**
   * Hapus / Kosongkan Seluruh Data Jawaban Asesmen Siswa (Reset Total ke 0 Peserta)
   */
  resetAllSubmissions: async (packageId = null) => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reset_all_submissions', 
          packageId: packageId || 'ALL' 
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true, message: 'Gagal menghubungi server' };
    }
  },

  /**
   * Ambil Rekapitulasi Statistik Sekolah untuk Guru BK
   */
  fetchSummary: async () => {
    try {
      const res = await fetch(`${API_BASE}/asesmen.php?action=summary&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Ambil Percakapan Konseling Siswa
   */
  fetchKonseling: async (nisn) => {
    try {
      const res = await fetch(`${API_BASE}/konseling.php?nisn=${encodeURIComponent(nisn)}&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Kirim Pesan Konseling Daring
   */
  sendKonselingMessage: async (nisn, senderType, senderName, pesan) => {
    try {
      const res = await fetch(`${API_BASE}/konseling.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          nisn,
          senderType,
          senderName,
          pesan
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  },

  /**
   * Ambil Daftar Thread Konseling untuk Guru BK
   */
  fetchKonselingThreads: async () => {
    try {
      const res = await fetch(`${API_BASE}/konseling.php?action=threads&_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      return await res.json();
    } catch (err) {
      return { success: false, threads: [] };
    }
  },

  /**
   * Simpan Catatan / Rekomendasi Guru BK ke MySQL
   */
  saveCounselorNote: async (nisn, guruNama, catatan) => {
    try {
      const res = await fetch(`${API_BASE}/konseling.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_note',
          nisn,
          guruNama,
          catatan
        })
      });
      return await res.json();
    } catch (err) {
      return { success: false, offline: true };
    }
  }
};

export default api;
