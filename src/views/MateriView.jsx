import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, HelpCircle, ArrowLeft, Clock } from 'lucide-react';
import { DEFAULT_CAREER_MODULES, DEFAULT_MODULE_QUIZZES } from '../data/careerModules';

export default function MateriView({ showToast }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const [showQuizExplanation, setShowQuizExplanation] = useState({});

  const handleOpenModule = (mod) => {
    setSelectedModule(mod);
    setSelectedQuizAnswers({});
    setShowQuizExplanation({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuizOption = (quizId, optKey) => {
    setSelectedQuizAnswers(prev => ({ ...prev, [quizId]: optKey }));
  };

  const handleCheckQuiz = (quizId) => {
    if (!selectedQuizAnswers[quizId]) {
      showToast('Pilih salah satu jawaban terlebih dahulu.');
      return;
    }
    setShowQuizExplanation(prev => ({ ...prev, [quizId]: true }));
  };

  // Tampilan Lembar Baca Modul & Kuis
  if (selectedModule) {
    const relatedQuizzes = DEFAULT_MODULE_QUIZZES.filter(q => q.moduleId === selectedModule.id);

    return (
      <div className="module-reader-container">
        <button 
          type="button" 
          className="btn btn-subtle btn-sm module-back-btn" 
          onClick={() => setSelectedModule(null)}
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Modul</span>
        </button>

        <article className="card module-reader-card">
          <div className="module-badge-row">
            <span className="badge-pill primary">{selectedModule.badge}</span>
            <span className="module-read-estimate">
              <Clock size={13} />
              <span>5 menit baca</span>
            </span>
          </div>

          <h2 className="module-reader-title">
            {selectedModule.title}
          </h2>
          <p className="module-reader-sub">
            {selectedModule.subtitle}
          </p>

          <div 
            className="module-body-prose"
            dangerouslySetInnerHTML={{ __html: selectedModule.content }}
          />
        </article>

        {/* Kuis Interaktif Pemahaman */}
        {relatedQuizzes.length > 0 && (
          <div className="card module-quiz-card">
            <div className="quiz-card-header">
              <HelpCircle size={18} className="quiz-header-icon" />
              <h3 className="quiz-header-title">Kuis Pemahaman Materi</h3>
            </div>

            {relatedQuizzes.map((qz, idx) => {
              const currentChoice = selectedQuizAnswers[qz.id];
              const isChecked = showQuizExplanation[qz.id];
              const isCorrect = currentChoice === qz.correctKey;

              return (
                <div key={qz.id} className="quiz-question-box">
                  <div className="quiz-question-title">
                    {idx + 1}. {qz.question}
                  </div>

                  <div className="quiz-options-list">
                    {qz.options.map((opt, optIdx) => {
                      const optKey = opt.trim().charAt(0);
                      const isSelected = currentChoice === optKey;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => !isChecked && handleSelectQuizOption(qz.id, optKey)}
                          className={`quiz-option-item ${isSelected ? 'selected' : ''}`}
                        >
                          <span className="quiz-opt-badge">
                            {optKey}
                          </span>
                          <span className="quiz-opt-text">{opt.substring(2).trim()}</span>
                        </div>
                      );
                    })}
                  </div>

                  {!isChecked ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleCheckQuiz(qz.id)}
                      disabled={!currentChoice}
                    >
                      Periksa Jawaban
                    </button>
                  ) : (
                    <div className={`quiz-feedback-box ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <div className="feedback-heading">
                        {isCorrect ? 'Jawaban Anda Tepat!' : `Kunci Jawaban yang Benar: ${qz.correctKey}`}
                      </div>
                      <div className="feedback-desc">{qz.explanation}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  // Tampilan Beranda Daftar Modul
  return (
    <div className="modules-list-container">
      <div className="modules-list-header">
        <h2 className="modules-page-title">
          Panduan Karier Vokasi (BMW)
        </h2>
        <p className="modules-page-sub">
          Panduan kesiapan kerja, kelanjutan studi politeknik, dan wirausaha mandiri khusus siswa SMKN 1 Mejayan.
        </p>
      </div>

      <div className="modules-card-stack">
        {DEFAULT_CAREER_MODULES.map((mod, idx) => (
          <div 
            key={mod.id}
            className="card module-summary-card"
            onClick={() => handleOpenModule(mod)}
          >
            <div className="module-card-top-row">
              <span className="badge-pill primary">{mod.badge}</span>
              <span className="module-number-label">Modul {idx + 1}</span>
            </div>

            <h3 className="module-summary-title">
              {mod.title}
            </h3>

            <p className="module-summary-desc">
              {mod.subtitle}
            </p>

            <div className="module-card-footer">
              <span className="module-read-prompt">
                Buka & Pelajari Modul
              </span>
              <span className="module-read-time">
                <Clock size={12} />
                <span>5 mnt</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
