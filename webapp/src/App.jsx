import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import CommandPalette from './components/layout/CommandPalette';
import ToastContainer from './components/common/ToastContainer';

import CareerBoardView from './components/workstations/CareerBoardView';
import OpportunitiesView from './components/workstations/OpportunitiesView';
import ResearchHubView from './components/workstations/ResearchHubView';
import GoalSpacesView from './components/workstations/GoalSpacesView';
import AetcomView from './components/workstations/AetcomView';
import MentorshipView from './components/workstations/MentorshipView';
import CampusView from './components/workstations/CampusView';
import PassportView from './components/workstations/PassportView';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isRedShift, setIsRedShift] = useState(false);
  const [credits, setCredits] = useState(340);
  const [toasts, setToasts] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync red-shift night call mode class with body
  useEffect(() => {
    if (isRedShift) {
      document.body.classList.add('redshift-mode');
    } else {
      document.body.classList.remove('redshift-mode');
    }
  }, [isRedShift]);

  const addToast = (toastObj) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toastObj };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddCredits = (amount) => {
    setCredits((c) => c + amount);
  };

  const screenTitles = {
    dashboard: 'Daily Career Board & Clinical Cockpit',
    research: 'Research & Publishing Command Centre',
    goalspaces: 'Goal Spaces Workbench (Collaborative Sprints)',
    aetcom: 'AETCOM Bioethics, Attitude & Communication',
    mentorship: 'Async Mentorship Triage (SBAR Protocol)',
    campus: 'Campus Pulse & National Med-Q Arena',
    opportunities: 'Bharat Opportunities Engine (Central Catalog)',
    identity: 'Verified Medical Passport (Credential Ledger)',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-[#0B101B] text-zinc-900 dark:text-[#F1F5F9] font-sans antialiased">
      {/* 220px Fixed Sidebar Navigation */}
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        credits={credits}
        onOpenCredits={() =>
          addToast({
            type: 'info',
            title: 'Pulse Credits Balance',
            message: `Current Balance: ${credits} PC. Earned via Med-Q (+200), Peer Review (+140). 150 PC in Active Escrow.`,
          })
        }
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 52px Sticky Frosted Topbar */}
        <Topbar
          title={screenTitles[activeScreen] || 'PulseUp Clinical OS'}
          onOpenSearch={() => setIsSearchOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => {
            setIsDarkMode(!isDarkMode);
            addToast({
              type: 'info',
              title: isDarkMode ? 'Light Theme Activated' : 'Dark Theme Activated',
              message: isDarkMode ? 'Switched to clean zinc daytime palette.' : 'Switched to clinical dark ward palette.',
            });
          }}
          isRedShift={isRedShift}
          onToggleRedShift={() => {
            setIsRedShift(!isRedShift);
            addToast({
              type: 'info',
              title: !isRedShift ? '🔴 Night Call Mode Active' : '☀️ Standard Mode Restored',
              message: !isRedShift
                ? 'Monochrome red-shift palette enabled for dark call-rooms and melatonin protection.'
                : 'Default clinical contrast restored.',
            });
          }}
          onShowNmcStatus={() =>
            addToast({
              type: 'success',
              title: 'NMC Live Node Status',
              message: 'Connected to National Medical Commission & ABDM Registry. Latency: 24ms.',
            })
          }
        />

        {/* Scrollable Workspace Body */}
        <main className="flex-1 overflow-y-auto p-6 max-w-[1500px] w-full mx-auto">
          {activeScreen === 'dashboard' && (
            <CareerBoardView
              onNavigate={setActiveScreen}
              isDarkMode={isDarkMode}
              onToast={addToast}
            />
          )}
          {activeScreen === 'opportunities' && (
            <OpportunitiesView onToast={addToast} />
          )}
          {activeScreen === 'research' && (
            <ResearchHubView
              onToast={addToast}
              onAddCredits={handleAddCredits}
            />
          )}
          {activeScreen === 'goalspaces' && (
            <GoalSpacesView onToast={addToast} />
          )}
          {activeScreen === 'aetcom' && (
            <AetcomView
              onToast={addToast}
              onAddCredits={handleAddCredits}
            />
          )}
          {activeScreen === 'mentorship' && (
            <MentorshipView
              onToast={addToast}
              onAddCredits={handleAddCredits}
            />
          )}
          {activeScreen === 'campus' && (
            <CampusView
              onToast={addToast}
              onAddCredits={handleAddCredits}
            />
          )}
          {activeScreen === 'identity' && (
            <PassportView onToast={addToast} credits={credits} />
          )}
        </main>
      </div>

      {/* Global Cmd+K Search Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={setIsSearchOpen}
        onSelectScreen={setActiveScreen}
      />

      {/* Stacked Bottom-Right Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
