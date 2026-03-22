import React, { useState, useEffect } from 'react';
import type { TabKey } from '../types';

interface LeftPanelProps {
  activeTab: TabKey;
  onNavigate: (tab: TabKey) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ activeTab, onNavigate }) => {
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
        <h2 className="heading text-gradient" style={{ marginBottom: '2rem' }}>Career AI</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <p className="text-muted" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem' }}>Modules</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {menuItems.map((item) => {
              const isActive = activeTab === item;
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
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: isActive ? 'var(--accent-color)' : 'var(--text-secondary)', opacity: 0.8 }} />
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', padding: '2rem', borderTop: '1px solid var(--panel-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' }} />
          <div>
            <h3 className="heading" style={{ fontSize: '0.875rem', margin: 0 }}>Tongjie Chen</h3>
            <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{careerChoice}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
