import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  RotateCcw, 
  RefreshCw, 
  Printer, 
  Send,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { DIMENSIONS } from '../data/assessmentData';

export default function AssessmentView({
  user,
  packagesList = [],
  studentSubmissions = {},
  onSaveAssessment,
  onRefreshPackages,
  onPrintReport,
  showToast
}) {
  // Paket mana yang sedang dibuka oleh siswa (null = di halaman daftar paket)
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [isRetaking, setIsRetaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Muat data paket terbaru dari server saat membuka tab asesmen
  useEffect(() => {
    if (onRefreshPackages) {
      onRefreshPackages();
    }
  }, [onRefreshPackages]);

  // Ambil data paket yang sedang aktif dibuka
  const activePackage = packagesList.find(p => p.packageId === selectedPkgId) || null;
  const activeSubmission = activePackage ? studentSubmissions[activePackage.packageId] : null;

  const questions = activePackage?.questions && activePackage.questions.length > 0 
    ? activePackage.questions 
    : [];

  // State jawaban untuk paket yang sedang dibuka
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(null));

  // Reset / sinkronisasi jawaban saat berpindah paket atau saat data di-reset realtime dari server
  useEffect(() => {
    if (activePackage) {
      if (activeSubmission?.answers && !isRetaking) {
        setAnswers([...activeSubmission.answers]);
      } else {
        setAnswers(new Array(questions.length).fill(null));
      }
    }
  }, [selectedPkgId, isRetaking, questions.length, activeSubmission]);

  const handleSelectOption = (qIdx, scoreVal) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[qIdx] = scoreVal;
      return updated;
    });
  };

  const answeredCount = answers.filter(a => a !== null).length;
  const isComplete = questions.length > 0 && answeredCount === questions.length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isComplete) {
      if (showToast) showToast('Mohon lengkapi seluruh pertanyaan sebelum menyimpan hasil.');
      return;
    }

    setIsSubmitting(true);
    const totalScore = answers.reduce((acc, curr) => acc + (curr || 0), 0);
    const maxScore = questions.length * 5;
    const ratio = maxScore > 0 ? totalScore / maxScore : 0;
    
    // Klasifikasi Tingkat Efikasi Diri Karier proporsional
    let level = 'Sedang';
    if (ratio >= 0.76) {
      level = 'Tinggi';
    } else if (ratio < 0.52) {
      level = 'Perlu Penguatan';
    }

    // Hitung 4 Dimensi SCCT
    const half = Math.max(1, Math.ceil(questions.length / 4));
    let dim1 = 0;
    let dim2 = 0;
    let dim3 = 0;
    let dim4 = 0;

    questions.forEach((q, idx) => {
      const val = answers[idx] || 0;
      if (q.dimId === 1) dim1 += val;
      else if (q.dimId === 2) dim2 += val;
      else if (q.dimId === 3) dim3 += val;
      else if (q.dimId === 4) dim4 += val;
      else {
        // Fallback jika tidak ada dimId
        const bucket = Math.floor(idx / half);
        if (bucket === 0) dim1 += val;
        else if (bucket === 1) dim2 += val;
        else if (bucket === 2) dim3 += val;
        else dim4 += val;
      }
    });

    const jurusan = user?.jurusan || 'Kejuruan';
    let recommendation = '';
    if (level === 'Tinggi') {
      recommendation = `Keyakinan diri karier Anda pada ${activePackage.title} berada pada kategori TINGGI. Anda memiliki kematangan persepsi diri dan pemahaman kuat terhadap bidang ${jurusan}.`;
    } else if (level === 'Sedang') {
      recommendation = `Keyakinan diri karier Anda pada ${activePackage.title} berada pada kategori SEDANG. Anda telah memiliki gambaran kompetensi dasar ${jurusan}, namun disarankan untuk lebih aktif mengasah keterampilan pengambilan keputusan pasca kelulusan.`;
    } else {
      recommendation = `Keyakinan diri karier Anda pada ${activePackage.title} memerlukan PENGUATAN. Manfaatkan sesi bimbingan bersama Guru BK (Drs. M. Rofik, M.Pd) untuk menyusun rencana bertahap yang realistis.`;
    }

    const resultObj = {
      score: totalScore,
      total_score: totalScore,
      max_score: maxScore,
      level,
      dimTugas: dim1,
      dimEksplorasi: dim2,
      dimKeputusan: dim3,
      dimKetahanan: dim4,
      dimensi_tugas: dim1,
      dimensi_eksplorasi: dim2,
      dimensi_keputusan: dim3,
      dimensi_ketahanan: dim4,
      answers,
      recommendation,
      completedAt: new Date().toISOString()
    };

    try {
      await onSaveAssessment(resultObj, activePackage.packageId);
      setIsRetaking(false);
      if (showToast) showToast(`Hasil "${activePackage.title}" berhasil disimpan ke MySQL.`);
    } catch {
      if (showToast) showToast('Hasil tersimpan di penyimpanan lokal.');
      setIsRetaking(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // VIEW 1: DAFTAR SEMUA PAKET ASESMEN (MULTI-PAKET)
  // =========================================================================
  if (!selectedPkgId || !activePackage) {
    return (
      <div className="assessment-view-container animate-fade-in">
        
        {/* Intro Banner */}
        <div className="card assessment-intro-card">
          <div className="assessment-intro-header">
            <div>
              <h2 className="assessment-page-title">
                Paket Asesmen Karier Siswa
              </h2>
              <p className="assessment-page-subtitle">
                SMKN 1 Mejayan · Dibimbing oleh: Drs. M. Rofik, M.Pd
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-subtle btn-sm refresh-btn"
              onClick={onRefreshPackages}
              title="Segarkan daftar paket asesmen"
            >
              <RefreshCw size={14} />
              <span>Segarkan</span>
            </button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Berikut adalah daftar instrumen asesmen karier yang ditugaskan oleh Guru BK. Setiap asesmen memiliki butir pertanyaan mandiri.
          </p>
        </div>

        {/* List of Available Packages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {packagesList.filter(pkg => pkg.status === 'active' || !!studentSubmissions[pkg.packageId]).length === 0 ? (
            <div className="card text-center" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.5, color: 'var(--text-muted)' }} />
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Belum Ada Paket Asesmen yang Dibuka</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Seluruh sesi asesmen saat ini sedang ditutup atau belum ada tugas aktif dari Guru BK.
              </p>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={onRefreshPackages}
                style={{ margin: '16px auto 0', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={15} />
                <span>Cek Ulang Server</span>
              </button>
            </div>
          ) : (
            packagesList
              .filter(pkg => pkg.status === 'active' || !!studentSubmissions[pkg.packageId])
              .map((pkg, idx) => {
              const submission = studentSubmissions[pkg.packageId];
              const isDone = !!submission;
              const isClosed = pkg.status === 'closed';
              const qCount = pkg.questionsCount ?? pkg.questions?.length ?? 0;

              return (
                <div 
                  key={pkg.packageId} 
                  className="card shadow-sm"
                  style={{ 
                    padding: '16px',
                    border: isDone ? '1px solid #10b981' : isClosed ? '1px solid var(--border-color)' : '1px solid #2563eb',
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-outline" style={{ fontSize: '11px', fontWeight: 700 }}>
                        Paket #{idx + 1}
                      </span>
                      {isDone ? (
                        <span className="badge badge-success" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} />
                          Sudah Selesai
                        </span>
                      ) : isClosed ? (
                        <span className="badge badge-danger" style={{ fontSize: '11px' }}>
                          Sesi Ditutup
                        </span>
                      ) : (
                        <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                          Tersedia
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontWeight: 600 }}>
                      {qCount} Butir Soal
                    </span>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                      {pkg.title}
                    </h3>
                    {pkg.instructions && (
                      <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {pkg.instructions}
                      </p>
                    )}
                  </div>

                  {/* Submission info or action buttons */}
                  {isDone && (
                    <div style={{ 
                      background: 'rgba(16, 185, 129, 0.08)', 
                      padding: '10px 12px', 
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11.5px', display: 'block' }}>Hasil Pengukuran:</span>
                        <strong style={{ color: '#059669', fontSize: '14px' }}>
                          Skor {submission.total_score} / {qCount * 5} ({submission.level})
                        </strong>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                        {submission.completed_at ? submission.completed_at.slice(0, 10) : 'Tersimpan'}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {isDone ? (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-primary"
                          style={{ flex: 1, minWidth: '140px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
                          onClick={() => {
                            setSelectedPkgId(pkg.packageId);
                            setIsRetaking(false);
                          }}
                        >
                          <Award size={15} />
                          <span>Lihat Hasil & Rapor</span>
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}
                          onClick={() => {
                            setSelectedPkgId(pkg.packageId);
                            setIsRetaking(true);
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>Isi Ulang</span>
                        </button>
                      </>
                    ) : isClosed ? (
                      <div style={{ width: '100%', padding: '10px', textAlign: 'center', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-faint)' }}>
                        Sesi ditutup sementara oleh Guru BK. Hubungi Drs. M. Rofik, M.Pd jika butuh pembukaan akses.
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', padding: '12px' }}
                        onClick={() => {
                          setSelectedPkgId(pkg.packageId);
                          setIsRetaking(true);
                        }}
                      >
                        <ClipboardList size={16} />
                        <span>Mulai Kerjakan ({qCount} Soal)</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: TAMPILAN LEMBAR HASIL JIKA SISWA SUDAH MENGERJAKAN PAKET INI
  // =========================================================================
  if (activeSubmission && !isRetaking) {
    const score = activeSubmission.total_score || activeSubmission.score || 0;
    const maxScore = questions.length * 5 || 50;
    const level = activeSubmission.level || 'Sedang';
    const dim1 = activeSubmission.dimensi_tugas || activeSubmission.dimTugas || Math.round(score * 0.28);
    const dim2 = activeSubmission.dimensi_eksplorasi || activeSubmission.dimEksplorasi || Math.round(score * 0.28);
    const dim3 = activeSubmission.dimensi_keputusan || activeSubmission.dimKeputusan || Math.round(score * 0.22);
    const dim4 = activeSubmission.dimensi_ketahanan || activeSubmission.dimKetahanan || Math.round(score * 0.22);

    return (
      <div className="assessment-view-container animate-fade-in">
        
        {/* Navigation Back Bar */}
        <div style={{ marginBottom: '12px' }}>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => setSelectedPkgId(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Daftar Asesmen</span>
          </button>
        </div>

        {/* Ringkasan Skor Utama */}
        <div className="card assessment-result-hero">
          <div className="assessment-result-level-tag">
            <span className={`status-pill ${
              level === 'Tinggi' ? 'pill-success' : level === 'Sedang' ? 'pill-warning' : 'pill-danger'
            }`}>
              Hasil: {activePackage.title}
            </span>
          </div>

          <div className="assessment-score-display">
            <span className="assessment-score-number tabular-nums">{score}</span>
            <span className="assessment-score-max">/ {maxScore}</span>
          </div>

          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)', marginTop: '4px' }}>
            Tingkat Efikasi Diri: {level}
          </div>

          <p className="assessment-result-lead">
            {activeSubmission.recommendation || 'Berdasarkan pemetaan kesiapan karier pada asesmen ini, berikut ringkasan keyakinan diri vokasi Anda:'}
          </p>

          <div className="assessment-result-btn-row">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => onPrintReport && onPrintReport(user)}
            >
              <Printer size={16} />
              <span>Cetak Lembar Rapor</span>
            </button>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => setIsRetaking(true)}
            >
              <RotateCcw size={16} />
              <span>Isi Ulang Asesmen Ini</span>
            </button>
          </div>
        </div>

        {/* Pemetaan Dimensi */}
        <div className="card">
          <h3 className="section-title">
            Pemetaan Aspek Kesiapan Karier
          </h3>

          <div className="dimension-bars-list">
            <div className="dimension-bar-item">
              <div className="dim-bar-header">
                <span className="dim-bar-name">1. Potensi Diri & Bakat Teknis</span>
                <span className="dim-bar-value tabular-nums">{dim1} poin</span>
              </div>
              <div className="dim-track">
                <div className="dim-fill fill-primary" style={{ width: `${Math.min(100, (dim1 / (maxScore * 0.25 || 12)) * 100)}%` }} />
              </div>
            </div>

            <div className="dimension-bar-item">
              <div className="dim-bar-header">
                <span className="dim-bar-name">2. Informasi & Peluang Industri</span>
                <span className="dim-bar-value tabular-nums">{dim2} poin</span>
              </div>
              <div className="dim-track">
                <div className="dim-fill fill-accent" style={{ width: `${Math.min(100, (dim2 / (maxScore * 0.25 || 12)) * 100)}%` }} />
              </div>
            </div>

            <div className="dimension-bar-item">
              <div className="dim-bar-header">
                <span className="dim-bar-name">3. Rencana & Pilihan Karier</span>
                <span className="dim-bar-value tabular-nums">{dim3} poin</span>
              </div>
              <div className="dim-track">
                <div className="dim-fill fill-primary" style={{ width: `${Math.min(100, (dim3 / (maxScore * 0.25 || 12)) * 100)}%` }} />
              </div>
            </div>

            <div className="dimension-bar-item">
              <div className="dim-bar-header">
                <span className="dim-bar-name">4. Ketahanan & Adaptasi Industri</span>
                <span className="dim-bar-value tabular-nums">{dim4} poin</span>
              </div>
              <div className="dim-track">
                <div className="dim-fill fill-warning" style={{ width: `${Math.min(100, (dim4 / (maxScore * 0.25 || 12)) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Catatan Pembimbing BK */}
        <div className="card advisor-note-box">
          <strong>Catatan Pembimbing BK (Drs. M. Rofik, M.Pd):</strong> 
          <p style={{ marginTop: '6px', fontSize: '13px', lineHeight: '1.5' }}>
            Hasil asesmen "{activePackage.title}" ini tersimpan mandiri di sistem. Jika membutuhkan bimbingan langsung terkait hasil ini, silakan ajukan jadwal temu pada menu Konsultasi BK.
          </p>
        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 3: FORMULIR PENGERJAAN SOAL ASESMEN (HANYA SOAL MILIK PAKET INI)
  // =========================================================================
  const isSessionClosed = activePackage?.status === 'closed';

  if (isSessionClosed && (!activeSubmission || isRetaking)) {
    return (
      <div className="assessment-view-container animate-fade-in">
        <div style={{ marginBottom: '12px' }}>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => setSelectedPkgId(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Daftar Asesmen</span>
          </button>
        </div>

        <div className="card text-center" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
            Sesi Asesmen Ini Sedang Ditutup
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            Guru BK (Drs. M. Rofik, M.Pd) sedang menutup akses pengisian untuk "{activePackage.title}". Siswa belum dapat mengirim jawaban sampai sesi dibuka kembali oleh Guru.
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="assessment-view-container animate-fade-in">
        <div style={{ marginBottom: '12px' }}>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={() => setSelectedPkgId(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={15} />
            <span>Kembali ke Daftar Asesmen</span>
          </button>
        </div>

        <div className="card text-center" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ margin: '0 auto 12px', opacity: 0.5, color: 'var(--text-muted)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-main)' }}>
            Belum Ada Butir Soal di Paket Ini
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            Guru BK belum memasukkan butir pertanyaan untuk "{activePackage.title}". Silakan hubungi Guru BK atau pilih asesmen lain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-view-container animate-fade-in">
      
      {/* Back Button & Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <button 
          type="button" 
          className="btn btn-subtle btn-sm"
          onClick={() => setSelectedPkgId(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Daftar</span>
        </button>

        <span className="badge badge-outline desktop-only" style={{ fontSize: '11px', fontWeight: 600 }}>
          {activePackage.title}
        </span>
      </div>

      {/* Sticky Compact Progress Bar at Top */}
      <div className="assessment-sticky-progress">
        <div className="assessment-progress-info">
          <span className="assessment-progress-title">Progres Asesmen</span>
          <span className="assessment-progress-stat tabular-nums">
            {answeredCount} / {questions.length} Soal ({progressPercent}%)
          </span>
        </div>
        <div className="assessment-progress-track">
          <div 
            className="assessment-progress-fill" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Intro Header */}
      <div className="card assessment-intro-card">
        <div className="assessment-intro-header">
          <div>
            <h2 className="assessment-page-title">
              {activePackage.title}
            </h2>
            <p className="assessment-page-subtitle">
              {activePackage.instructions || 'Pilih skala 1 (Sangat Ragu) sampai 5 (Sangat Yakin) untuk tiap pertanyaan di bawah. Jawab santai dan jujur sesuai keadaanmu saat ini.'}
            </p>
          </div>
        </div>

        {/* Concise Scale Guide */}
        <div className="assessment-scale-guide">
          <div className="scale-guide-item">
            <span className="scale-num">1</span>
            <span className="scale-text">Sangat Ragu</span>
          </div>
          <div className="scale-guide-item">
            <span className="scale-num">2</span>
            <span className="scale-text">Ragu</span>
          </div>
          <div className="scale-guide-item">
            <span className="scale-num">3</span>
            <span className="scale-text">Cukup</span>
          </div>
          <div className="scale-guide-item">
            <span className="scale-num">4</span>
            <span className="scale-text">Yakin</span>
          </div>
          <div className="scale-guide-item">
            <span className="scale-num">5</span>
            <span className="scale-text">Sangat Yakin</span>
          </div>
        </div>
      </div>

      {/* Questionnaire Form */}
      <form onSubmit={handleSubmit}>
        <div className="assessment-questions-stack">
          {questions.map((q, idx) => {
            const currentVal = answers[idx];
            const isAnswered = currentVal !== null;

            return (
              <div 
                key={q.id || idx} 
                className={`card assessment-q-card ${isAnswered ? 'q-answered' : ''}`}
              >
                <div className="q-card-header">
                  <span className="q-number-pill tabular-nums">
                    Soal {idx + 1}
                  </span>
                  {isAnswered ? (
                    <span className="q-status-badge badge-success">
                      <CheckCircle2 size={12} />
                      <span>Terisi</span>
                    </span>
                  ) : (
                    <span className="q-status-badge badge-muted">
                      Belum diisi
                    </span>
                  )}
                </div>

                <p className="q-text-statement">
                  {q.text}
                </p>

                {/* 1-5 Scale Option Buttons */}
                <div className="scale-selector-container">
                  <div className="scale-buttons-row" role="radiogroup">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentVal === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`scale-option-pill ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(idx, val)}
                          aria-pressed={isSelected}
                        >
                          <span className="scale-pill-num tabular-nums">{val}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="scale-anchors">
                    <span>1: Sangat Ragu</span>
                    <span>5: Sangat Yakin</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Card at Bottom */}
        <div className="card assessment-submit-card">
          <div className="submit-card-summary">
            <div className="submit-summary-status">
              {isComplete ? (
                <div className="status-complete">
                  <CheckCircle2 size={18} color="var(--accent)" />
                  <span>Semua {questions.length} butir pertanyaan telah lengkap terisi!</span>
                </div>
              ) : (
                <div className="status-incomplete">
                  <AlertCircle size={18} color="var(--danger)" />
                  <span>Masih ada {questions.length - answeredCount} pertanyaan yang belum dipilih nilainya.</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setSelectedPkgId(null)}
              style={{ flex: 1 }}
            >
              Kembali ke Daftar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isComplete || isSubmitting}
              style={{ flex: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Menyimpan ke MySQL...' : `Kirim Jawaban (${answeredCount}/${questions.length})`}</span>
            </button>
          </div>
        </div>
      </form>

    </div>
  );
}
