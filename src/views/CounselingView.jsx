import React, { useState, useEffect } from 'react';
import { 
  MessageSquareText, 
  Send, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  CalendarCheck,
  MessageCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function CounselingView({
  user,
  counselingRequests = [],
  onRequestCounseling,
  showToast
}) {
  const [activeSubTab, setActiveSubTab] = useState('chat'); // 'chat' | 'booking'
  const [topic, setTopic] = useState('Pilihan Jalur Karier Pasca SMK');
  const [note, setNote] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Waktu standar besok pukul 09:00
  useEffect(() => {
    const tmrw = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tmrw.setHours(9, 0, 0, 0);
    const iso = new Date(tmrw.getTime() - tmrw.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setPreferredTime(iso);
  }, []);

  // Ambil riwayat chat konseling dari database MySQL
  useEffect(() => {
    if (!user?.nisn) return;
    api.fetchKonseling(user.nisn).then(res => {
      if (res && res.success && Array.isArray(res.messages)) {
        setChatMessages(res.messages);
      }
    });
  }, [user?.nisn]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      showToast('Tuliskan hal atau permohonan yang ingin Anda diskusikan.');
      return;
    }

    const newReq = {
      id: 'req_' + Date.now(),
      topic,
      note: note.trim(),
      time: preferredTime,
      status: 'Menunggu Konfirmasi',
      studentClass: user.studentClass,
      createdAt: new Date().toISOString()
    };

    onRequestCounseling(newReq);
    setNote('');
    showToast('Pengajuan jadwal tatap muka berhasil dikirim ke Guru BK!');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput('');
    setIsSending(true);

    const tempMsg = {
      id: 'msg_' + Date.now(),
      sender_type: 'siswa',
      sender_name: user.name,
      pesan: text,
      created_at: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, tempMsg]);

    try {
      await api.sendKonselingMessage(user.nisn, 'siswa', user.name, text);
    } catch {
      // Offline fallback
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickQuestion = (quickText) => {
    setChatInput(quickText);
  };

  return (
    <div className="counseling-view-container">
      
      {/* Notice Asas Kerahasiaan ABKIN */}
      <div className="counseling-privacy-notice">
        <ShieldCheck size={18} className="privacy-icon" />
        <span>
          <strong>Asas Kerahasiaan BK:</strong> Seluruh konsultasi dan pesan bimbingan dijamin kerahasiaannya sesuai Kode Etik Bimbingan dan Konseling Indonesia (ABKIN).
        </span>
      </div>

      {/* Sub-tab Navigation (Pesan Singkat vs Jadwal Tatap Muka) */}
      <div className="counseling-subtab-switch">
        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('chat')}
        >
          <MessageCircle size={16} />
          <span>Pesan Singkat ({chatMessages.length})</span>
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'booking' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('booking')}
        >
          <CalendarCheck size={16} />
          <span>Jadwal Tatap Muka ({counselingRequests.length})</span>
        </button>
      </div>

      {/* TAMPILAN 1: CHAT DENGAN GURU BK */}
      {activeSubTab === 'chat' && (
        <div className="card counseling-chat-card">
          <div className="chat-card-header">
            <div>
              <h3 className="chat-header-title">Konsultasi Daring Guru BK</h3>
              <p className="chat-header-sub">Bersama Drs. M. Rofik, M.Pd</p>
            </div>
            <span className="counselor-online-badge">Tersambung</span>
          </div>

          {/* Quick Discussion Prompts */}
          <div className="chat-quick-prompts">
            <span className="prompts-label">Topik Cepat:</span>
            <button 
              type="button" 
              className="prompt-chip"
              onClick={() => handleQuickQuestion('Pak, saya masih ragu memilih antara langsung kerja atau kuliah politeknik.')}
            >
              Ragu Kerja vs Kuliah
            </button>
            <button 
              type="button" 
              className="prompt-chip"
              onClick={() => handleQuickQuestion('Pak, bagaimana cara mencari informasi tempat magang PKL yang relevan?')}
            >
              Info Magang PKL
            </button>
            <button 
              type="button" 
              className="prompt-chip"
              onClick={() => handleQuickQuestion('Pak, saya ingin bimbingan terkait persiapan berkas wawancara industri.')}
            >
              Wawancara Kerja
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="chat-messages-container" id="chatStream">
            {chatMessages.length === 0 ? (
              <div className="chat-empty-state">
                <MessageSquareText size={32} className="chat-empty-icon" />
                <p>Belum ada percakapan dengan Guru BK.</p>
                <span>Ketik pertanyaan atau pilih salah satu topik cepat di atas untuk memulai konsultasi.</span>
              </div>
            ) : (
              chatMessages.map((m, idx) => {
                const isMe = m.sender_type === 'siswa';
                return (
                  <div
                    key={m.id || idx}
                    className={`chat-bubble-wrap ${isMe ? 'chat-me' : 'chat-counselor'}`}
                  >
                    <div className="chat-bubble-meta">
                      {isMe ? 'Saya' : (m.sender_name || 'Drs. M. Rofik, M.Pd (Guru BK)')}
                    </div>
                    <div className="chat-bubble-text">
                      {m.pesan}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <input
              type="text"
              className="form-input chat-input-field"
              placeholder="Ketik pesan atau pertanyaan untuk Guru BK..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              aria-label="Pesan untuk Guru BK"
            />
            <button 
              type="submit" 
              className="btn btn-primary chat-send-btn"
              disabled={isSending || !chatInput.trim()}
              title="Kirim Pesan"
              aria-label="Kirim Pesan"
            >
              <Send size={16} />
              <span className="send-btn-label">Kirim</span>
            </button>
          </form>
        </div>
      )}

      {/* TAMPILAN 2: JADWAL TATAP MUKA DI RUANG BK */}
      {activeSubTab === 'booking' && (
        <div className="counseling-booking-stack">
          {/* Formulir Pengajuan */}
          <div className="card counseling-booking-card">
            <h3 className="booking-card-title">
              Ajukan Pertemuan Tatap Muka di Ruang BK
            </h3>
            <p className="booking-card-sub">
              Tentukan topik pembahasan dan waktu pertemuan bimbingan tatap muka bersama Drs. M. Rofik, M.Pd.
            </p>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-group">
                <label className="form-label" htmlFor="counselTopic">Topik Bimbingan</label>
                <select
                  id="counselTopic"
                  className="form-select"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="Pilihan Jalur Karier Pasca SMK">Pilihan Jalur Karier Pasca SMK (BMW)</option>
                  <option value="Kendala Praktik Kejuruan / PKL">Kendala Praktik Kejuruan / Magang PKL</option>
                  <option value="Minat Melanjutkan ke Politeknik/PTN">Minat Melanjutkan ke Politeknik / Perguruan Tinggi</option>
                  <option value="Perencanaan Wirausaha Mandiri">Perencanaan Wirausaha Mandiri Vokasi</option>
                  <option value="Penguatan Keyakinan Diri Belajar">Penguatan Keyakinan Diri & Motivasi Belajar</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="counselTime">Pilihan Waktu / Jam Pertemuan</label>
                <input
                  id="counselTime"
                  type="datetime-local"
                  className="form-input"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="counselNote">Catatan / Hal yang Ingin Dibahas</label>
                <textarea
                  id="counselNote"
                  className="form-textarea"
                  rows={3}
                  placeholder="Ceritakan secara singkat hal yang ingin Anda konsultasikan..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg">
                <span>Kirim Pengajuan Jadwal</span>
              </button>
            </form>
          </div>

          {/* Riwayat Pengajuan */}
          <div className="card counseling-history-card">
            <h4 className="history-card-title">
              Riwayat Pengajuan Bimbingan ({counselingRequests.length})
            </h4>

            {counselingRequests.length === 0 ? (
              <p className="history-empty-text">
                Belum ada jadwal tatap muka yang diajukan.
              </p>
            ) : (
              <div className="history-items-list">
                {counselingRequests.map((req, idx) => (
                  <div key={req.id || idx} className="history-item-box">
                    <div className="history-item-header">
                      <span className="history-item-topic">{req.topic}</span>
                      <span className={`status-pill ${req.status === 'Terkonfirmasi' ? 'pill-success' : 'pill-warning'}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="history-item-time">
                      Waktu: {req.time ? new Date(req.time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                    </div>
                    <div className="history-item-note">
                      "{req.note}"
                    </div>

                    {req.counselorFeedback && (
                      <div className="history-feedback-box">
                        <strong>Catatan Guru BK:</strong> {req.counselorFeedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
