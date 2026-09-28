import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import AnalyzeView from './components/AnalyzeView';
import ProposalView from './components/ProposalView';
import MemoryView from './components/MemoryView';
import LearningView from './components/LearningView';
import SettingsView from './components/SettingsView';
import { fetchHealth, fetchStats, fetchMemories, analyzeSampleRfp } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [healthInfo, setHealthInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [memories, setMemories] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial load of backend health, stats, and memories
  const loadInitialData = async () => {
    try {
      const [h, s, m] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchStats().catch(() => null),
        fetchMemories().catch(() => ({ memories: [] })),
      ]);

      if (h) setHealthInfo(h);
      if (s) setStats(s);
      if (m && m.memories) setMemories(m.memories);
    } catch (e) {
      console.error('Initialization error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleRefreshMemories = async () => {
    try {
      const m = await fetchMemories();
      if (m && m.memories) setMemories(m.memories);
      const s = await fetchStats();
      if (s) setStats(s);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectSample = async () => {
    try {
      const res = await analyzeSampleRfp();
      setProfile(res.profile);
      setActiveTab('analyze');
    } catch (e) {
      alert(`Could not load sample: ${e.message}`);
    }
  };

  const handleOutcomeRecorded = (newRecord) => {
    if (newRecord) {
      setMemories((prev) => [newRecord, ...prev]);
      handleRefreshMemories();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top Header */}
        <Topbar
          onSelectSample={handleSelectSample}
          healthInfo={healthInfo}
          setActiveTab={setActiveTab}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-950/40">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              memories={memories}
              setActiveTab={setActiveTab}
              onLoadSample={handleSelectSample}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzeView
              profile={profile}
              setProfile={setProfile}
              setActiveTab={setActiveTab}
              onProposalReady={() => setActiveTab('proposals')}
            />
          )}

          {activeTab === 'proposals' && (
            <ProposalView
              profile={profile}
              setActiveTab={setActiveTab}
              onOutcomeRecorded={handleOutcomeRecorded}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryView
              memories={memories}
              healthInfo={healthInfo}
              onRefreshMemories={handleRefreshMemories}
              onOutcomeRecorded={handleOutcomeRecorded}
            />
          )}

          {activeTab === 'learning' && (
            <LearningView setActiveTab={setActiveTab} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              healthInfo={healthInfo}
              onRefreshHealth={loadInitialData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
