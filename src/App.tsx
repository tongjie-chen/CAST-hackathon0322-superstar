import React, { useState } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { Overview } from './components/views/Overview';
import { Assessment } from './components/views/Assessment';
import { CareerExploration } from './components/views/CareerExploration';
import { SkillsTraining } from './components/views/SkillsTraining';
import { InterviewPrep } from './components/views/InterviewPrep';
import type { TabKey } from './types';
import './index.css';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Overview');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as 'dark' | 'light') || 'dark');

  const tabToSlug = (key: TabKey) => key.toLowerCase().replace(/\s+/g, '-');
  const slugToTab = (slug: string): TabKey | null => {
    const map: Record<string, TabKey> = {
      'overview': 'Overview',
      'assessment': 'Assessment',
      'career-exploration': 'Career Exploration',
      'skills-training': 'Skills Training',
      'interview-prep': 'Interview Prep'
    };
    return map[slug] || null;
  };

  React.useEffect(() => {
    const handleHashChange = () => {
      const parts = window.location.hash.slice(2).split('/');
      const mainTab = slugToTab(parts[0]);
      if (mainTab) setActiveTab(mainTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  React.useEffect(() => {
    const slug = tabToSlug(activeTab);
    const currentHashParts = window.location.hash.slice(2).split('/');
    if (currentHashParts[0] !== slug) {
       window.location.hash = `#/${slug}`;
    }
  }, [activeTab]);

  React.useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const renderContent = () => {
    switch(activeTab) {
      case 'Overview': return <Overview onNavigate={(t) => setActiveTab(t as TabKey)} />;
      case 'Assessment': return <Assessment />;
      case 'Career Exploration': return <CareerExploration />;
      case 'Skills Training': return <SkillsTraining />;
      case 'Interview Prep': return <InterviewPrep />;
      default: return <Overview onNavigate={(t) => setActiveTab(t as TabKey)} />;
    }
  };

  return (
    <div className="app-container">
      <LeftPanel activeTab={activeTab} onNavigate={setActiveTab} theme={theme} onToggleTheme={toggleTheme} />
      {renderContent()}
    </div>
  );
};

export default App;
