import React from 'react';

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  return (
    <main className="glass-panel right-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
          <div>
            <h1 className="heading" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>Your Career Journey.</h1>
            <p className="text-muted" style={{ fontSize: '1.125rem' }}>Bridge the gap between uncertainty and job readiness.</p>
          </div>
          <button style={{
            background: 'var(--accent-gradient)',
            color: 'white',
            border: 'none',
            padding: '0.875rem 1.75rem',
            borderRadius: '2rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 20px -6px rgba(99, 102, 241, 0.6)',
            transition: 'var(--transition-normal)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onClick={() => onNavigate('Assessment')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(99, 102, 241, 0.8)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(99, 102, 241, 0.6)';
          }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>+</span> Start Assessment
          </button>
        </header>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {[
            { title: 'Skill Mastery', value: '45%', trend: '+12.5%', color: '#10b981' },
            { title: 'Completed Tasks', value: '12', trend: '+3', color: '#6366f1' },
            { title: 'Interview Readiness', value: '68%', trend: '+5.0%', color: '#f59e0b' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--panel-border)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              transition: 'var(--transition-normal)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = 'var(--panel-border)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
              <h3 className="text-muted" style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.title}</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <span className="heading" style={{ fontSize: '2rem', margin: 0 }}>{stat.value}</span>
                <span style={{ color: stat.color, fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '1.25rem', padding: '2rem', border: '1px solid var(--panel-border)', minHeight: '300px' }}>
          <h2 className="heading" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent Training Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { title: 'Mock Interview Completed', desc: 'Feedback received: Strong communication, improve technical depth.', time: '2h ago' },
              { title: 'Submitted Role-Play Task', desc: 'Product Manager daily standup simulation.', time: '5h ago' },
              { title: 'Personality Test Result', desc: 'ENTJ - Strategic Leader profile generated.', time: '1d ago' },
              { title: 'Career Path Selected', desc: 'Transitioning into Product Management.', time: '1d ago' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '0.75rem', transition: 'var(--transition-fast)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontWeight: 500 }}>{item.title}</h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>{item.desc}</p>
                </div>
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
