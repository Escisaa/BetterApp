import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#111213] text-gray-100">
      {currentView === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
      {currentView === 'dashboard' && <Dashboard />}
    </div>
  );
};

export default App;