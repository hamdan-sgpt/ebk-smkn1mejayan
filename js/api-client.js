/**
 * e-BK Career Self-Efficacy - REST API Client Layer
 * SMKN 1 Mejayan
 * 
 * Jembatan komunikasi antara Frontend Web App / PWA dengan Backend MySQL (PHP).
 * Mendukung mode Offline-First (tetap berfungsi via LocalStorage jika backend belum di-deploy).
 */

(function () {
  'use strict';

  const STORAGE_KEY_API_URL = 'ebk_api_base_url';
  
  // Endpoint API default (relatif ke domain saat ini atau hosting)
  let apiBaseUrl = localStorage.getItem(STORAGE_KEY_API_URL) || './api';

  const ebkApi = {
    getBaseUrl: function () {
      return apiBaseUrl;
    },

    setBaseUrl: function (url) {
      apiBaseUrl = (url || './api').replace(/\/+$/, '');
      localStorage.setItem(STORAGE_KEY_API_URL, apiBaseUrl);
    },

    /**
     * Memeriksa ketersediaan server database MySQL
     * @returns {Promise<boolean>}
     */
    checkHealth: async function () {
      try {
        const res = await fetch(`${apiBaseUrl}/auth.php?action=roster_guru`, {
          method: 'GET',
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          return !!data.success;
        }
        return false;
      } catch (e) {
        return false;
      }
    },

    /**
     * Login Siswa berdasarkan NISN
     */
    loginSiswa: async function (nisn, studentId) {
      try {
        const res = await fetch(`${apiBaseUrl}/auth.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login_siswa', nisn: nisn, id: studentId || null })
        });
        const data = await res.json();
        return data;
      } catch (err) {
        console.warn('API Offline, menggunakan fallback data lokal:', err);
        return { success: false, offline: true, message: 'Server tidak terjangkau' };
      }
    },

    /**
     * Login Guru BK / Wali Kelas
     */
    loginGuru: async function (username, password) {
      try {
        const res = await fetch(`${apiBaseUrl}/auth.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login_guru', username: username, password: password })
        });
        return await res.json();
      } catch (err) {
        console.warn('API Offline, menggunakan autentikasi lokal:', err);
        return { success: false, offline: true, message: 'Server tidak terjangkau' };
      }
    },

    /**
     * Simpan Hasil Asesmen 10 Butir Instrumen Bandura
     */
    submitAsesmen: async function (nisn, answers) {
      try {
        const res = await fetch(`${apiBaseUrl}/asesmen.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submit_jawaban', nisn: nisn, answers: answers })
        });
        return await res.json();
      } catch (err) {
        console.warn('Gagal sinkron ke database SQL, disimpan lokal:', err);
        return { success: false, offline: true };
      }
    },

    /**
     * Ambil Paket Soal Asesmen Aktif dari MySQL (Real-time untuk Siswa & Guru)
     */
    fetchActivePackage: async function () {
      try {
        const res = await fetch(`${apiBaseUrl}/asesmen.php?action=get_package`, {
          method: 'GET',
          cache: 'no-store'
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    },

    /**
     * Simpan / Unggah Paket Soal Butiran ke MySQL secara Real-time
     */
    saveActivePackage: async function (packageData) {
      try {
        const res = await fetch(`${apiBaseUrl}/asesmen.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_package',
            title: packageData.title,
            targetClass: packageData.targetClass || 'ALL',
            deadline: packageData.deadline,
            instructions: packageData.instructions,
            questions: packageData.questions
          })
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true, message: 'Gagal menghubungi server' };
      }
    },

    /**
     * Tutup atau Buka Sesi Asesmen
     */
    togglePackageStatus: async function (status) {
      try {
        const res = await fetch(`${apiBaseUrl}/asesmen.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'toggle_package_status', status: status })
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    },

    /**
     * Hapus Paket Asesmen Permanen dari Server MySQL
     */
    deleteActivePackage: async function () {
      try {
        const res = await fetch(`${apiBaseUrl}/asesmen.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_package' })
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    },

    /**
     * Hapus Satu Butir Soal Spesifik dari Paket di Server MySQL
     */
    deleteQuestionItem: async function (questionId) {
      try {
        const res = await fetch(`${apiBaseUrl}/asesmen.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_question_item', question_id: questionId })
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    },

    /**
     * Ambil Rekapitulasi & Statistik Sekolah untuk Dasbor Guru BK
     */
    fetchSummary: async function () {
      try {
        const res = await fetch(`${apiBaseUrl}/asesmen.php?action=summary`, {
          method: 'GET',
          cache: 'no-store'
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    },

    /**
     * Ambil Data Percakapan Konseling & Catatan Guru BK
     */
    fetchKonseling: async function (nisn) {
      try {
        const res = await fetch(`${apiBaseUrl}/konseling.php?nisn=${encodeURIComponent(nisn)}`, {
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
    sendKonselingMessage: async function (nisn, senderType, senderName, pesan) {
      try {
        const res = await fetch(`${apiBaseUrl}/konseling.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_message',
            nisn: nisn,
            senderType: senderType,
            senderName: senderName,
            pesan: pesan
          })
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    },

    /**
     * Simpan Catatan & Rekomendasi Guru Pembimbing BK
     */
    saveCounselorNote: async function (nisn, guruNama, catatan) {
      try {
        const res = await fetch(`${apiBaseUrl}/konseling.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_note',
            nisn: nisn,
            guruNama: guruNama,
            catatan: catatan
          })
        });
        return await res.json();
      } catch (err) {
        return { success: false, offline: true };
      }
    }
  };

  window.ebkApi = ebkApi;
})();
