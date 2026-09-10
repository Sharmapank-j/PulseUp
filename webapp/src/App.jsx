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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Persistent User Profile
  const defaultProfile = {
    name: 'Dr. Aarav Sharma',
    role: 'Senior Resident (JR-2) · MAMC',
    college: 'Maulana Azad Medical College (MAMC), New Delhi',
    nmcNumber: 'DMC/R/142981',
    abdmId: 'aarav.sharma@hpid.abdm',
    score: 785,
    initials: 'AS'
  };

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseup_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return defaultProfile;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pulseup_profile', JSON.stringify(userProfile));
    } catch (e) { console.error(e); }
  }, [userProfile]);

  // Persistent Pulse Credits
  const [credits, setCredits] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseup_credits');
      if (saved !== null) return Number(saved);
    } catch (e) { console.error(e); }
    return 340;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pulseup_credits', String(credits));
    } catch (e) { console.error(e); }
  }, [credits]);

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
      {/* Sidebar Navigation (Desktop Persistent + Mobile Drawer) */}
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        credits={credits}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        userProfile={userProfile}
        onOpenProfile={() => setActiveScreen('identity')}
        onOpenCredits={() =>
          addToast({
            type: 'info',
            title: 'Pulse Credits Balance',
            message: `Current Balance: ${credits} PC. Earned via Med-Q, Peer Review & AETCOM Simulations. 150 PC in Active Escrow.`,
          })
        }
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Frosted Topbar */}
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
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* Scrollable Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-[1500px] w-full mx-auto">
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
            <PassportView
              onToast={addToast}
              credits={credits}
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
            />
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
