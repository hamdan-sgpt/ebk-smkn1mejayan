import React, { useState } from 'react';
import { 
  Search, 
  GraduationCap, 
  ShieldCheck, 
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { DATA_SISWA_KELAS_11 } from '../data/students';
import { DEFAULT_TEACHERS, DEFAULT_TEACHER_REG_CODE } from '../data/teachers';

export default function LoginView({ 
  onLoginStudent, 
  onLoginTeacher, 
  showToast 
}) {
  const [activeRoleTab, setActiveRoleTab] = useState('siswa');
  
  const [nisnInput, setNisnInput] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedTeacherId, setSelectedTeacherId] = useState(DEFAULT_TEACHERS[0].id);
  const [customTeacherName, setCustomTeacherName] = useState('');
  const [schoolCodeInput, setSchoolCodeInput] = useState('');

  const handleNisnChange = (val) => {
    setNisnInput(val);
    const cleaned = val.trim();
    if (cleaned.length >= 4) {
      const matches = DATA_SISWA_KELAS_11.filter(s => s.nisn.includes(cleaned) || s.nis.includes(cleaned));
      if (matches.length === 1) {
        setSelectedStudent(matches[0]);
      } else if (matches.length > 1) {
        setSelectedStudent(null);
      }
    } else {
      setSelectedStudent(null);
    }
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const clean = nisnInput.trim();
    if (!clean) {
      showToast('Masukkan 10 digit NISN kamu.');
      return;
    }
    const found = selectedStudent || DATA_SISWA_KELAS_11.find(s => s.nisn === clean);
    if (!found) {
      showToast('NISN tidak ditemukan di daftar siswa Kelas 11.');
      return;
    }
    onLoginStudent(found);
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    const code = schoolCodeInput.trim().toUpperCase();
    if (code !== DEFAULT_TEACHER_REG_CODE) {
      showToast('Kode verifikasi salah. Hubungi Koordinator BK.');
      return;
    }

    let teacher = null;
    if (selectedTeacherId === 'custom') {
      if (!customTeacherName.trim()) {
        showToast('Ketik nama lengkap guru pembimbing.');
        return;
      }
      teacher = {
        id: 'guru_' + Date.now(),
        name: customTeacherName.trim(),
        roleTitle: 'Pendidik SMKN 1 Mejayan',
        nip: '-'
      };
    } else {
      teacher = DEFAULT_TEACHERS.find(t => t.id === selectedTeacherId) || DEFAULT_TEACHERS[0];
    }

    onLoginTeacher(teacher);
  };

  const quickTestStudents = [
  ];

  const filteredSearch = searchQuery.trim() 
    ? DATA_SISWA_KELAS_11.filter(s => 
        s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.nisn.includes(searchQuery) ||
        s.kelas.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 30)
    : DATA_SISWA_KELAS_11.slice(0, 15);

  return (
    <div className="login-container">
      
      {/* Clean Header */}
      <div className="login-header">
        <img 
          src="/assets/logo-bk-mejayan.jpeg" 
          alt="Logo SMKN 1 Mejayan" 
          className="login-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 className="login-title">e-BK Karier</h1>
        <p className="login-sub">SMKN 1 Mejayan</p>
      </div>

      {/* Role Tabs */}
      <div className="login-tabs">
        <button
          type="button"
          className={`login-tab ${activeRoleTab === 'siswa' ? 'active' : ''}`}
          onClick={() => setActiveRoleTab('siswa')}
        >
          <GraduationCap size={18} />
          <span>Siswa</span>
        </button>
        <button
          type="button"
          className={`login-tab ${activeRoleTab === 'guru' ? 'active' : ''}`}
          onClick={() => setActiveRoleTab('guru')}
        >
          <ShieldCheck size={18} />
          <span>Guru BK</span>
        </button>
      </div>

      {/* Student Login Form */}
      {activeRoleTab === 'siswa' && (
        <div className="login-form-area">
          <form onSubmit={handleStudentSubmit}>
            <label className="form-label" htmlFor="nisnInput">NISN</label>
            <div className="input-row">
              <input
                id="nisnInput"
                type="text"
                inputMode="numeric"
                className="form-input"
                placeholder="Ketik 10 digit NISN"
                value={nisnInput}
                onChange={(e) => handleNisnChange(e.target.value)}
                required
                maxLength={10}
                autoFocus
              />
              <button
                type="button"
                className="btn btn-outline icon-btn"
                onClick={() => setIsSearchModalOpen(true)}
                title="Cari nama"
              >
                <Search size={18} />
              </button>
            </div>

            {selectedStudent && (
              <div className="match-badge">
                <CheckCircle2 size={16} />
                <span>{selectedStudent.nama} · {selectedStudent.kelas}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Masuk
            </button>
          </form>

          {/* Quick Login */}
          <div className="quick-login">
            <span className="quick-login-label">Coba akun contoh:</span>
            <div className="quick-login-list">
              {quickTestStudents.map(item => (
                <button
                  key={item.nisn}
                  type="button"
                  className="quick-login-btn"
                  onClick={() => {
                    const s = DATA_SISWA_KELAS_11.find(std => std.nisn === item.nisn);
                    if (s) {
                      setNisnInput(s.nisn);
                      setSelectedStudent(s);
                      onLoginStudent(s);
                    }
                  }}
                >
                  <strong>{item.label}</strong> {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Login Form */}
      {activeRoleTab === 'guru' && (
        <div className="login-form-area">
          <form onSubmit={handleTeacherSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="teacherSelect">Nama Guru</label>
              <select
                id="teacherSelect"
                className="form-select"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
              >
                {DEFAULT_TEACHERS.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.roleTitle})
                  </option>
                ))}
                <option value="custom">Nama Guru Lainnya...</option>
              </select>
            </div>

            {selectedTeacherId === 'custom' && (
              <div className="form-group">
                <label className="form-label" htmlFor="customTeacherName">Nama Lengkap</label>
                <input
                  id="customTeacherName"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Drs. Bambang Santoso, M.Pd"
                  value={customTeacherName}
                  onChange={(e) => setCustomTeacherName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="schoolCode">Kode Sekolah</label>
              <input
                id="schoolCode"
                type="password"
                className="form-input"
                placeholder="Masukkan kode sekolah"
                value={schoolCodeInput}
                onChange={(e) => setSchoolCodeInput(e.target.value)}
                required
              />
              <div className="form-hint">
                Default: <code>SMKMEJAYAN2026</code>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Masuk
            </button>

            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: '10px' }}
              onClick={() => onLoginTeacher(DEFAULT_TEACHERS[0])}
            >
              Masuk Langsung (Drs. M. Rofik)
            </button>
          </form>
        </div>
      )}

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-sheet" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Cari Siswa</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setIsSearchModalOpen(false)}
                aria-label="Tutup"
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ketik nama atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />

              <div className="student-search-results-list">
                {filteredSearch.map((s, idx) => (
                  <div
                    key={`${s.nisn}_${s.id || idx}`}
                    className="student-search-item"
                    onClick={() => {
                      setNisnInput(s.nisn);
                      setSelectedStudent(s);
                      setIsSearchModalOpen(false);
                      onLoginStudent(s);
                    }}
                  >
                    <div>
                      <div className="student-search-name">{s.nama}</div>
                      <div className="student-search-meta">
                        {s.kelas} · NISN: <span className="tabular-nums">{s.nisn}</span>
                      </div>
                    </div>
                    <span className="search-pick-btn">Pilih</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
