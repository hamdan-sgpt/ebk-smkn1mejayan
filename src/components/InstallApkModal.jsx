import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Share2, 
  Wifi, 
  Info, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Modal from './Modal';

export default function InstallApkModal({
  isOpen,
  onClose,
  deferredInstallPrompt,
  onInstallPromptSuccess,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('pwa'); // 'pwa' | 'apk' | 'network'

  const currentHost = window.location.host;
  const currentUrl = window.location.origin;

  // Trigger browser WebAPK native install prompt
  const handleTriggerNativeInstall = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          if (showToast) showToast('Aplikasi e-BK berhasil dipasang di layar utama HP kamu!', 'success');
          if (onInstallPromptSuccess) onInstallPromptSuccess();
          onClose();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      if (showToast) {
        showToast('Buka di Google Chrome HP, tekan Titik Tiga (⋮) lalu pilih "Instal Aplikasi".', 'info');
      }
    }
  };

  // Direct APK download handler
  const handleDownloadApkFile = () => {
    const releaseUrl = 'https://github.com/hamdan-sgpt/ebk-smkn1mejayan/releases/download/v1.0.0-apk/e-BK-SMKN1Mejayan.apk';
    const link = document.createElement('a');
    link.href = releaseUrl;
    link.download = 'e-BK-SMKN1Mejayan.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
    }, 2000);
    if (showToast) {
      showToast('Memulai pengunduhan paket e-BK-SMKN1Mejayan.apk (4.3 MB)...', 'success');
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    if (showToast) showToast('Alamat URL berhasil disalin ke clipboard!', 'success');
  };

  return (
    <Modal isOpen={isOpen} title="Pasang & Unduh e-BK Mobile" onClose={onClose}>
      <div className="install-apk-modal-content">
        
        {/* Sub-tabs Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'pwa' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('pwa')}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Smartphone size={15} />
            <span>Pasang di HP (PWA)</span>
          </button>
          
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'apk' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('apk')}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Download size={15} />
            <span>File Mentah (.APK)</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'network' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('network')}
            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Wifi size={15} />
            <span>Akses HP (Hotspot)</span>
          </button>
        </div>

        {/* TAB 1: PWA WebAPK Instan (Rekomendasi Utama) */}
        {activeTab === 'pwa' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(190, 18, 60, 0.08), rgba(225, 29, 72, 0.04))', 
              border: '1.5px solid rgba(190, 18, 60, 0.25)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ 
                  background: 'var(--primary)', 
                  color: '#ffffff', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px'
                }}>
                  ⭐
                </span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Pasang WebAPK Resmi (Rekomendasi Siswa)
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Ukuran ultra ringan (&lt; 1 MB) · Ikon terpasang di Android · Layar penuh tanpa bar URL
                  </span>
                </div>
              </div>

              {deferredInstallPrompt ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleTriggerNativeInstall}
                  style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                >
                  <Smartphone size={18} />
                  <span>Pasang Sekarang ke Layar Utama HP</span>
                </button>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-main)', margin: '0 0 10px' }}>
                    Jika tombol pasang otomatis belum muncul, ikuti 3 langkah cepat di browser Chrome HP kamu:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>1</span>
                      <span>Buka web ini di browser <strong>Google Chrome</strong> pada HP Android kamu.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>2</span>
                      <span>Ketuk menu <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser.</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>3</span>
                      <span>Pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', background: 'var(--surface-raised)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>Aplikasi e-BK akan terpasang di app drawer ponsel dan tersinkronisasi otomatis saat guru mengupdate data.</span>
            </div>
          </div>
        )}

        {/* TAB 2: File .APK Standalone */}
        {activeTab === 'apk' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Download size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Unduh Paket .APK Android
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Untuk didistribusikan via WhatsApp atau media penyimpanan
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5, margin: '0 0 12px' }}>
                Klik tombol di bawah untuk mengunduh paket instalasi aplikasi e-BK Mejayan:
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDownloadApkFile}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
              >
                <Download size={18} />
                <span>Unduh File e-BK-Mejayan.apk</span>
              </button>
            </div>

            {/* Panduan Ekspor APK via PWABuilder */}
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--text-main)', marginBottom: '6px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <span>Cara Membuat File .APK Baru Gratis (1 Klik):</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                1. Buka <strong>PWABuilder.com</strong> (alat gratis resmi buatan Microsoft).<br />
                2. Masukkan URL hosting aplikasi e-BK SMKN 1 Mejayan.<br />
                3. Klik <strong>"Build APK"</strong> lalu pilih <strong>"Download Android Package"</strong>.<br />
                File .apk siap langsung dibagikan ke siswa tanpa perlu Android Studio!
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Akses Jaringan Lokal (WiFi / Hotspot) */}
        {activeTab === 'network' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Wifi size={20} style={{ color: '#10b981' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Alamat Akses di Ponsel Siswa
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Gunakan alamat ini saat laptop dan HP tersambung WiFi / Hotspot yang sama
                  </span>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-main)', 
                border: '1.5px dashed var(--primary)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                margin: '12px 0'
              }}>
                <code style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                  {currentUrl}
                </code>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={copyUrlToClipboard}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Share2 size={13} />
                  <span>Salin URL</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                💡 <strong>Tips Bimbingan:</strong> Pastikan HP siswa terhubung ke Hotspot laptop yang sama, lalu buka alamat di atas pada browser Google Chrome HP.
              </div>
            </div>
          </div>
        )}

        {/* Modal Close Action */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

      </div>
    </Modal>
  );
}
