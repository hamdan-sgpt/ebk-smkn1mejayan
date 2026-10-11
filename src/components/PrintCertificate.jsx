import React from 'react';
import { Printer, X, Award, CheckCircle2 } from 'lucide-react';

export default function PrintCertificate({ student, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

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
      <div style={{ width: '100%', maxWidth: '880px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Floating Print Action Toolbar (Hidden during print) */}
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
            <Award size={20} color="var(--primary-color)" />
            <span>Pratinjau Sertifikat Kesiapan Karier</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Printer size={16} />
              <span>Cetak / Simpan PDF</span>
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

        {/* Certificate Container (A4 Landscape aspect ratio) */}
        <div 
          id="certificate-print-area"
          style={{
            background: '#ffffff',
            color: '#1e293b',
            padding: '2.5rem',
            borderRadius: 'var(--radius-md)',
            border: '8px double #1e3a8a',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontFamily: "'Outfit', 'Segoe UI', Tahoma, sans-serif"
          }}
        >
          {/* Decorative Corner Ornaments */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', width: '24px', height: '24px', borderTop: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
          <div style={{ position: 'absolute', top: '12px', right: '12px', width: '24px', height: '24px', borderTop: '3px solid #d97706', borderRight: '3px solid #d97706' }} />
          <div style={{ position: 'absolute', bottom: '12px', left: '12px', width: '24px', height: '24px', borderBottom: '3px solid #d97706', borderLeft: '3px solid #d97706' }} />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px', width: '24px', height: '24px', borderBottom: '3px solid #d97706', borderRight: '3px solid #d97706' }} />

          {/* Official Letterhead */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', borderBottom: '2px solid #1e3a8a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <img 
              src="/assets/logo-smkn1mejayan.png" 
              alt="Logo SMKN 1 Mejayan" 
              style={{ width: '70px', height: '70px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', color: '#64748b' }}>
                PEMERINTAH PROVINSI JAWA TIMUR : DINAS PENDIDIKAN
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.02em', margin: '0.15rem 0' }}>
                SMK NEGERI 1 MEJAYAN
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                Jl. Imam Bonjol No. 39, Kec. Mejayan, Kab. Madiun, Jawa Timur 63153
              </div>
            </div>
          </div>

          {/* Certificate Title */}
          <div style={{ textAlign: 'center', margin: '1.5rem 0 1rem' }}>
            <div style={{ 
              display: 'inline-block',
              padding: '0.25rem 1rem', 
              background: 'rgba(30,58,138,0.08)', 
              color: '#1e3a8a', 
              fontWeight: 700, 
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              borderRadius: '4px',
              marginBottom: '0.5rem'
            }}>
              SERTIFIKAT KESIAPAN KARIER VOKASI
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.25rem 0', letterSpacing: '-0.02em' }}>
              CAREER SELF-EFFICACY
            </h2>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Nomor: 421.5/EBK-SMKN1MJY/{new Date().getFullYear()}
            </div>
          </div>

          {/* Recipient */}
          <div style={{ textAlign: 'center', margin: '1.75rem 0' }}>
            <div style={{ fontSize: '0.92rem', color: '#475569', fontStyle: 'italic' }}>
              Diberikan dengan penuh apresiasi kepada:
            </div>
            <div style={{ 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              color: '#1e3a8a', 
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '0.5rem 0 0.25rem' 
            }}>
              {student.nama}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
              NISN: <span style={{ fontFamily: 'monospace' }}>{student.nisn}</span> | Kelas: {student.kelas}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 600, marginTop: '0.25rem' }}>
              Kompetensi Keahlian: {student.jurusan}
            </div>
          </div>

          {/* Achievement Description */}
          <p style={{ 
            textAlign: 'center', 
            maxWidth: '680px', 
            margin: '0 auto 2rem', 
            fontSize: '0.95rem', 
            lineHeight: 1.6, 
            color: '#334155' 
          }}>
            Telah menyelesaikan seluruh rangkaian pengukuran efikasi diri karier, pendalaman materi literasi industri, dan 5 tantangan aksi nyata kesiapan kerja dengan predikat <strong>Mandiri & Teruji (Career Ready)</strong> melalui platform Layanan e-BK SMKN 1 Mejayan.
          </p>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Mengetahui,</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>
                Kepala SMKN 1 Mejayan
              </div>
              <div style={{ height: '65px' }} />
              <div style={{ fontWeight: 700, textDecoration: 'underline', color: '#0f172a' }}>
                Suharto, M.Pd
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                NIP. 19680512 199412 1 002
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Mejayan, {currentDate}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>
                Guru Pembimbing BK
              </div>
              <div style={{ height: '65px' }} />
              <div style={{ fontWeight: 700, textDecoration: 'underline', color: '#0f172a' }}>
                Drs. M. Rofik, M.Pd
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                NIP. 19670315 199303 1 005
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
