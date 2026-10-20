import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { NewCorrection } from './components/NewCorrection';
import { currentUser, initialCorrections } from './data';
import { Correction } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-correction'>('dashboard');
  const [corrections, setCorrections] = useState<Correction[]>(initialCorrections);

  const handleSaveCorrection = (newCorrection: Correction) => {
    setCorrections((prev) => [newCorrection, ...prev]);
  };

  return (
    <Layout
      currentUser={currentUser}
      activeTab={activeTab}
      onNavigate={(tab) => setActiveTab(tab)}
    >
      {activeTab === 'dashboard' ? (
        <Dashboard
          corrections={corrections}
          onNavigateToNew={() => setActiveTab('new-correction')}
        />
      ) : (
        <NewCorrection
          onSaveCorrection={handleSaveCorrection}
          onNavigateToDashboard={() => setActiveTab('dashboard')}
        />
      )}
    </Layout>
  );
};

export default App;
