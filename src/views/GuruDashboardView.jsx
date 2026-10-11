import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, ClipboardList, MessageSquare, Plus, Trash2, RefreshCw, 
  Search, Filter, CheckCircle2, AlertCircle, Clock, FileText, 
  Printer, Send, ChevronRight, ChevronLeft, X, UserCheck, BarChart3,
  Sliders, ShieldCheck, Download, FileSpreadsheet, Archive, CheckSquare, Square
} from 'lucide-react';
import { api } from '../services/api';
import { DATA_SISWA_KELAS_11 as studentsData } from '../data/students';
import { DEFAULT_ASSESSMENT_QUESTIONS as defaultQuestions } from '../data/assessmentData';

const classesList = [
  'XI RPL 1', 'XI RPL 2',
  'XI TKR 1', 'XI TKR 2', 'XI TKR 3',
  'XI APHP 1', 'XI APHP 2',
  'XI TSM 1', 'XI TSM 2',
  'XI TITL 1', 'XI TITL 2',
  'XI TP 1', 'XI TP 2',
  'XI TBG 1'
];

const DIMENSIONS = [
  { id: 1, label: 'Kinerja Masa Lalu (Pengalaman Keberhasilan)', short: 'Kinerja' },
  { id: 2, label: 'Pengalaman Vikarius (Belajar dari Model/Alumni)', short: 'Vikarius' },
  { id: 3, label: 'Persuasi Sosial (Dukungan Guru & Keluarga)', short: 'Persuasi' },
  { id: 4, label: 'Pengelolaan Emosi (Mengatasi Kecemasan Karier)', short: 'Emosi' }
];

export default function GuruDashboardView({ user, activeTabNav, onNavigate, onPrintReport, showToast, onPackagesChange }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (activeTabNav === 'studio') return 'asesmen';
    if (activeTabNav === 'guru_counseling') return 'konseling';
    return 'siswa';
  });

  useEffect(() => {
    if (activeTabNav === 'studio') setActiveTab('asesmen');
    else if (activeTabNav === 'guru_counseling') setActiveTab('konseling');
    else if (activeTabNav === 'dashboard') setActiveTab('siswa');
  }, [activeTabNav]);

  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [summaryStats, setSummaryStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [activePackage, setActivePackage] = useState(null);
  const [counselingThreads, setCounselingThreads] = useState([]);
  
  // Filters for Students Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedPackageFilter, setSelectedPackageFilter] = useState('ALL'); // 'ALL' or specific packageId
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'DONE', 'PENDING'
  const [levelFilter, setLevelFilter] = useState('ALL');
  
  // Modals & Active Selections
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [studentNote, setStudentNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isResettingStudent, setIsResettingStudent] = useState(false);
  
  // Multi-Package State for Asesmen
  const [packagesList, setPackagesList] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState('active_package');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDeadline, setCreateDeadline] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Close & Reset Session Modal State
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [packageToClose, setPackageToClose] = useState(null);
  const [isResetAnswersChecked, setIsResetAnswersChecked] = useState(true);
  const [isDeletePackageChecked, setIsDeletePackageChecked] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [closedSessions, setClosedSessions] = useState([]);

  // Asesmen Studio State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionDim, setNewQuestionDim] = useState(1);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState('');
  const [isUpdatingDeadline, setIsUpdatingDeadline] = useState(false);
  
  // Counseling Active Chat
  const [activeChatNisn, setActiveChatNisn] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReplyText, setChatReplyText] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Load all initial data from MySQL
  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [sumRes, pkgsRes, thrRes, closedRes] = await Promise.all([
        api.fetchSummary(),
        api.fetchPackages(),
        api.fetchKonselingThreads(),
        api.fetchClosedSessions()
      ]);

      if (sumRes && sumRes.success) {
        setSummaryStats(sumRes.stats);
        setAssessments(sumRes.assessments || []);
        setAllSubmissions(sumRes.allSubmissions || []);
      }
      if (pkgsRes && pkgsRes.success && Array.isArray(pkgsRes.packages) && pkgsRes.packages.length > 0) {
        setPackagesList(pkgsRes.packages);
        const currentPkg = pkgsRes.packages.find(p => p.packageId === selectedPackageId) || pkgsRes.packages[0];
        if (currentPkg) {
          setActivePackage(currentPkg);
          setSelectedPackageId(currentPkg.packageId);
          if (currentPkg.deadline) {
            const dt = new Date(currentPkg.deadline);
            if (!isNaN(dt.getTime())) {
              setDeadlineInput(currentPkg.deadline.slice(0, 16));
            } else {
              setDeadlineInput('');
            }
          } else {
            setDeadlineInput('');
          }
        }
      } else {
        setActivePackage(null);
      }
      if (thrRes && thrRes.success) {
        setCounselingThreads(thrRes.threads || []);
      }
      if (closedRes && closedRes.success) {
        setClosedSessions(closedRes.sessions || []);
      }
    } catch (err) {
      console.error('Error loading Guru dashboard data:', err);
      if (showToast) showToast('Gagal memuat data dari server MySQL', 'error');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // Merge official 500 students with package-aware assessment results
  const mergedStudents = useMemo(() => {
    // Build Map: nisn -> Map of packageId -> submission
    const studentSubMap = new Map();

    // 1. Process allSubmissions
    allSubmissions.forEach(sub => {
      const nisnKey = String(sub.siswa_nisn).trim();
      if (!studentSubMap.has(nisnKey)) {
        studentSubMap.set(nisnKey, new Map());
      }
      const pkgKey = sub.package_id || 'active_package';
      studentSubMap.get(nisnKey).set(pkgKey, sub);
      if (!studentSubMap.get(nisnKey).has('latest')) {
        studentSubMap.get(nisnKey).set('latest', sub);
      }
    });

    // 2. Also ensure current assessments are mapped
    assessments.forEach(a => {
      const nisnKey = String(a.siswa_nisn).trim();
      if (!studentSubMap.has(nisnKey)) {
        studentSubMap.set(nisnKey, new Map());
      }
      const pkgKey = a.package_id || 'active_package';
      if (!studentSubMap.get(nisnKey).has(pkgKey)) {
        studentSubMap.get(nisnKey).set(pkgKey, a);
      }
      if (!studentSubMap.get(nisnKey).has('latest')) {
        studentSubMap.get(nisnKey).set('latest', a);
      }
    });

    return studentsData.map(st => {
      const nisnKey = String(st.nisn).trim();
      const pkgMap = studentSubMap.get(nisnKey);

      let matchedSubmission = null;
      if (pkgMap) {
        if (selectedPackageFilter === 'ALL') {
          // If viewing all, match latest completed
          matchedSubmission = pkgMap.get('latest') || Array.from(pkgMap.values())[0] || null;
        } else {
          // Match specifically for selected package
          matchedSubmission = pkgMap.get(selectedPackageFilter) || null;
          if (!matchedSubmission && selectedPackageFilter === 'active_package') {
            matchedSubmission = pkgMap.get('active_package') || pkgMap.get('') || null;
          }
        }
      }

      const currentPkgObj = packagesList.find(p => p.packageId === (matchedSubmission?.package_id || selectedPackageFilter));

      return {
        ...st,
        hasCompleted: !!matchedSubmission,
        assessment: matchedSubmission || null,
        totalScore: matchedSubmission ? Number(matchedSubmission.total_score) : null,
        level: matchedSubmission ? matchedSubmission.level : 'Belum Asesmen',
        completedAt: matchedSubmission ? matchedSubmission.completed_at : null,
        packageId: matchedSubmission ? (matchedSubmission.package_id || 'active_package') : null,
        packageTitle: currentPkgObj?.title || (matchedSubmission ? 'Asesmen 1' : '-')
      };
    });
  }, [allSubmissions, assessments, selectedPackageFilter, packagesList]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return mergedStudents.filter(s => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = s.nama.toLowerCase().includes(q);
        const matchNisn = s.nisn.toLowerCase().includes(q);
        if (!matchName && !matchNisn) return false;
      }
      // Class
      if (selectedClass !== 'ALL' && s.kelas !== selectedClass) return false;
      // Status
      if (statusFilter === 'DONE' && !s.hasCompleted) return false;
      if (statusFilter === 'PENDING' && s.hasCompleted) return false;
      // Level
      if (levelFilter !== 'ALL' && s.level !== levelFilter) return false;

      return true;
    });
  }, [mergedStudents, searchQuery, selectedClass, statusFilter, levelFilter]);

  // Open Student Detail Modal
  const handleOpenStudentDetail = async (student) => {
    setSelectedStudent(student);
    setStudentNote('');
    setStudentDetailOpen(true);

    if (student.hasCompleted) {
      try {
        const chatRes = await api.fetchKonseling(student.nisn);
        if (chatRes && chatRes.success && chatRes.counselorNote) {
          setStudentNote(chatRes.counselorNote);
        }
      } catch (err) {
        console.error('Gagal mengambil catatan:', err);
      }
    }
  };

  // Save Counselor Note to MySQL
  const handleSaveStudentNote = async () => {
    if (!selectedStudent) return;
    setIsSavingNote(true);
    try {
      const res = await api.saveCounselorNote(
        selectedStudent.nisn, 
        user.nama || 'Drs. M. Rofik, M.Pd', 
        studentNote
      );
      if (res && res.success) {
        if (showToast) showToast('Catatan pembimbing tersimpan ke MySQL.', 'success');
      } else {
        if (showToast) showToast('Gagal menyimpan catatan.', 'error');
      }
    } catch {
      if (showToast) showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Hapus / Reset Hasil Asesmen Siswa Tertentu secara Real-Time
  const handleResetStudentSubmission = async (nisn, studentName) => {
    if (!window.confirm(`Hapus / reset data jawaban asesmen siswa ${studentName || nisn} secara real-time dari database?\n\nSetelah dihapus, akun siswa di HP mereka akan langsung kembali ke status 'Belum Mengisi' secara otomatis tanpa perlu refresh.`)) {
      return;
    }
    setIsResettingStudent(true);
    try {
      const res = await api.resetStudentSubmission(nisn, 'ALL');
      if (res && res.success) {
        if (showToast) showToast(`Jawaban ${studentName || nisn} berhasil dihapus dari database. Siswa kini dapat mengisi ulang.`, 'success');
        setStudentDetailOpen(false);
        await loadData(false);
      } else {
        if (showToast) showToast(res.message || 'Gagal mereset jawaban siswa.', 'error');
      }
    } catch {
      if (showToast) showToast('Gagal menghubungi server database.', 'error');
    } finally {
      setIsResettingStudent(false);
    }
  };

  // Hapus / Kosongkan Seluruh Data Jawaban Pengerjaan Siswa (Reset ke 0 Peserta)
  const handleResetAllSubmissions = async () => {
    if (!window.confirm('PERHATIAN: Apakah Anda yakin ingin mengosongkan SELURUH data jawaban siswa?\\n\\n- Seluruh hasil pengerjaan asesmen siswa akan dihapus dari database.\\n- Status semua 500 siswa akan kembali ke \"Belum Mengisi\" (0 peserta).\\n- Paket soal bawaan tetap tersimpan dan aktif.\\n\\nLanjutkan pembersihan data?')) {
      return;
    }
    try {
      const res = await api.resetAllSubmissions('ALL');
      if (res && res.success) {
        // Bersihkan seluruh cache localStorage asesmen di browser
        try {
          Object.keys(localStorage).forEach(k => {
            if (k.startsWith('ebk_assessment_')) {
              localStorage.removeItem(k);
            }
          });
        } catch {}
        if (showToast) showToast('Seluruh data pengerjaan siswa berhasil dibersihkan! Status 500 siswa kini 0 peserta.', 'success');
        await loadData(false);
      } else {
        if (showToast) showToast(res.message || 'Gagal membersihkan data.', 'error');
      }
    } catch {
      if (showToast) showToast('Gagal menghubungi server database.', 'error');
    }
  };

  // Select which package to manage
  const handleSelectPackage = (pkgId) => {
    setSelectedPackageId(pkgId);
    const found = packagesList.find(p => p.packageId === pkgId);
    if (found) {
      setActivePackage(found);
      if (found.deadline) {
        const dt = new Date(found.deadline);
        if (!isNaN(dt.getTime())) {
          setDeadlineInput(found.deadline.slice(0, 16));
        } else {
          setDeadlineInput('');
        }
      } else {
        setDeadlineInput('');
      }
    }
  };

  // Create a brand new independent assessment package
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!createTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await api.createPackage({
        title: createTitle.trim(),
        deadline: createDeadline || null,
        targetClass: 'ALL',
        instructions: 'Pilihlah skala 1 (Sangat Ragu) sampai 5 (Sangat Yakin) sesuai keyakinan dirimu saat ini.',
        questions: [] // Dimulai bersih / 0 butir soal
      });
      if (res && res.success && res.package) {
        setPackagesList(prev => [res.package, ...prev]);
        setActivePackage(res.package);
        setSelectedPackageId(res.package.packageId);
        setDeadlineInput(createDeadline ? createDeadline.slice(0, 16) : '');
        setIsCreateModalOpen(false);
        setCreateTitle('');
        setCreateDeadline('');
        if (onPackagesChange) onPackagesChange();
        if (showToast) showToast(`Paket "${res.package.title}" berhasil dibuat! Silakan tambahkan butir soal di bawah.`, 'success');
      } else {
        if (showToast) showToast(res.message || 'Gagal membuat paket asesmen', 'error');
      }
    } catch {
      if (showToast) showToast('Gagal menghubungi server database.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete an entire package
  const handleDeletePackage = async (pkgId, pkgTitle) => {
    if (!window.confirm(`Hapus paket "${pkgTitle}" secara permanen beserta seluruh butir soalnya dari database?`)) {
      return;
    }
    try {
      const res = await api.deletePackage(pkgId);
      if (res && res.success) {
        await loadData(false);
        if (onPackagesChange) onPackagesChange();
        if (showToast) showToast(`Paket "${pkgTitle}" berhasil dihapus dari sistem.`, 'success');
      } else {
        if (showToast) showToast(res.message || 'Gagal menghapus paket.', 'error');
      }
    } catch {
      if (showToast) showToast('Gagal menghapus paket dari server.', 'error');
    }
  };

  // Toggle package active / closed in MySQL for currently selected package
  const handleTogglePackageStatus = async () => {
    if (!activePackage) return;
    const newStatus = activePackage.status === 'active' ? 'closed' : 'active';
    try {
      const res = await api.togglePackageStatus(activePackage.packageId, newStatus);
      if (res && res.success) {
        setActivePackage(prev => ({ ...prev, status: newStatus }));
        setPackagesList(prev => prev.map(p => p.packageId === activePackage.packageId ? { ...p, status: newStatus } : p));
        if (onPackagesChange) onPackagesChange();
        if (showToast) showToast(`Sesi "${activePackage.title}" berhasil ${newStatus === 'active' ? 'diaktifkan' : 'ditutup'}.`, 'success');
      }
    } catch {
      if (showToast) showToast('Gagal memperbarui status sesi di server.', 'error');
    }
  };

  // Delete single question item from current package in MySQL
  const handleDeleteQuestion = async (qId, qIndex) => {
    if (!activePackage) return;
    if (!window.confirm(`Yakin ingin menghapus butir soal #${qIndex + 1} dari "${activePackage.title}"?`)) {
      return;
    }

    try {
      const res = await api.deleteQuestionItem(activePackage.packageId, qId);
      if (res && res.success) {
        const updatedQ = res.questions || activePackage.questions.filter(q => q.id !== qId);
        setActivePackage(prev => ({ ...prev, questions: updatedQ }));
        setPackagesList(prev => prev.map(p => p.packageId === activePackage.packageId ? { ...p, questions: updatedQ, questionsCount: updatedQ.length } : p));
        if (onPackagesChange) onPackagesChange();
        if (showToast) showToast(`Butir soal #${qIndex + 1} berhasil dihapus dari "${activePackage.title}".`, 'success');
      } else {
        if (showToast) showToast('Gagal menghapus butir soal di server.', 'error');
      }
    } catch {
      if (showToast) showToast('Gagal menghubungi server database.', 'error');
    }
  };

  // Add new question to CURRENT package only in MySQL
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !activePackage) return;

    setIsAddingQuestion(true);
    try {
      const currentList = Array.isArray(activePackage.questions) ? [...activePackage.questions] : [];
      const newId = `q_${Date.now()}`;
      const newQ = {
        id: newId,
        text: newQuestionText.trim(),
        dimId: Number(newQuestionDim)
      };

      const updatedList = [...currentList, newQ];
      const pkgToSave = {
        packageId: activePackage.packageId,
        title: activePackage.title,
        targetClass: activePackage.targetClass || 'ALL',
        deadline: activePackage.deadline || null,
        instructions: activePackage.instructions || '',
        status: activePackage.status || 'active',
        questions: updatedList
      };

      const res = await api.saveActivePackage(pkgToSave);
      if (res && res.success) {
        setActivePackage(prev => ({
          ...prev,
          questions: updatedList
        }));
        setPackagesList(prev => prev.map(p => p.packageId === activePackage.packageId ? { ...p, questions: updatedList, questionsCount: updatedList.length } : p));
        setNewQuestionText('');
        if (onPackagesChange) onPackagesChange();
        if (showToast) showToast(`Butir soal baru berhasil ditambahkan ke "${activePackage.title}".`, 'success');
      } else {
        if (showToast) showToast('Gagal menyimpan soal ke database.', 'error');
      }
    } catch {
      if (showToast) showToast('Gagal menghubungi database.', 'error');
    } finally {
      setIsAddingQuestion(false);
    }
  };

  // Reset to default 10 Bandura questions for current package
  const handleRestoreDefaultQuestions = async () => {
    if (!activePackage) return;
    if (!window.confirm(`Pulihkan instrumen "${activePackage.title}" ke 10 Butir Baku Bandura?`)) {
      return;
    }

    try {
      const pkgToSave = {
        packageId: activePackage.packageId,
        title: activePackage.title,
        targetClass: activePackage.targetClass || 'ALL',
        deadline: activePackage.deadline || null,
        instructions: activePackage.instructions || 'Pilihlah skala 1 sampai 5 yang paling mencerminkan kondisi keyakinan diri Anda saat ini.',
        status: activePackage.status || 'active',
        questions: defaultQuestions
      };

      const res = await api.saveActivePackage(pkgToSave);
      if (res && res.success) {
        setActivePackage(prev => ({
          ...prev,
          questions: defaultQuestions
        }));
        setPackagesList(prev => prev.map(p => p.packageId === activePackage.packageId ? { ...p, questions: defaultQuestions, questionsCount: defaultQuestions.length } : p));
        if (onPackagesChange) onPackagesChange();
        if (showToast) showToast('Instrumen berhasil dikembalikan ke 10 butir baku Bandura.', 'success');
      }
    } catch {
      if (showToast) showToast('Gagal mereset butir soal.', 'error');
    }
  };

  // Update Deadline for current package
  const handleSaveDeadline = async () => {
    if (!deadlineInput || !activePackage) return;
    setIsUpdatingDeadline(true);
    try {
      const formatted = deadlineInput.replace('T', ' ') + ':00';
      const pkgToSave = {
        packageId: activePackage.packageId,
        title: activePackage.title,
        targetClass: activePackage.targetClass || 'ALL',
        deadline: formatted,
        instructions: activePackage.instructions || '',
        status: activePackage.status || 'active',
        questions: activePackage.questions || []
      };

      const res = await api.saveActivePackage(pkgToSave);
      if (res && res.success) {
        setActivePackage(prev => ({ ...prev, deadline: formatted }));
        setPackagesList(prev => prev.map(p => p.packageId === activePackage.packageId ? { ...p, deadline: formatted } : p));
        if (onPackagesChange) onPackagesChange();
        if (showToast) showToast(`Tenggat waktu untuk "${activePackage.title}" diperbarui.`, 'success');
      }
    } catch {
      if (showToast) showToast('Gagal memperbarui batas waktu.', 'error');
    } finally {
      setIsUpdatingDeadline(false);
    }
  };

  // Select Counseling Chat
  const handleSelectChatThread = async (nisn) => {
    setActiveChatNisn(nisn);
    try {
      const res = await api.fetchKonseling(nisn);
      if (res && res.success) {
        setChatMessages(res.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Guru reply in chat
  const handleSendGuruReply = async (e) => {
    e.preventDefault();
    if (!chatReplyText.trim() || !activeChatNisn) return;

    setIsSendingChat(true);
    try {
      const res = await api.sendKonselingMessage(
        activeChatNisn,
        'guru',
        user.nama || 'Drs. M. Rofik, M.Pd (Guru BK)',
        chatReplyText.trim()
      );

      if (res && res.success) {
        setChatMessages(prev => [...prev, res.entry]);
        setChatReplyText('');
        if (showToast) showToast('Respon konseling terkirim ke siswa.', 'success');
      }
    } catch {
      if (showToast) showToast('Gagal mengirim pesan.', 'error');
    } finally {
      setIsSendingChat(false);
    }
  };

  // Utility: Export array to UTF-8 BOM CSV compatible with Microsoft Excel on Windows
  const exportToExcelCSV = (filename, headers, rows) => {
    const csvRows = [
      headers.map(h => `"${String(h ?? '').replace(/"/g, '""')}"`).join(','),
      ...rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    ];
    // UTF-8 BOM (\uFEFF) ensures Excel displays Indonesian accents and headers without mojibake
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 4000);
  };

  // Export currently filtered table to Excel
  const handleExportFilteredTable = () => {
    const pkgLabel = selectedPackageFilter === 'ALL' 
      ? 'Semua Paket' 
      : (packagesList.find(p => p.packageId === selectedPackageFilter)?.title || selectedPackageFilter);

    const filename = `Rekap_Siswa_EBK_${selectedClass !== 'ALL' ? selectedClass : 'SemuaKelas'}_${new Date().toISOString().slice(0, 10)}.csv`;
    const headers = [
      'No', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 
      'Status Pengerjaan', 'Paket Asesmen Terpilih', 'Skor Total (Maks 50)', 
      'Tingkat Efikasi Bandura', 'Tanggal Pengerjaan'
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.nama,
      s.kelas,
      s.jurusan,
      s.hasCompleted ? 'Sudah Selesai' : 'Belum Selesai',
      s.hasCompleted ? s.packageTitle : pkgLabel,
      s.totalScore !== null ? s.totalScore : '-',
      s.level,
      s.completedAt || '-'
    ]);

    exportToExcelCSV(filename, headers, rows);
    if (showToast) showToast(`File Excel rekapan "${filename}" berhasil diunduh.`, 'success');
  };

  // Open modal to close an assessment package
  const handleOpenCloseModal = (pkg) => {
    setPackageToClose(pkg || activePackage);
    setIsResetAnswersChecked(true); // Default: reset answers for clean next cycle
    setIsDeletePackageChecked(false); // Default: keep in Bank Soal unless requested
    setIsCloseModalOpen(true);
  };

  // Confirm close package: saves snapshot, resets answers, downloads Excel
  const handleConfirmClosePackage = async () => {
    if (!packageToClose) return;
    setIsClosingSession(true);

    try {
      const res = await api.closeAndResetPackage({
        packageId: packageToClose.packageId,
        resetAnswers: isResetAnswersChecked,
        deletePackage: isDeletePackageChecked,
        counselorName: user?.nama || 'Drs. M. Rofik, M.Pd'
      });

      if (res && res.success) {
        const submissions = res.submissions || [];
        const safeTitle = (packageToClose.title || 'Asesmen').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `Arsip_Sesi_Ditutup_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`;
        
        const headers = [
          'No', 'Kode Sesi', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 
          'Jenis Kelamin', 'Paket Asesmen', 'Skor Total (Maks 50)', 
          'Kategori Efikasi', 'Waktu Pengisian'
        ];

        const rows = submissions.map((sub, idx) => [
          idx + 1,
          res.sessionCode,
          sub.siswa_nisn,
          sub.nama || '-',
          sub.kelas || '-',
          sub.jurusan || '-',
          sub.gender || '-',
          res.packageTitle,
          sub.total_score,
          sub.level,
          sub.completed_at
        ]);

        // Auto-download Excel summary for the closed session
        exportToExcelCSV(filename, headers, rows);

        setIsCloseModalOpen(false);
        if (showToast) {
          showToast(
            isDeletePackageChecked
              ? `Sesi "${packageToClose.title}" diarsipkan ke Excel dan paket berhasil dihapus permanen dari Bank Soal.`
              : `Sesi "${packageToClose.title}" resmi ditutup! Ringkasan Excel otomatis diunduh dan diarsipkan ke sistem.`, 
            'success'
          );
        }

        // Refresh data from server to reflect reset submissions, deleted package, and new archive
        await loadData(false);
        if (onPackagesChange) onPackagesChange();
      } else {
        if (showToast) showToast(res.message || 'Gagal menutup sesi asesmen.', 'error');
      }
    } catch (err) {
      console.error('Error closing session:', err);
      if (showToast) showToast('Gagal menghubungi server.', 'error');
    } finally {
      setIsClosingSession(false);
    }
  };

  // Re-download past closed session snapshot as Excel
  const handleDownloadPastSessionExcel = async (sessionCode, sessionTitle) => {
    try {
      const res = await api.fetchClosedSession(sessionCode);
      if (res && res.success && res.session) {
        const data = res.session.data || {};
        const submissions = data.submissions || [];
        const safeTitle = (sessionTitle || 'Asesmen').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `Arsip_${sessionCode}_${safeTitle}.csv`;

        const headers = [
          'No', 'Kode Sesi', 'NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 
          'Jenis Kelamin', 'Paket Asesmen', 'Skor Total (Maks 50)', 
          'Kategori Efikasi', 'Waktu Pengisian'
        ];

        const rows = submissions.map((sub, idx) => [
          idx + 1,
          sessionCode,
          sub.siswa_nisn,
          sub.nama || '-',
          sub.kelas || '-',
          sub.jurusan || '-',
          sub.gender || '-',
          data.packageTitle || sessionTitle,
          sub.total_score,
          sub.level,
          sub.completed_at
        ]);

        exportToExcelCSV(filename, headers, rows);
        if (showToast) showToast(`File Excel arsip "${sessionCode}" berhasil diunduh.`, 'success');
      } else {
        if (showToast) showToast('Gagal memuat arsip sesi dari database.', 'error');
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Terjadi kesalahan saat mengunduh arsip.', 'error');
    }
  };

  // Dynamic KPI calculation reflecting package filter
  const currentKPI = useMemo(() => {
    if (selectedPackageFilter === 'ALL') {
      const assessedCount = summaryStats?.assessedCount || assessments.length;
      const avg = summaryStats?.averageScore || 0;
      return {
        assessedCount,
        percentage: ((assessedCount / 500) * 100).toFixed(1),
        averageScore: avg,
        label: 'Semua Sesi Aktif'
      };
    } else {
      const pkgObj = packagesList.find(p => p.packageId === selectedPackageFilter);
      const subsForPkg = mergedStudents.filter(s => s.hasCompleted);
      const assessedCount = subsForPkg.length;
      const sumScore = subsForPkg.reduce((acc, s) => acc + (s.totalScore || 0), 0);
      const avg = assessedCount > 0 ? (sumScore / assessedCount).toFixed(1) : 0;
      return {
        assessedCount,
        percentage: ((assessedCount / 500) * 100).toFixed(1),
        averageScore: avg,
        label: pkgObj?.title || 'Paket Terpilih'
      };
    }
  }, [selectedPackageFilter, summaryStats, assessments, mergedStudents, packagesList]);

  return (
    <div className="guru-dashboard-wrap view-section animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="guru-banner-card">
        <div className="guru-banner-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success" style={{ fontSize: '11px', padding: '3px 8px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginRight: '4px' }}></span>
                MySQL Aktif
              </span>
              {selectedPackageFilter !== 'ALL' && (
                <span className="badge badge-outline" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>
                  Filter: {packagesList.find(p => p.packageId === selectedPackageFilter)?.title || selectedPackageFilter}
                </span>
              )}
            </div>
            <h1 className="guru-title">
              Monitoring Kesiapan Karier
            </h1>
            <p className="guru-subtitle">
              SMKN 1 Mejayan · Pembimbing: {user.nama || 'Drs. M. Rofik, M.Pd'}
            </p>
          </div>

          <div className="guru-banner-actions">
            <button 
              className="btn btn-outline" 
              onClick={() => loadData(false)}
              title="Perbarui Data dari Database"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span>Sinkron</span>
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleExportFilteredTable}
              title="Unduh data siswa tabel ini dalam format Excel (.csv)"
            >
              <FileSpreadsheet size={15} />
              <span>Ekspor Excel</span>
            </button>
            <button 
              className="btn btn-outline" 
              onClick={handleResetAllSubmissions}
              style={{ color: 'var(--danger, #dc2626)', borderColor: 'rgba(220, 38, 38, 0.25)' }}
              title="Bersihkan seluruh data jawaban siswa (Kembali ke 0 Peserta, paket soal tetap tersimpan)"
            >
              <Trash2 size={15} />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards (4 cols on desktop, 2x2 on mobile) */}
        <div className="guru-kpi-grid">
          <div className="guru-kpi-card">
            <div className="guru-kpi-header">
              <span>Total Siswa</span>
              <Users size={15} color="var(--primary)" />
            </div>
            <div className="guru-kpi-value tabular-nums">
              500 <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-faint)' }}>Siswa</span>
            </div>
            <div className="guru-kpi-sub">
              14 Rombel Kelas 11
            </div>
          </div>

          <div className="guru-kpi-card">
            <div className="guru-kpi-header">
              <span>Sudah Asesmen</span>
              <CheckCircle2 size={15} color="var(--accent)" />
            </div>
            <div className="guru-kpi-value tabular-nums" style={{ color: 'var(--accent)' }}>
              {currentKPI.assessedCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-faint)' }}>
                ({currentKPI.percentage}%)
              </span>
            </div>
            <div className="guru-kpi-sub">
              {500 - currentKPI.assessedCount} siswa belum
            </div>
          </div>

          <div className="guru-kpi-card">
            <div className="guru-kpi-header">
              <span>Rerata Skor</span>
              <BarChart3 size={15} color="var(--primary)" />
            </div>
            <div className="guru-kpi-value tabular-nums">
              {currentKPI.averageScore} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-faint)' }}>/ 50</span>
            </div>
            <div className="guru-kpi-sub" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              {currentKPI.averageScore >= 38 ? 'Tinggi' : currentKPI.averageScore >= 25 ? 'Sedang' : 'Perlu Penguatan'}
            </div>
          </div>

          <div className="guru-kpi-card">
            <div className="guru-kpi-header">
              <span>Status Sesi</span>
              <Sliders size={15} color={activePackage?.status === 'active' ? 'var(--accent)' : 'var(--danger)'} />
            </div>
            <div className="guru-kpi-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                background: activePackage?.status === 'active' ? 'var(--accent)' : 'var(--danger)' 
              }}></span>
              <span style={{ fontSize: '17px' }}>
                {activePackage?.status === 'active' ? 'Buka' : 'Tutup'}
              </span>
            </div>
            <div className="guru-kpi-sub">
              {activePackage?.questions?.length || 0} Butir Soal
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Segmented Tabs for Guru */}
      <div className="guru-nav-tabs">
        <button 
          className={`guru-nav-tab-btn ${activeTab === 'siswa' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('siswa');
            if (onNavigate) onNavigate('dashboard');
          }}
        >
          <Users size={15} />
          <span>Siswa ({filteredStudents.length})</span>
        </button>

        <button 
          className={`guru-nav-tab-btn ${activeTab === 'asesmen' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('asesmen');
            if (onNavigate) onNavigate('studio');
          }}
        >
          <ClipboardList size={15} />
          <span>Bank Soal ({packagesList.length})</span>
        </button>

        <button 
          className={`guru-nav-tab-btn ${activeTab === 'konseling' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('konseling');
            if (onNavigate) onNavigate('guru_counseling');
          }}
        >
          <MessageSquare size={15} />
          <span>Konseling ({counselingThreads.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REKAP SISWA & NILAI ASESMEN                                       */}
      {/* ========================================================================= */}
      {activeTab === 'siswa' && (
        <div className="card shadow-sm animate-fade-in" style={{ padding: '16px' }}>
          
          {/* Responsive Filters Section */}
          <div className="guru-filter-section">
            <div className="guru-filter-top-row">
              <div className="guru-search-box">
                <Search size={16} className="guru-search-icon" />
                <input 
                  type="text" 
                  className="input-field guru-search-input" 
                  placeholder="Cari nama siswa atau NISN..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {(searchQuery || selectedClass !== 'ALL' || selectedPackageFilter !== 'ALL' || statusFilter !== 'ALL' || levelFilter !== 'ALL') && (
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClass('ALL');
                    setSelectedPackageFilter('ALL');
                    setStatusFilter('ALL');
                    setLevelFilter('ALL');
                  }}
                  style={{ alignSelf: 'center', height: '42px', whiteSpace: 'nowrap' }}
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="guru-filter-chips-grid">
              {/* Filter Paket Asesmen Tertentu */}
              <select 
                className="input-field" 
                value={selectedPackageFilter} 
                onChange={e => setSelectedPackageFilter(e.target.value)}
                style={{ 
                  fontWeight: selectedPackageFilter !== 'ALL' ? 700 : 500,
                  borderColor: selectedPackageFilter !== 'ALL' ? 'var(--primary)' : undefined,
                  background: selectedPackageFilter !== 'ALL' ? 'var(--primary-subtle)' : undefined
                }}
              >
                <option value="ALL">Semua Paket Asesmen ({packagesList.length})</option>
                {packagesList.map(p => (
                  <option key={p.packageId} value={p.packageId}>
                    {p.title} {p.status === 'closed' ? '(Ditutup)' : ''}
                  </option>
                ))}
              </select>

              <select 
                className="input-field" 
                value={selectedClass} 
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="ALL">Semua Kelas (14)</option>
                {classesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select 
                className="input-field" 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Semua Status</option>
                <option value="DONE">Sudah Asesmen</option>
                <option value="PENDING">Belum Asesmen</option>
              </select>

              <select 
                className="input-field" 
                value={levelFilter} 
                onChange={e => setLevelFilter(e.target.value)}
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Perlu Penguatan">Perlu Penguatan</option>
              </select>
            </div>
          </div>

          {/* 1. DESKTOP VIEW: FULL TABLE (Visible on >= 768px) */}
          <div className="guru-desktop-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', width: '45px' }}>No</th>
                  <th style={{ padding: '10px 14px' }}>NISN</th>
                  <th style={{ padding: '10px 14px' }}>Nama Lengkap Siswa</th>
                  <th style={{ padding: '10px 14px' }}>Kelas</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Skor</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Kategori Bandura</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Tidak ada data siswa yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.slice(0, 60).map((st, idx) => (
                    <tr 
                      key={`${st.nisn}_${idx}`} 
                      style={{ 
                        borderBottom: '1px solid var(--border)', 
                        background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)' 
                      }}
                    >
                      <td style={{ padding: '10px 14px', color: 'var(--text-faint)' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }}>{st.nisn}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>{st.nama}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge badge-outline">{st.kelas}</span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {st.hasCompleted ? (
                          <span className="badge badge-success">Selesai</span>
                        ) : (
                          <span className="badge badge-outline">Belum</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>
                        {st.totalScore !== null ? st.totalScore : '-'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {st.level === 'Tinggi' && <span className="badge badge-primary">Tinggi</span>}
                        {st.level === 'Sedang' && <span className="badge badge-warning">Sedang</span>}
                        {st.level === 'Perlu Penguatan' && <span className="badge badge-danger">Perlu Penguatan</span>}
                        {!st.hasCompleted && <span style={{ color: 'var(--text-faint)' }}>-</span>}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenStudentDetail(st)}
                            title="Lihat Detail & Catatan Pembimbing"
                          >
                            Detail
                          </button>
                          {st.hasCompleted && (
                            <>
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => handleResetStudentSubmission(st.nisn, st.nama)}
                                disabled={isResettingStudent}
                                style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                                title="Hapus / Reset Jawaban Siswa ini (Real-time)"
                              >
                                <Trash2 size={14} />
                              </button>
                              <button 
                                className="btn btn-outline btn-sm"
                                onClick={() => onPrintReport && onPrintReport(st)}
                                style={{ color: 'var(--primary)' }}
                                title="Cetak Rapor Hasil Asesmen"
                              >
                                <Printer size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 2. MOBILE VIEW: STUDENT CARDS (Visible on < 768px) */}
          <div className="guru-mobile-cards-container">
            {filteredStudents.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                Tidak ada data siswa yang cocok dengan filter pencarian.
              </div>
            ) : (
              filteredStudents.slice(0, 60).map((st, idx) => (
                <div 
                  key={`${st.nisn}_${idx}`} 
                  className="student-mobile-card clickable-mobile-card"
                  onClick={() => handleOpenStudentDetail(st)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenStudentDetail(st); }}
                >
                  <div className="smc-top-row">
                    <div className="smc-student-name">{st.nama}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {st.hasCompleted ? (
                        <span className="badge badge-success">Selesai</span>
                      ) : (
                        <span className="badge badge-outline">Belum</span>
                      )}
                      <ChevronRight size={18} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                    </div>
                  </div>

                  <div className="smc-meta-row">
                    <span className="smc-nisn">{st.nisn}</span>
                    <span className="badge badge-outline">{st.kelas}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{st.jurusan}</span>
                  </div>

                  {st.hasCompleted && (
                    <div className="smc-score-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="smc-score-label">Skor Efikasi:</span>
                        <span className="smc-score-num">{st.totalScore} / 50</span>
                      </div>
                      <div>
                        {st.level === 'Tinggi' && <span className="badge badge-primary">Tinggi</span>}
                        {st.level === 'Sedang' && <span className="badge badge-warning">Sedang</span>}
                        {st.level === 'Perlu Penguatan' && <span className="badge badge-danger">Perlu Penguatan</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {filteredStudents.length > 60 && (
            <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-faint)', fontSize: '0.82rem' }}>
              Menampilkan 60 siswa pertama dari total {filteredStudents.length} siswa hasil filter. Gunakan pencarian untuk hasil spesifik.
            </div>
          )}
        </div>
      )}
      {/* ========================================================================= */}
      {/* TAB 2: STUDIO SOAL & BANK SOAL MYSQL (MULTI-PAKET)                       */}
      {/* ========================================================================= */}
      {activeTab === 'asesmen' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header & Multi-Package Selector Bar */}
          <div className="card shadow-sm" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={20} color="var(--primary-color)" />
                  Daftar Paket Asesmen Karier ({packagesList.length} Paket)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Setiap paket memiliki butir soal sendiri dan tidak akan saling bercampur.
                </p>
              </div>

              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', padding: '0.5rem 0.9rem' }}
              >
                <Plus size={16} />
                <span>Buat Asesmen Baru</span>
              </button>
            </div>
            {/* Horizontal Cards of Packages */}
            {packagesList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                <ClipboardList size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4, color: 'var(--text-muted)' }} />
                <h4 style={{ margin: '0 0 0.35rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Belum Ada Paket Asesmen</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Bank soal saat ini bersih (kosong). Klik tombol <strong>+ Buat Asesmen Baru</strong> di atas untuk membuat instrumen asesmen pertama Anda.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                {packagesList.map(pkg => {
                  const isSelected = pkg.packageId === activePackage?.packageId;
                  const count = pkg.questionsCount ?? pkg.questions?.length ?? 0;
                  return (
                    <div 
                      key={pkg.packageId} 
                      onClick={() => handleSelectPackage(pkg.packageId)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(30, 58, 138, 0.05)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className={`badge ${pkg.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {pkg.status === 'active' ? 'Sesi Dibuka' : 'Ditutup'}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-color)' }}>
                            ● Sedang Dikelola
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)', marginBottom: '4px', lineHeight: 1.3 }}>
                        {pkg.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span><strong>{count}</strong> Butir Soal</span>
                        <button
                          type="button"
                          className="btn btn-subtle btn-sm"
                          style={{ color: '#ef4444', padding: '2px 6px', fontSize: '11px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePackage(pkg.packageId, pkg.title);
                          }}
                          title="Hapus paket asesmen ini"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Package Editor Grid */}
          {activePackage && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              
              {/* Left Column: Manage Package Settings & Add Question */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Status & Deadline Card */}
                <div className="card shadow-sm" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sliders size={20} color="var(--primary-color)" />
                    Pengaturan: {activePackage.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Judul Paket Asesmen
                      </label>
                      <input 
                        type="text" 
                        className="input-field" 
                        readOnly 
                        value={activePackage.title} 
                        style={{ width: '100%', background: 'var(--bg-main)' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Batas Waktu Pengisian (Deadline)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="datetime-local" 
                          className="input-field" 
                          value={deadlineInput}
                          onChange={e => setDeadlineInput(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button 
                          className="btn btn-outline" 
                          onClick={handleSaveDeadline}
                          disabled={isUpdatingDeadline}
                        >
                          {isUpdatingDeadline ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      marginTop: '0.5rem'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Status Keterbukaan Sesi</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {activePackage.status === 'active' 
                            ? 'Siswa dapat membuka dan mengisi butir soal paket ini' 
                            : 'Sesi ditutup, siswa tidak dapat mengirim jawaban'}
                        </div>
                      </div>
                      {activePackage.status === 'active' ? (
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleOpenCloseModal(activePackage)}
                          style={{ 
                            color: '#dc2626',
                            borderColor: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Tutup sesi asesmen ini, arsipkan rekapan Excel, dan reset pengerjaan siswa"
                        >
                          <FileSpreadsheet size={15} />
                          <span>Tutup Sesi & Arsipkan Excel</span>
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary"
                          onClick={handleTogglePackageStatus}
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Buka kembali sesi asesmen ini agar siswa dapat mengisi butir soal"
                        >
                          <CheckCircle2 size={15} />
                          <span>Buka Kembali Sesi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add New Question Card (Strictly to this package) */}
                <div className="card shadow-sm" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={20} color="var(--primary-color)" />
                    Tambah Butir Soal ke "{activePackage.title}"
                  </h3>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Soal ini hanya akan masuk ke paket ini saja dan tidak akan bercampur ke asesmen lain.
                  </p>

                  <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Teks Pertanyaan / Pernyataan Efikasi Diri
                      </label>
                      <textarea 
                        className="input-field" 
                        rows={3} 
                        placeholder="Contoh: Saya yakin mampu beradaptasi cepat dengan standar keselamatan kerja (K3) di bengkel industri."
                        value={newQuestionText}
                        onChange={e => setNewQuestionText(e.target.value)}
                        required
                        style={{ width: '100%', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Dimensi Efikasi Diri (Albert Bandura)
                      </label>
                      <select 
                        className="input-field" 
                        value={newQuestionDim}
                        onChange={e => setNewQuestionDim(Number(e.target.value))}
                        style={{ width: '100%' }}
                      >
                        {DIMENSIONS.map(d => (
                          <option key={d.id} value={d.id}>
                            Dimensi {d.id}: {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isAddingQuestion || !newQuestionText.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <Plus size={16} />
                        <span>{isAddingQuestion ? 'Menyimpan...' : 'Tambahkan Butir Soal'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Quick Action: Restore default questions */}
                <div className="card shadow-sm" style={{ padding: '1.25rem', background: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        Instrumen Baku Bandura (10 Butir Asli)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Isi paket ini dengan 10 butir baku terstandar Bandura.
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline" 
                      onClick={handleRestoreDefaultQuestions}
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                    >
                      Pulihkan Standar
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Questions List of this package */}
              <div className="card shadow-sm" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      Daftar Butir Soal di "{activePackage.title}"
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Tersimpan mandiri di MySQL. Hanya tampil saat siswa membuka paket ini.
                    </p>
                  </div>
                  <span className="badge badge-primary">
                    {activePackage.questions?.length || 0} Butir Soal
                  </span>
                </div>

                {(!activePackage.questions || activePackage.questions.length === 0) ? (
                  <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600 }}>Belum Ada Butir Soal di Paket Ini</div>
                    <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>
                      Tambahkan butir soal di samping atau klik Pulihkan Standar untuk memuat 10 butir baku.
                    </p>
                    <button className="btn btn-primary" onClick={handleRestoreDefaultQuestions}>
                      Muat 10 Butir Baku Bandura
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto', maxHeight: '680px', paddingRight: '0.25rem' }}>
                    {activePackage.questions.map((q, idx) => {
                      const dim = DIMENSIONS.find(d => d.id === q.dimId) || { label: 'Umum', short: 'Umum' };
                      return (
                        <div 
                          key={q.id || idx} 
                          style={{ 
                            padding: '1rem', 
                            borderRadius: 'var(--radius-md)', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-main)',
                            display: 'flex', 
                            gap: '1rem', 
                            alignItems: 'flex-start',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            background: 'rgba(30, 58, 138, 0.1)', 
                            color: 'var(--primary-color)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 700, 
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}>
                            {idx + 1}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: 1.5, fontWeight: 500 }}>
                              {q.text}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                              <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>
                                Dimensi {q.dimId}: {dim.short}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ID: {q.id}
                              </span>
                            </div>
                          </div>

                          <button 
                            className="btn btn-outline" 
                            onClick={() => handleDeleteQuestion(q.id, idx)}
                            style={{ 
                              color: '#ef4444', 
                              borderColor: 'rgba(239,68,68,0.3)', 
                              padding: '0.45rem', 
                              flexShrink: 0 
                            }}
                            title={`Hapus butir soal #${idx + 1}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Riwayat Sesi Ditutup & Arsip Rekapan Excel */}
          <div className="card shadow-sm" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Archive size={20} color="var(--primary)" />
                  Riwayat Sesi Ditutup & Arsip Rekapan Excel ({closedSessions.length} Sesi)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Setiap kali sesi asesmen ditutup, ringkasan pengerjaan siswa diarsipkan di database dan dapat diunduh ulang format Excel (.csv) kapan saja.
                </p>
              </div>
            </div>

            {closedSessions.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)' }}>
                <FileSpreadsheet size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <div style={{ fontWeight: 600 }}>Belum Ada Riwayat Sesi yang Ditutup</div>
                <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                  Ketika Anda menutup suatu paket sesi asesmen, ringkasan hasil dan nilai seluruh siswa akan otomatis diarsipkan di sini.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      <th style={{ padding: '10px 14px' }}>Kode Sesi</th>
                      <th style={{ padding: '10px 14px' }}>Nama Paket Asesmen</th>
                      <th style={{ padding: '10px 14px' }}>Waktu Ditutup</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Total Peserta</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Rerata Skor</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Unduh Arsip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedSessions.map((sess, idx) => (
                      <tr 
                        key={sess.id || idx}
                        style={{ 
                          borderBottom: '1px solid var(--border)', 
                          background: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)' 
                        }}
                      >
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                          {sess.session_code}
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {sess.package_title}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-faint)', fontSize: '0.82rem' }}>
                          {sess.closed_at}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span className="badge badge-success">{sess.total_peserta} Siswa</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>
                          {sess.rerata_skor} / 50
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleDownloadPastSessionExcel(sess.session_code, sess.package_title)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '0.82rem' }}
                            title="Unduh Rekapan Excel (.csv) Sesi Ini"
                          >
                            <FileSpreadsheet size={14} />
                            <span>Unduh Excel</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal Buat Asesmen Baru */}
          {isCreateModalOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <div className="card shadow-lg animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Buat Paket Asesmen Baru
                  </h3>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ padding: '4px 8px' }} 
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Nama / Judul Asesmen:
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Contoh: Asesmen 2 - Kesiapan Praktik Kerja Lapangan (PKL)"
                      value={createTitle}
                      onChange={e => setCreateTitle(e.target.value)}
                      required
                      autoFocus
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      Batas Waktu Pengisian (Deadline - Opsional):
                    </label>
                    <input 
                      type="datetime-local" 
                      className="input-field" 
                      value={createDeadline}
                      onChange={e => setCreateDeadline(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Paket baru ini akan dibuat dengan daftar soal kosong (0 butir). Anda bisa memasukkan butir soal khusus untuk paket ini tanpa mempengaruhi asesmen lainnya.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isCreating || !createTitle.trim()}
                    >
                      {isCreating ? 'Membuat...' : 'Buat & Kelola Soal'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Konfirmasi Tutup Sesi & Unduh Excel */}
          {isCloseModalOpen && packageToClose && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}>
              <div className="card shadow-lg animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '1.5rem', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                      <AlertCircle size={18} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Tutup Sesi & Arsipkan Hasil
                    </h3>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ padding: '4px 8px' }} 
                    onClick={() => setIsCloseModalOpen(false)}
                    disabled={isClosingSession}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'var(--surface-raised)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Paket yang Akan Ditutup:</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginTop: '2px' }}>
                      {packageToClose.title}
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Menutup sesi ini akan menghentikan pengisian asesmen oleh siswa. Sistem akan <strong>secara otomatis membuat dan mengunduh rekapan Excel (.csv)</strong> berisi ringkasan nilai dan jawaban seluruh siswa yang telah mengerjakan.
                  </p>

                  {/* Reset Submissions Checkbox */}
                  <div 
                    onClick={() => setIsResetAnswersChecked(!isResetAnswersChecked)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.75rem', 
                      padding: '0.85rem 1rem', 
                      background: isResetAnswersChecked ? 'var(--primary-subtle)' : 'var(--surface-raised)', 
                      border: `1.5px solid ${isResetAnswersChecked ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px', color: isResetAnswersChecked ? 'var(--primary)' : 'var(--text-faint)' }}>
                      {isResetAnswersChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        Reset status pengerjaan siswa untuk paket ini
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                        Siswa yang telah menyelesaikan asesmen ini akan di-reset statusnya, sehingga mereka dapat mengerjakan ulang jika di masa mendatang sesi ini dibuka kembali. Seluruh hasil sesi saat ini tetap aman tersimpan di riwayat arsip database dan Excel.
                      </div>
                    </div>
                  </div>

                  {/* Delete Package Permanently Checkbox */}
                  <div 
                    onClick={() => setIsDeletePackageChecked(!isDeletePackageChecked)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.75rem', 
                      padding: '0.85rem 1rem', 
                      background: isDeletePackageChecked ? 'var(--danger-subtle)' : 'var(--surface-raised)', 
                      border: `1.5px solid ${isDeletePackageChecked ? 'var(--danger)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px', color: isDeletePackageChecked ? 'var(--danger)' : 'var(--text-faint)' }}>
                      {isDeletePackageChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isDeletePackageChecked ? 'var(--danger)' : 'var(--text-main)' }}>
                        Hapus paket asesmen ini secara permanen dari Bank Soal
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.4 }}>
                        Jika dicentang, seluruh butir soal paket ini akan langsung dihapus dari sistem setelah file rekapan Excel berhasil diunduh.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setIsCloseModalOpen(false)}
                      disabled={isClosingSession}
                    >
                      Batal
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={handleConfirmClosePackage}
                      disabled={isClosingSession}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#dc2626', borderColor: '#dc2626' }}
                    >
                      <FileSpreadsheet size={16} />
                      <span>{isClosingSession ? 'Memproses Arsip...' : 'Tutup Sesi & Ekspor Excel'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LAYANAN KONSELING SISWA                                           */}
      {/* ========================================================================= */}
      {activeTab === 'konseling' && (
        <div className="card shadow-sm animate-fade-in" style={{ padding: '1.5rem' }}>
          <div className="guru-counseling-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Left: Threads list */}
            <div className={`counseling-thread-list ${activeChatNisn ? 'hide-on-mobile-active' : ''}`}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-main)' }}>
                Daftar Tiket Konseling Siswa
              </h3>

              {counselingThreads.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <MessageSquare size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <div>Belum ada pesan konseling dari siswa.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '550px', overflowY: 'auto' }}>
                  {counselingThreads.map(t => (
                    <div 
                      key={t.siswa_nisn}
                      onClick={() => handleSelectChatThread(t.siswa_nisn)}
                      style={{ 
                        padding: '0.85rem 1rem', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid',
                        borderColor: activeChatNisn === t.siswa_nisn ? 'var(--primary-color)' : 'var(--border-color)',
                        background: activeChatNisn === t.siswa_nisn ? 'rgba(37,99,235,0.06)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t.nama}</div>
                        <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>{t.kelas}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.last_message || 'Memulai konsultasi...'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {t.last_time || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Active Chat Conversation */}
            <div className={`counseling-chat-box ${!activeChatNisn ? 'hide-on-mobile-inactive' : ''}`} style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', minHeight: '450px' }}>
              {activeChatNisn ? (
                <>
                  <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                    <button 
                      className="btn btn-outline btn-sm show-on-mobile"
                      onClick={() => setActiveChatNisn(null)}
                      style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ChevronLeft size={16} />
                      <span>Kembali ke Daftar Siswa</span>
                    </button>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                      Percakapan dengan NISN: {activeChatNisn}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Layanan Konseling Karier Terpandu
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px' }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                        Belum ada pesan dalam sesi ini.
                      </div>
                    ) : (
                      chatMessages.map((m, idx) => {
                        const isGuru = m.sender_type === 'guru';
                        return (
                          <div 
                            key={m.id || idx} 
                            style={{ 
                              alignSelf: isGuru ? 'flex-end' : 'flex-start',
                              maxWidth: '80%',
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              background: isGuru ? 'var(--primary-color)' : 'var(--card-bg)',
                              color: isGuru ? '#ffffff' : 'var(--text-main)',
                              border: isGuru ? 'none' : '1px solid var(--border-color)',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.2rem', fontWeight: 600 }}>
                              {m.sender_name || (isGuru ? 'Guru BK' : 'Siswa')}
                            </div>
                            <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{m.pesan}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right' }}>
                              {m.created_at ? m.created_at.slice(11, 16) : ''}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendGuruReply} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', background: 'var(--card-bg)' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ketik bimbingan atau saran tindak lanjut..." 
                      value={chatReplyText}
                      onChange={e => setChatReplyText(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSendingChat || !chatReplyText.trim()}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Send size={16} />
                      <span>Kirim</span>
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', padding: '2rem' }}>
                  <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <div style={{ fontWeight: 600 }}>Pilih salah satu siswa dari daftar tiket konseling</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Untuk membaca dan merespon sesi bimbingan karier secara langsung.</div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT DETAIL & COUNSELOR NOTE MODAL                                     */}
      {/* ========================================================================= */}
      {studentDetailOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div className="card shadow-lg animate-fade-in" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Detail Profil & Asesmen Siswa
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  SMKN 1 Mejayan : Kelas 11
                </div>
              </div>
              <button 
                className="btn btn-outline" 
                onClick={() => setStudentDetailOpen(false)}
                style={{ padding: '0.35rem 0.5rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile snapshot */}
            <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Nama Siswa:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{selectedStudent.nama}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>NISN / NIS:</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedStudent.nisn}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Kelas:</span>
                <span style={{ fontWeight: 600 }}>{selectedStudent.kelas}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Jurusan:</span>
                <span>{selectedStudent.jurusan}</span>
              </div>
            </div>

            {/* Assessment Result */}
            {selectedStudent.hasCompleted ? (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Hasil Pengukuran Efikasi Diri:</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                    Skor: {selectedStudent.totalScore} / 50 ({selectedStudent.level})
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Diselesaikan pada: {selectedStudent.completedAt || '-'}
                </div>

                {/* Dimension Breakdown if answers exist */}
                {selectedStudent.assessment?.answers && (
                  <div style={{ background: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      Sebaran Dimensi Bandura:
                    </div>
                    {DIMENSIONS.map(d => {
                      // Count average for this dimension
                      const qKeys = Object.keys(selectedStudent.assessment.answers);
                      return (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Terpenuhi</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                Siswa ini belum mengisi instrumen asesmen karier.
              </div>
            )}

            {/* Counselor Note Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Catatan Bimbingan / Rekomendasi Guru BK:
              </label>
              <textarea 
                className="input-field" 
                rows={4}
                placeholder="Tuliskan catatan konseling, rekomendasi penguatan karier, atau rencana tindak lanjut..."
                value={studentNote}
                onChange={e => setStudentNote(e.target.value)}
                style={{ width: '100%', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveStudentNote}
                  disabled={isSavingNote}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                >
                  {isSavingNote ? 'Menyimpan...' : 'Simpan Catatan ke MySQL'}
                </button>
              </div>
            </div>

            {/* Footer action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setStudentDetailOpen(false)}
              >
                Tutup
              </button>

              {selectedStudent.hasCompleted && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => handleResetStudentSubmission(selectedStudent.nisn, selectedStudent.nama)}
                    disabled={isResettingStudent}
                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    title="Hapus jawaban siswa ini secara realtime agar siswa dapat mengisi ulang"
                  >
                    <Trash2 size={15} />
                    <span>{isResettingStudent ? 'Mereset...' : 'Hapus / Reset Jawaban'}</span>
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setStudentDetailOpen(false);
                      if (onPrintReport) onPrintReport(selectedStudent);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Printer size={16} />
                    <span>Cetak Rapor Siswa</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
