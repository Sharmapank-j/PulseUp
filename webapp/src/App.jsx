import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import CommandPalette from './components/layout/CommandPalette';
import ToastContainer from './components/common/ToastContainer';
import AiChatbot from './components/common/AiChatbot';
import ErrorBoundary from './components/common/ErrorBoundary';

import CareerBoardView from './components/workstations/CareerBoardView';
import OpportunitiesView from './components/workstations/OpportunitiesView';
import ResearchHubView from './components/workstations/ResearchHubView';
import GoalSpacesView from './components/workstations/GoalSpacesView';
import AetcomView from './components/workstations/AetcomView';
import MentorshipView from './components/workstations/MentorshipView';
import CampusView from './components/workstations/CampusView';
import PassportView from './components/workstations/PassportView';
import ChatbotSpaceView from './components/workstations/ChatbotSpaceView';

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

  const [lastEcosystemScreen, setLastEcosystemScreen] = useState('dashboard');
  const [dutyStatus, setDutyStatus] = useState('on_duty');

  const dutyCycle = ['on_duty', 'night_call', 'in_ot', 'research', 'off_call'];
  const dutyDescriptions = {
    on_duty: 'Ward Duty Active · Maulana Azad Medical College, Internal Med Ward 4B',
    night_call: 'Night Call Triage Active · Trauma Emergency & ICU Telemetry online',
    in_ot: 'In OT / Procedures · Thoracic Surgery & Emergency Laparotomy',
    research: 'Research Block · Drafting Multi-Center Stroke Thrombolysis Registry',
    off_call: 'Post-Duty Rest · NEET PG Recall Drills & AETCOM Case Review',
  };

  const handleToggleDutyStatus = () => {
    setDutyStatus((prev) => {
      const idx = dutyCycle.indexOf(prev);
      const next = dutyCycle[(idx + 1) % dutyCycle.length];
      addToast({
        type: 'info',
        title: 'Resident Duty Status Switched',
        message: dutyDescriptions[next],
      });
      return next;
    });
  };

  const handleSelectScreen = (screenId) => {
    if (activeScreen !== 'chatbot' && screenId === 'chatbot') {
      setLastEcosystemScreen(activeScreen);
    }
    setActiveScreen(screenId);
  };

  // Shared medimind.ai chat history between floating assistant & fullscreen workspace
  const DEFAULT_MEDIMIND_MESSAGES = [
    {
      role: 'assistant',
      text: `### Welcome to medimind.ai 🩺✨\n\nI am your dedicated **Clinical & Medical Career Copilot** for PulseUp.\n\n**Capabilities & Modes:**\n- **NEET PG & NEXT Strategy**: High-yield subject prioritization and clinical recall drills.\n- **ICMR-STS & Research Grants**: Protocol design, ethics clearance (IEC), and study methodology.\n- **NMC CBME & AETCOM**: SPIKES protocol and reflective logbook entries.\n- **USMLE & Global Track**: Step 1/2 CK study calendars and ECFMG match guidance.\n- **Multi-LLM Engine**: Connected with Google Gemini or your own Custom LLM server.\n\nAsk any clinical or career inquiry below to begin!`,
      id: 'welcome',
      timestamp: 'Just now'
    }
  ];

  const [medimindMessages, setMedimindMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseup_medimind_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return DEFAULT_MEDIMIND_MESSAGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pulseup_medimind_messages', JSON.stringify(medimindMessages));
    } catch (e) { console.error(e); }
  }, [medimindMessages]);

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
    chatbot: 'medimind.ai — Fullscreen Clinical Intelligence Workspace',
    research: 'Research & Publishing Command Centre',
    goalspaces: 'Goal Spaces Workbench (Collaborative Sprints)',
    aetcom: 'AETCOM Bioethics, Attitude & Communication',
    mentorship: 'Async Mentorship Triage (SBAR Protocol)',
    campus: 'Campus Pulse & National Med-Q Arena',
    opportunities: 'Bharat Opportunities Engine (Central Catalog)',
    identity: 'Verified Medical Passport (Credential Ledger)',
  };

  return (
    <div className="flex h-screen h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-zinc-50 dark:bg-[#070B14] text-zinc-900 dark:text-[#F1F5F9] font-sans antialiased overscroll-none clinical-grid relative">
      {/* Ambient Clinical Aura Lights */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl opacity-60 z-0" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl opacity-60 z-0" />

      {/* Sidebar Navigation (Desktop Persistent for Ecosystem + Mobile Drawer for All) */}
      {activeScreen !== 'chatbot' ? (
        <Sidebar
          activeScreen={activeScreen}
          onSelectScreen={handleSelectScreen}
          credits={credits}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          userProfile={userProfile}
          dutyStatus={dutyStatus}
          onToggleDutyStatus={handleToggleDutyStatus}
          onOpenProfile={() => handleSelectScreen('identity')}
          onOpenCredits={() =>
            addToast({
              type: 'info',
              title: 'Pulse Credits Balance',
              message: `Current Balance: ${credits} PC. Earned via Med-Q, Peer Review & AETCOM Simulations. 150 PC in Active Escrow.`,
            })
          }
        />
      ) : (
        isMobileMenuOpen && (
          <Sidebar
            activeScreen={activeScreen}
            onSelectScreen={(screen) => {
              setIsMobileMenuOpen(false);
              handleSelectScreen(screen);
            }}
            credits={credits}
            isMobileOpen={true}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            userProfile={userProfile}
            dutyStatus={dutyStatus}
            onToggleDutyStatus={handleToggleDutyStatus}
            onOpenProfile={() => handleSelectScreen('identity')}
            onOpenCredits={() =>
              addToast({
                type: 'info',
                title: 'Pulse Credits Balance',
                message: `Current Balance: ${credits} PC. Earned via Med-Q, Peer Review & AETCOM Simulations. 150 PC in Active Escrow.`,
              })
            }
          />
        )
      )}

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full max-h-full overflow-hidden relative z-1">
        {/* Sticky Frosted Topbar (Hidden in dedicated fullscreen chatbot workspace to maximize screen space) */}
        {activeScreen !== 'chatbot' && (
          <Topbar
            title={screenTitles[activeScreen] || 'PulseUp Clinical OS'}
            onOpenSearch={() => setIsSearchOpen(true)}
            isDarkMode={isDarkMode}
            dutyStatus={dutyStatus}
            onToggleDarkMode={() => {
              setIsDarkMode(!isDarkMode);
              addToast({
                type: 'info',
                title: isDarkMode ? 'Light Theme Activated' : 'Dark Theme Activated',
                message: isDarkMode ? 'Switched to clean daytime clinical palette.' : 'Switched to dark ward palette.',
              });
            }}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
          />
        )}

        {/* Scrollable Workspace Body */}
        <main className={`flex-1 min-w-0 min-h-0 ${
          activeScreen === 'chatbot'
            ? 'p-0 w-full h-full max-w-full overflow-hidden flex flex-col'
            : 'overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6 pb-28 sm:pb-32 max-w-[1500px] w-full mx-auto scroll-smooth'
        }`}>
          <ErrorBoundary onNavigateHome={() => handleSelectScreen('dashboard')}>
            {activeScreen === 'dashboard' && (
              <CareerBoardView
                onNavigate={handleSelectScreen}
                isDarkMode={isDarkMode}
                onToast={addToast}
              />
            )}
            {activeScreen === 'chatbot' && (
              <ChatbotSpaceView
                messages={medimindMessages}
                setMessages={setMedimindMessages}
                onToast={addToast}
                onAddCredits={handleAddCredits}
                onReturnToEcosystem={() => handleSelectScreen(lastEcosystemScreen || 'dashboard')}
                ecosystemScreenName={screenTitles[lastEcosystemScreen] || 'Career Board'}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => {
                  setIsDarkMode(!isDarkMode);
                  addToast({
                    type: 'info',
                    title: isDarkMode ? 'Light Theme Activated' : 'Dark Theme Activated',
                    message: isDarkMode ? 'Switched to clean daytime clinical palette.' : 'Switched to dark ward palette.',
                  });
                }}
                onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
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
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Cmd+K Search Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={setIsSearchOpen}
        onSelectScreen={handleSelectScreen}
      />

      {/* Stacked Bottom-Right Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* PulseUp Floating medimind.ai Assistant (Active only in PulseUp Ecosystem; automatically hidden inside the Fullscreen medimind.ai Workspace) */}
      {activeScreen !== 'chatbot' && (
        <AiChatbot
          messages={medimindMessages}
          setMessages={setMedimindMessages}
          onToast={addToast}
          onOpenSpace={() => handleSelectScreen('chatbot')}
        />
      )}
    </div>
  );
}
