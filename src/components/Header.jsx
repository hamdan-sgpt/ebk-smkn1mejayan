import React from 'react';
import { 
  Sun, 
  Moon, 
  User as UserIcon
} from 'lucide-react';

export default function Header({ 
  user, 
  theme, 
  onSelectTab, 
  onToggleTheme, 
  onOpenProfile, 
  onLogout,
  onInstallApp
}) {
  const isTeacher = user?.role === 'guru';

  return (
    <header className="app-header">
      <div className="header-container">
        <div 
          className="header-brand" 
          onClick={() => user && onSelectTab(isTeacher ? 'dashboard' : 'home')}
          title="e-BK SMKN 1 Mejayan"
        >
          <img 
            src="/assets/logo-bk-mejayan.jpeg" 
            alt="Logo SMKN 1 Mejayan" 
            className="header-logo"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="header-title-wrap">
            <h1 className="header-title">e-BK Karier</h1>
            <span className="header-subtitle">SMKN 1 Mejayan</span>
          </div>
        </div>

        <div className="header-actions">
          {user && (
            <button 
              type="button" 
              className="header-avatar-btn"
              onClick={onOpenProfile}
              title={`Profil: ${user.name}`}
            >
              <span className="header-avatar-circle">
                <UserIcon size={16} />
              </span>
              <span className="header-avatar-name">{user.name.split(' ')[0]}</span>
            </button>
          )}
          
          <button 
            type="button" 
            className="theme-toggle-btn" 
            onClick={onToggleTheme} 
            aria-label={theme === 'dark' ? "Mode Terang" : "Mode Gelap"}
            title={theme === 'dark' ? "Mode Terang" : "Mode Gelap"}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
