import React, { useState } from 'react';
import { Award, CheckCircle2, Circle, Printer, ArrowRight, Sparkles } from 'lucide-react';
import { DEFAULT_CHALLENGES } from '../data/challenges';

export default function ChallengeView({
  user,
  challenges = DEFAULT_CHALLENGES,
  onUpdateChallenges,
  onPrintCertificate,
  showToast
}) {
  const [activeChallengeId, setActiveChallengeId] = useState(null);
  const [responseText, setResponseText] = useState('');

  const completedCount = challenges.filter(c => c.completed).length;
  const isAllCompleted = completedCount === challenges.length;

  const handleOpenChallenge = (challenge) => {
    setActiveChallengeId(challenge.id);
    setResponseText(challenge.response || '');
  };

  const handleSaveResponse = (e) => {
    e.preventDefault();
    if (!responseText.trim()) {
      showToast('Tuliskan respon refleksi Anda terlebih dahulu.');
      return;
    }

    const updated = challenges.map(c => {
      if (c.id === activeChallengeId) {
        return { ...c, response: responseText.trim(), completed: true };
      }
      return c;
    });

    onUpdateChallenges(updated);
    setActiveChallengeId(null);
    showToast('Tantangan berhasil diselesaikan!');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      
      {/* Header Banner */}
      <div className="card elevated" style={{ background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="badge primary">Career Mastery Challenge</span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: isAllCompleted ? 'var(--accent)' : 'var(--primary)' }}>
            {completedCount} dari {challenges.length} Tuntas
          </span>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
          5 Tantangan Aksi Karier Mandiri
        </h2>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '12px' }}>
          Tuntaskan 5 langkah aksi nyata berikut untuk memperkuat keyakinan diri dan membuka sertifikat resmi kesiapan karier SMKN 1 Mejayan.
        </p>

        {/* Progress Bar */}
        <div style={{ height: '6px', background: 'var(--surface-raised)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${(completedCount / challenges.length) * 100}%`, 
              background: isAllCompleted ? 'var(--accent)' : 'var(--primary)',
              transition: 'width var(--transition-normal)'
            }} 
          />
        </div>

        {/* Certificate Unlock Banner */}
        {isAllCompleted ? (
          <div style={{ 
            background: 'var(--accent-subtle)', 
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-xs)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent)' }}>
                🎉 Seluruh Tantangan Berhasil Dituntaskan!
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Sertifikat Kesiapan Karier Vokasi resmi Anda siap dicetak.
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-accent btn-sm"
              onClick={onPrintCertificate}
            >
              <Printer size={16} />
              <span>Cetak Sertifikat (PDF)</span>
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '11.5px', color: 'var(--text-faint)' }}>
            Selesaikan sisa <b>{challenges.length - completedCount} tantangan</b> untuk mengunduh sertifikat penghargaan resmi.
          </div>
        )}
      </div>

      {/* Challenges List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {challenges.map((c, idx) => {
          const isSelected = activeChallengeId === c.id;

          return (
            <div 
              key={c.id}
              className="card"
              style={{
                borderLeft: c.completed ? '4px solid var(--accent)' : '4px solid var(--border)',
                margin: 0
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {c.completed ? (
                    <CheckCircle2 size={18} color="var(--accent)" />
                  ) : (
                    <Circle size={18} color="var(--text-faint)" />
                  )}
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                    Tantangan {idx + 1}: {c.title}
                  </span>
                </div>

                <span className={`badge ${c.completed ? 'success' : ''}`} style={{ fontSize: '10px' }}>
                  {c.completed ? 'Selesai' : 'Belum'}
                </span>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '10px' }}>
                {c.desc}
              </p>

              {c.completed && !isSelected && (
                <div style={{ 
                  background: 'var(--surface-raised)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-xs)', 
                  padding: '8px 10px',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  marginBottom: '10px'
                }}>
                  <b>Refleksi Anda:</b> "{c.response}"
                </div>
              )}

              {/* Form Input if active */}
              {isSelected ? (
                <form onSubmit={handleSaveResponse} style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor={`resp_${c.id}`}>Jawaban / Rencana Aksi Anda</label>
                    <textarea
                      id={`resp_${c.id}`}
                      className="form-textarea"
                      rows={3}
                      placeholder="Tuliskan refleksi mandiri Anda di sini..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      Simpan Jawaban
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm" 
                      onClick={() => setActiveChallengeId(null)}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="btn btn-subtle btn-sm"
                  onClick={() => handleOpenChallenge(c)}
                >
                  <span>{c.completed ? 'Ubah Refleksi' : 'Kerjakan Tantangan'}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
