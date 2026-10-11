import React from 'react';
import { 
  Home, 
  ClipboardList, 
  BookOpen, 
  MessageSquareText, 
  Users, 
  SlidersHorizontal 
} from 'lucide-react';

export default function BottomNav({ role, activeTab, onSelectTab }) {
  if (!role) return null;

  const studentTabs = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'assessment', label: 'Asesmen', icon: ClipboardList },
    { id: 'materi', label: 'Modul', icon: BookOpen },
    { id: 'counseling', label: 'Konseling', icon: MessageSquareText }
  ];

  const teacherTabs = [
    { id: 'dashboard', label: 'Siswa', icon: Users },
    { id: 'studio', label: 'Bank Soal', icon: SlidersHorizontal },
    { id: 'guru_counseling', label: 'Konseling', icon: MessageSquareText }
  ];

  const tabs = role === 'guru' ? teacherTabs : studentTabs;

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navigasi Utama">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
