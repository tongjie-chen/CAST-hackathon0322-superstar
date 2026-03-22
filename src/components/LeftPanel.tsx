import React, { useState, useEffect } from 'react';
import type { TabKey } from '../types';

interface LeftPanelProps {
  activeTab: TabKey;
  onNavigate: (tab: TabKey) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ activeTab, onNavigate, theme, onToggleTheme }) => {
  const [careerChoice, setCareerChoice] = useState(localStorage.getItem('careerChoice') || 'Aspiring Professional');

  useEffect(() => {
    const handleStorage = () => setCareerChoice(localStorage.getItem('careerChoice') || 'Aspiring Professional');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  const menuItems: TabKey[] = ['Overview', 'Career Exploration', 'Skills Training', 'Interview Prep'];

  return (
    <aside className="glass-panel left-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <h2 className="heading text-gradient" style={{ margin: 0 }}>Career AI</h2>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <p className="text-muted" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem' }}>Modules</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item) => {
              const isActive = activeTab === item;
              
              const getIcon = () => {
                const props = {
                  width: '20px',
                  height: '20px',
                  stroke: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                  strokeWidth: '2',
                  fill: 'none',
                  strokeLinecap: 'round' as const,
                  strokeLinejoin: 'round' as const,
                  style: { opacity: isActive ? 1 : 0.7 }
                };

                switch (item) {
                  case 'Overview':
                    return (
                      <svg {...props} viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    );
                  case 'Career Exploration':
                    return (
                      <svg {...props} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    );
                  case 'Skills Training':
                    return (
                      <svg {...props} viewBox="0 0 24 24">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    );
                  case 'Interview Prep':
                    return (
                      <svg {...props} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    );
                  default: return null;
                }
              };

              return (
                <li 
                  key={item} 
                  onClick={() => onNavigate(item)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    fontWeight: isActive ? 600 : 500,
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--card-hover-bg)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {getIcon()}
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid var(--panel-border)' }}>
        <button 
          onClick={onToggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: 'var(--input-bg)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'var(--transition-fast)',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-color)'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
        >
          <span style={{ fontSize: '1.125rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="heading" style={{ fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>John Smith</h3>
            <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{careerChoice}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
