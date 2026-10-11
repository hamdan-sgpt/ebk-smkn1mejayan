import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import Toast from './components/Toast';
import PrintReport from './components/PrintReport';
import InstallApkModal from './components/InstallApkModal';

import LoginView from './views/LoginView';
import HomeView from './views/HomeView';
import AssessmentView from './views/AssessmentView';
import MateriView from './views/MateriView';
import CounselingView from './views/CounselingView';
import GuruDashboardView from './views/GuruDashboardView';

import { api } from './services/api';

export default function App() {
  // 1. Theme State (persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ebk_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ebk_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. User Authentication State (ISOLATED VIA sessionStorage)
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('ebk_session_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveUserSession = (userData) => {
    setUser(userData);
    if (userData) {
      sessionStorage.setItem('ebk_session_user', JSON.stringify(userData));
    } else {
      sessionStorage.removeItem('ebk_session_user');
    }
  };

  // 3. Navigation Tab State
  const [activeTab, setActiveTab] = useState(() => {
    if (user?.role === 'guru') return 'dashboard';
    return 'home';
  });

  // 4. Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = useCallback((msg, type = 'info') => {
    setToastMessage(msg);
  }, []);

  // 5. Multi-Package Assessments from MySQL
  const [packagesList, setPackagesList] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  const loadPackages = useCallback(async () => {
    setIsLoadingPackages(true);
    try {
      const res = await api.fetchPackages();
      if (res && res.success && Array.isArray(res.packages)) {
        setPackagesList(res.packages);
      }
    } catch (err) {
      console.warn('Gagal memuat daftar paket asesmen:', err);
    } finally {
      setIsLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // 6. Student Assessment Results (Multi-Paket & per-user)
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [studentAssessment, setStudentAssessment] = useState(() => {
    if (!user?.nisn) return null;
    try {
      const saved = localStorage.getItem(`ebk_assessment_${user.nisn}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loadStudentHistory = useCallback(async (nisn) => {
    if (!nisn) return;
    try {
      const res = await api.fetchStudentSubmissions(nisn);
      if (res && res.success) {
        const byPkg = res.byPackage || {};
        setStudentSubmissions(byPkg);
        const submissionsList = Object.values(byPkg);
        if (submissionsList.length > 0) {
          const latest = submissionsList[0];
          const asmObj = {
            score: latest.total_score,
            total_score: latest.total_score,
            level: latest.level,
            answers: latest.answers,
            dimTugas: latest.dimensi_tugas || 0,
            dimEksplorasi: latest.dimensi_eksplorasi || 0,
            dimKeputusan: latest.dimensi_keputusan || 0,
            dimKetahanan: latest.dimensi_ketahanan || 0,
            completedAt: latest.completed_at
          };
          setStudentAssessment(asmObj);
          localStorage.setItem(`ebk_assessment_${nisn}`, JSON.stringify(asmObj));
        } else {
          // Jika pengerjaan siswa di-reset atau dihapus oleh guru di MySQL, bersihkan status di HP siswa secara REALTIME
          setStudentAssessment(prev => {
            if (prev !== null) {
              if (showToast) showToast('Asesmen Anda telah di-reset oleh Guru BK. Anda dapat mengisi kembali.', 'info');
            }
            return null;
          });
          setStudentSubmissions({});
          localStorage.removeItem(`ebk_assessment_${nisn}`);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat riwayat siswa:', err);
    }
  }, [showToast]);

  // Sync state when user changes
  useEffect(() => {
    if (user?.nisn) {
      try {
        const savedAsm = localStorage.getItem(`ebk_assessment_${user.nisn}`);
        setStudentAssessment(savedAsm ? JSON.parse(savedAsm) : null);
      } catch (err) {
        console.warn(err);
      }
      loadStudentHistory(user.nisn);
    }
  }, [user?.nisn, loadStudentHistory]);

  // Real-time synchronization pulse (Auto-sync every 2.5 seconds for students & packages)
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      if (user.nisn) {
        loadStudentHistory(user.nisn);
      }
      loadPackages();
    }, 2500);

    return () => clearInterval(intervalId);
  }, [user, loadStudentHistory, loadPackages]);

  // PWA WebAPK Installation Prompt Handler
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = useCallback(() => {
    setIsInstallModalOpen(true);
  }, []);

  // 7. Counseling Requests
  const [counselingRequests, setCounselingRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('ebk_counseling_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 8. Modals (Profile & Print Report)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [printReportStudent, setPrintReportStudent] = useState(null);

  // Authentication Handlers
  const handleLoginStudent = (studentData) => {
    const studentUser = {
      role: 'siswa',
      nisn: studentData.nisn,
      nis: studentData.nis,
      name: studentData.nama,
      nama: studentData.nama,
      studentClass: studentData.kelas,
      kelas: studentData.kelas,
      jurusan: studentData.jurusan,
      gender: studentData.gender
    };
    saveUserSession(studentUser);
    setActiveTab('home');
    showToast(`Selamat datang, ${studentUser.name}!`);
  };

  const handleLoginTeacher = (teacherData) => {
    const teacherUser = {
      role: 'guru',
      id: teacherData.id,
      name: teacherData.name,
      nama: teacherData.name,
      roleTitle: teacherData.roleTitle || 'Guru Bimbingan Konseling',
      nip: teacherData.nip || '-'
    };
    saveUserSession(teacherUser);
    setActiveTab('dashboard');
    showToast(`Selamat datang di Panel Pembimbing, ${teacherUser.name}!`);
  };

  const handleLogout = () => {
    saveUserSession(null);
    setIsProfileModalOpen(false);
    showToast('Berhasil keluar dari akun.');
  };

  // Student Actions
  const handleSaveAssessment = async (resultData, targetPackageId = 'active_package') => {
    if (!user?.nisn) return;
    
    // Save to localStorage immediately
    localStorage.setItem(`ebk_assessment_${user.nisn}`, JSON.stringify(resultData));
    setStudentAssessment(resultData);

    // Save to MySQL via API
    try {
      const res = await api.submitAsesmen(user.nisn, resultData.answers, targetPackageId);
      if (res && res.success) {
        showToast('Hasil asesmen berhasil disimpan ke database MySQL SMKN 1 Mejayan.');
        loadStudentHistory(user.nisn);
      } else {
        showToast('Tersimpan di perangkat lokal.');
      }
    } catch {
      showToast('Tersimpan di perangkat lokal.');
    }
  };

  const handleRequestCounseling = (newRequest) => {
    const updated = [newRequest, ...counselingRequests];
    localStorage.setItem('ebk_counseling_requests', JSON.stringify(updated));
    setCounselingRequests(updated);
  };

  // Printing Handlers
  const handlePrintReport = (student) => {
    let st = student || user;
    if (studentAssessment && (!st || st.nisn === user?.nisn)) {
      st = { ...st, totalScore: studentAssessment.score, level: studentAssessment.level, assessment: studentAssessment };
    }
    setPrintReportStudent(st);
  };

  return (
    <div className="app-layout">
      {/* Universal Header with Desktop Navigation */}
      <Header
        user={user}
        theme={theme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleTheme={toggleTheme}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onInstallApp={handleInstallApp}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {!user ? (
          <LoginView
            onLoginStudent={handleLoginStudent}
            onLoginTeacher={handleLoginTeacher}
            showToast={showToast}
          />
        ) : user.role === 'guru' ? (
          <GuruDashboardView
            user={user}
            activeTabNav={activeTab}
            onNavigate={setActiveTab}
            onPrintReport={handlePrintReport}
            showToast={showToast}
            onPackagesChange={loadPackages}
          />
        ) : (
          /* Student Views */
          <div className="student-views-container">
            {activeTab === 'home' && (
              <HomeView
                user={user}
                assessmentResult={studentAssessment}
                packagesList={packagesList}
                onNavigate={setActiveTab}
                onPrintReport={() => handlePrintReport(user)}
                showToast={showToast}
              />
            )}

            {activeTab === 'assessment' && (
              <AssessmentView
                user={user}
                packagesList={packagesList}
                studentSubmissions={studentSubmissions}
                onSaveAssessment={handleSaveAssessment}
                onRefreshPackages={loadPackages}
                onPrintReport={() => handlePrintReport(user)}
                showToast={showToast}
              />
            )}

            {activeTab === 'materi' && (
              <MateriView showToast={showToast} />
            )}

            {activeTab === 'counseling' && (
              <CounselingView
                user={user}
                counselingRequests={counselingRequests}
                onRequestCounseling={handleRequestCounseling}
                showToast={showToast}
              />
            )}
          </div>
        )}
      </main>

      {/* Universal Floating Bottom Navigation (Siswa & Guru di Layar Ponsel) */}
      {user && (
        <BottomNav
          role={user.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}

      {/* Global Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* User Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Profil Akun e-BK"
      >
        {user && (
          <div className="profile-modal-body">
            <div className="profile-modal-card">
              <div className="profile-role-tag">
                {user.role === 'guru' ? 'Tenaga Pendidik / Konselor Pembimbing' : 'Siswa Konseli Terdaftar'}
              </div>
              <div className="profile-name">
                {user.name}
              </div>
              <div className="profile-meta">
                {user.role === 'guru' ? user.roleTitle : `${user.studentClass} · ${user.jurusan}`}
              </div>
              {user.role === 'siswa' && (
                <div className="profile-nisn">
                  NISN: <span className="tabular-nums font-bold">{user.nisn}</span>
                </div>
              )}
            </div>

            <div className="profile-modal-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsInstallModalOpen(true);
                }}
                style={{ flex: '1 1 100%' }}
              >
                Pasang Aplikasi di HP
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsProfileModalOpen(false)}
                style={{ flex: 1 }}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleLogout}
                style={{ flex: 1 }}
              >
                Keluar Akun
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Printable Assessment Report Modal */}
      {printReportStudent && (
        <PrintReport
          student={printReportStudent}
          onClose={() => setPrintReportStudent(null)}
        />
      )}

      {/* Install PWA / APK Modal Dialog */}
      <InstallApkModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredInstallPrompt={deferredInstallPrompt}
        onInstallPromptSuccess={() => setDeferredInstallPrompt(null)}
        showToast={showToast}
      />
    </div>
  );
}
