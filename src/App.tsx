import React from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import './index.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <LeftPanel />
      <RightPanel />
    </div>
  );
};

export default App;
