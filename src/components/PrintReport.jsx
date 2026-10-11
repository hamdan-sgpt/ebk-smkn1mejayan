import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

export default function PrintReport({ student, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalScore = student.totalScore !== undefined ? student.totalScore : (student.assessment?.total_score || 0);
  const level = student.level || student.assessment?.level || 'Sedang';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{ width: '100%', maxWidth: '820px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Floating Print Action Toolbar */}
        <div className="no-print" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'var(--card-bg)',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
            <FileText size={20} color="var(--primary-color)" />
            <span>Pratinjau Rapor Hasil Asesmen Karier Siswa</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Printer size={16} />
              <span>Cetak Dokumen</span>
            </button>
            <button 
              className="btn btn-outline"
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <X size={16} />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Printable Document (A4 Portrait layout) */}
        <div 
          id="report-print-area"
          style={{
            background: '#ffffff',
            color: '#1e293b',
            padding: '2.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            fontFamily: "'Outfit', 'Segoe UI', Tahoma, sans-serif"
          }}
        >
          {/* Official Letterhead */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderBottom: '3px double #1e3a8a', paddingBottom: '0.85rem', marginBottom: '1.5rem' }}>
            <img 
              src="/assets/logo-smkn1mejayan.png" 
              alt="Logo SMKN 1 Mejayan" 
              style={{ width: '75px', height: '75px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: '#475569' }}>
                PEMERINTAH PROVINSI JAWA TIMUR : DINAS PENDIDIKAN
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', margin: '0.15rem 0' }}>
                SMK NEGERI 1 MEJAYAN
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Jl. Imam Bonjol No. 39, Kec. Mejayan, Kab. Madiun, Jawa Timur 63153
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669', marginTop: '0.2rem' }}>
                UNIT BIMBINGAN DAN KONSELING KARIER VOKASI
              </div>
            </div>
          </div>

          {/* Report Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
              Laporan Hasil Pengukuran Career Self-Efficacy Siswa
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
              Instrumen Kesiapan Karier Berbasis Teori Efikasi Diri Albert Bandura
            </div>
          </div>

          {/* Student Biodata Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem 1.5rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Nama Siswa:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{student.nama}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Kelas:</span>{' '}
                <strong>{student.kelas}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>NISN / NIS:</span>{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.nisn}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Kompetensi Keahlian:</span>{' '}
                <strong>{student.jurusan}</strong>
              </div>
            </div>
          </div>

          {/* Overall Score Summary */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, padding: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: 600 }}>SKOR TOTAL EFIKASI DIRI</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e3a8a', margin: '0.25rem 0' }}>
                {totalScore} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ 50</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1e40af' }}>Skala Pengukuran Likert 1-5</div>
            </div>

            <div style={{ flex: 1, padding: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: 600 }}>KATEGORI KESIAPAN KARIER</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', margin: '0.25rem 0' }}>
                {level}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#065f46' }}>Tingkat Kemandirian Vokasi</div>
            </div>
          </div>

          {/* 4 Bandura Dimensions Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#1e293b' }}>
              Analisis 4 Sumber Efikasi Diri Karier:
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', width: '30px' }}>No</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Dimensi Efikasi Diri</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Indikator Pengamatan</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', width: '110px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>1</td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Kinerja Masa Lalu</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>Keyakinan atas penguasaan kompetensi kejuruan dan praktik bengkel/lab.</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#059669' }}>Kuat</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>2</td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Pengalaman Vikarius</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>Inspirasi dari kisah sukses alumni dan observasi mentor industri.</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#059669' }}>Kuat</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>3</td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Persuasi Sosial</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>Dukungan orang tua, motivasi guru BK, dan bimbingan wali kelas.</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#059669' }}>Terpenuhi</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.6rem 0.75rem' }}>4</td>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>Pengelolaan Emosi</td>
                  <td style={{ padding: '0.6rem 0.75rem', color: '#475569' }}>Ketahanan mental dalam menghadapi tekanan dan kesiapan seleksi kerja.</td>
                  <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#059669' }}>Mandiri</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Recommendations Block */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem', background: '#f8fafc', marginBottom: '2rem' }}>
            <h5 style={{ margin: '0 0 0.35rem', fontSize: '0.88rem', fontWeight: 700, color: '#1e3a8a' }}>
              Rekomendasi Bimbingan Karier Guru BK:
            </h5>
            <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.5, color: '#334155' }}>
              Siswa memiliki potensi efikasi diri yang sangat baik untuk memasuki dunia kerja / industri (IDUKA) maupun melanjutkan studi. Disarankan untuk terus memperkuat portofolio keahlian, aktif berdiskusi dengan guru kejuruan, dan mengikuti program simulasi wawancara kerja yang difasilitasi sekolah.
            </p>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1.5rem', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Mengetahui,</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>Siswa Bersangkutan</div>
              <div style={{ height: '60px' }} />
              <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{student.nama}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>NISN. {student.nisn}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Mejayan, {currentDate}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>Guru Pembimbing BK</div>
              <div style={{ height: '60px' }} />
              <div style={{ fontWeight: 700, textDecoration: 'underline' }}>Drs. M. Rofik, M.Pd</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>NIP. 19670315 199303 1 005</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
