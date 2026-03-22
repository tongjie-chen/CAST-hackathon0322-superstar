import React from 'react';

export const LeftPanel: React.FC = () => {
  return (
    <aside className="glass-panel left-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div style={{ padding: '2rem' }}>
        <h2 className="heading text-gradient" style={{ marginBottom: '2rem' }}>Infinity</h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <p className="text-muted" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '1rem' }}>Menu</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Dashboard', 'Analytics', 'Projects', 'Tasks', 'Settings'].map((item, idx) => (
              <li 
                key={item} 
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  background: idx === 0 ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: idx === 0 ? 'var(--accent-color)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  fontWeight: idx === 0 ? 600 : 500,
                  border: idx === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseOver={(e) => {
                  if (idx !== 0) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (idx !== 0) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: idx === 0 ? 'var(--accent-color)' : 'var(--text-secondary)', opacity: 0.8 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', padding: '2rem', borderTop: '1px solid var(--panel-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' }} />
          <div>
            <h3 className="heading" style={{ fontSize: '0.875rem', margin: 0 }}>Tongjie Chen</h3>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
