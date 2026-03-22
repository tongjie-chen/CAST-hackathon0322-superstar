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
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <LeftPanel activeTab={activeTab} onNavigate={setActiveTab} />
      {renderContent()}
    </div>
  );
};

export default App;
