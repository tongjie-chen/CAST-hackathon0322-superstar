import React, { useState, useEffect } from 'react';
import { getActivities, clearActivities } from '../../utils/activity';
import type { Activity } from '../../utils/activity';

interface OverviewProps {
  onNavigate: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const career = localStorage.getItem('specificCareer') || localStorage.getItem('careerChoice') || '';

  const refreshData = () => {
    setActivities(getActivities());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('activityUpdated', refreshData);
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('activityUpdated', refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, []);

  const uniqueTypes = new Set(activities.map(a => a.type));
  const skillMastery = Math.min(100, (uniqueTypes.size * 20) + (activities.length > 5 ? 15 : 0));
  const completedTasks = activities.length;
  const interviewReadiness = activities.some(a => a.type === 'interview' || a.type === 'simulator') ? 75 : 45;

  return (
    <main className="glass-panel right-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div style={{ padding: '2.5rem', flex: 1, overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
          <div>
            <h1 className="heading" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>{career ? `Your ${career} Journey.` : 'Your Career Journey.'}</h1>
            <p className="text-muted" style={{ fontSize: '1.125rem' }}>{career ? `Master the skills to become an elite ${career}.` : 'Bridge the gap between uncertainty and job readiness.'}</p>
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
            { title: 'Skill Mastery', value: `${skillMastery}%`, trend: uniqueTypes.size > 0 ? `+${uniqueTypes.size} items` : 'Start now', color: '#10b981' },
            { title: 'Completed Tasks', value: completedTasks.toString(), trend: `Active session`, color: '#6366f1' },
            { title: 'Interview Readiness', value: `${interviewReadiness}%`, trend: interviewReadiness > 50 ? 'Improving' : 'Baseline', color: '#f59e0b' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: 'var(--chat-ai-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              transition: 'var(--transition-normal)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--card-hover-bg)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--chat-ai-bg)';
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="heading" style={{ fontSize: '1.25rem', margin: 0 }}>Recent Training Activity</h2>
            {activities.length > 0 && (
              <button 
                onClick={clearActivities}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >Clear Logs</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>No recent activity. Start your first module to track progress!</p>
            ) : activities.slice(0, 5).map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--chat-ai-bg)', borderRadius: '0.75rem', transition: 'var(--transition-fast)', border: '1px solid var(--panel-border)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--card-hover-bg)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--chat-ai-bg)'}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--panel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                  {item.type === 'assessment' ? '📋' : item.type === 'interview' ? '🎙️' : item.type === 'roadmap' ? '🗺️' : item.type === 'simulator' ? '💻' : '🔍'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</h4>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>{item.desc}</p>
                </div>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
