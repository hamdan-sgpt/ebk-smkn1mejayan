import React from 'react';
import { 
  ClipboardList, 
  BookOpen, 
  MessageSquareText, 
  Printer
} from 'lucide-react';

export default function HomeView({ 
  user, 
  assessmentResult, 
  packagesList = [],
  onNavigate,
  onPrintReport,
  showToast 
}) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Siswa';

  return (
    <div className="home-container">
      
      {/* Greeting */}
      <div className="home-greeting">
        <h2 className="greeting-name">Halo, {firstName}! 👋</h2>
        <p className="greeting-meta">
          {user?.studentClass} · {user?.jurusan}
        </p>
      </div>

      {/* Assessment Status Card */}
      <div className="home-card">
        <div className="home-card-top">
          <h3 className="home-card-title">Kesiapan Karier</h3>
          {assessmentResult ? (
            <span className={`pill ${
              assessmentResult.level === 'Tinggi' ? 'pill-green' : 
              assessmentResult.level === 'Sedang' ? 'pill-yellow' : 'pill-red'
            }`}>
              {assessmentResult.level} ({assessmentResult.score}/50)
            </span>
          ) : (
            <span className="pill pill-gray">Belum Isi</span>
          )}
        </div>

        {assessmentResult ? (
          <>
            <p className="home-card-desc">
              Ringkasan 4 dimensi keyakinan vokasi kamu:
            </p>

            <div className="score-grid">
              <div className="score-item">
                <span className="score-label">Potensi Diri</span>
                <span className="score-value">{assessmentResult.dimTugas || '0'}/10</span>
              </div>
              <div className="score-item">
                <span className="score-label">Wawasan Industri</span>
                <span className="score-value">{assessmentResult.dimEksplorasi || '0'}/10</span>
              </div>
              <div className="score-item">
                <span className="score-label">Pilihan Karier</span>
                <span className="score-value">{assessmentResult.dimKeputusan || '0'}/15</span>
              </div>
              <div className="score-item">
                <span className="score-label">Daya Tahan</span>
                <span className="score-value">{assessmentResult.dimKetahanan || '0'}/15</span>
              </div>
            </div>

            <div className="home-card-actions">
              <button 
                type="button" 
                className="btn btn-primary btn-block"
                onClick={onPrintReport}
              >
                <Printer size={16} />
                <span>Cetak Rapor (PDF)</span>
              </button>
              <button 
                type="button" 
                className="btn btn-outline btn-block"
                onClick={() => onNavigate('assessment')}
              >
                <span>Lihat Detail</span>
              </button>
            </div>
          </>
        ) : packagesList.length === 0 ? (
          <div className="home-empty">
            <p>Belum ada paket asesmen yang ditugaskan oleh Guru BK saat ini.</p>
            <button 
              type="button" 
              className="btn btn-outline btn-block"
              onClick={() => onNavigate('assessment')}
            >
              <ClipboardList size={18} />
              <span>Cek Menu Asesmen</span>
            </button>
          </div>
        ) : (
          <div className="home-empty">
            <p>Terdapat {packagesList.length} paket asesmen aktif yang siap dikerjakan.</p>
            <button 
              type="button" 
              className="btn btn-primary btn-block btn-lg"
              onClick={() => onNavigate('assessment')}
            >
              <ClipboardList size={18} />
              <span>Mulai Asesmen</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Access Cards */}
      <div className="home-quick-cards">
        <button 
          type="button" 
          className="quick-card"
          onClick={() => onNavigate('materi')}
        >
          <BookOpen size={24} className="quick-card-icon accent" />
          <div>
            <span className="quick-card-title">Modul BMW</span>
            <span className="quick-card-sub">Bekerja, Melanjutkan, Wirausaha</span>
          </div>
        </button>

        <button 
          type="button" 
          className="quick-card"
          onClick={() => onNavigate('counseling')}
        >
          <MessageSquareText size={24} className="quick-card-icon primary" />
          <div>
            <span className="quick-card-title">Konseling</span>
            <span className="quick-card-sub">Hubungi Guru BK</span>
          </div>
        </button>
      </div>
    </div>
  );
}
