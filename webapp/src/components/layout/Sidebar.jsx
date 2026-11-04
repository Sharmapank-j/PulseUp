import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Target,
  Stethoscope,
  MessageSquare,
  PartyPopper,
  Compass,
  CreditCard,
  ChevronRight,
  Bot,
  Sparkles,
  Maximize2,
  X
} from 'lucide-react';

export default function Sidebar({
  activeScreen,
  onSelectScreen,
  credits = 340,
  onOpenCredits,
  isMobileOpen = false,
  onCloseMobile,
  userProfile = { name: 'Dr. Aarav Sharma', role: 'JR-2 Internal Medicine · MAMC', score: 785, initials: 'AS' },
  onOpenProfile,
  dutyStatus = 'on_duty',
  onToggleDutyStatus
}) {
  const navItems = [
    { id: 'dashboard', label: 'Career Cockpit', icon: LayoutDashboard, badge: 'Live', section: 'Clinical Suite' },
    { id: 'chatbot', label: 'medimind.ai', icon: Sparkles, badge: 'Copilot', section: 'Clinical Suite' },
    { id: 'research', label: 'Research Hub', icon: FlaskConical, badge: '2 Active', section: 'Clinical Suite' },
    { id: 'goalspaces', label: 'Goal Spaces', icon: Target, badge: '6 Sprints', section: 'Clinical Suite' },
    { id: 'aetcom', label: 'AETCOM Bioethics', icon: Stethoscope, badge: '22/27', section: 'Ethics & Mentorship' },
    { id: 'mentorship', label: 'Async Mentorship', icon: MessageSquare, badge: '1 SBAR', section: 'Ethics & Mentorship' },
    { id: 'campus', label: 'Campus & Med-Q', icon: PartyPopper, badge: 'Daily Q', section: 'Bharat Network' },
    { id: 'opportunities', label: 'Bharat Opps', icon: Compass, badge: '68 Live', section: 'Bharat Network' },
    { id: 'identity', label: 'Medical Passport', icon: CreditCard, badge: 'Tier 2', section: 'Credential Vault' },
  ];

  const sections = ['Clinical Suite', 'Ethics & Mentorship', 'Bharat Network', 'Credential Vault'];

  const dutyMeta = {
    on_duty: { label: 'On Ward Duty', dot: 'bg-emerald-400', badge: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
    night_call: { label: 'Night Call Triage', dot: 'bg-rose-400', badge: 'text-rose-700 dark:text-rose-300 bg-rose-500/15 border-rose-500/30' },
    in_ot: { label: 'In OT / Procedures', dot: 'bg-blue-400', badge: 'text-blue-700 dark:text-blue-300 bg-blue-500/15 border-blue-500/30' },
    research: { label: 'Research Block', dot: 'bg-purple-400', badge: 'text-purple-700 dark:text-purple-300 bg-purple-500/15 border-purple-500/30' },
    off_call: { label: 'Post-Duty Rest', dot: 'bg-zinc-400', badge: 'text-zinc-600 dark:text-zinc-400 bg-zinc-500/15 border-zinc-500/30' },
  };

  const currentDuty = dutyMeta[dutyStatus] || dutyMeta.on_duty;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white/95 dark:bg-[#0A101D] border-r border-zinc-200/90 dark:border-white/[0.08] select-none shadow-sm backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-500/25 relative group">
            <span className="drop-shadow-xs font-display">P</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0A101D] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0A101D]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base tracking-tight text-zinc-900 dark:text-white">PulseUp</span>
              <span className="text-[8.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                BHARAT OS
              </span>
            </div>
            <p className="text-[9.5px] font-mono text-zinc-500 dark:text-zinc-400 truncate">National Residency Network</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Resident Identity Card with Duty Status Switcher */}
      <div className="p-2.5 mx-2 my-2 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.06] transition-all hover:border-emerald-500/30 shadow-xs">
        <div
          onClick={() => {
            if (onOpenProfile) onOpenProfile();
            else onSelectScreen('identity');
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {userProfile.initials || 'AS'}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-[#0A101D] ${currentDuty.dot}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-500 transition-colors">
              {userProfile.name}
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
              {userProfile.role}
            </p>
          </div>
          <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0 shadow-xs">
            {userProfile.score || 785}
          </div>
        </div>

        {/* Quick Duty Status Button */}
        {onToggleDutyStatus && (
          <button
            onClick={onToggleDutyStatus}
            className={`mt-2 w-full flex items-center justify-between px-2 py-1 rounded-lg border text-[9.5px] font-mono font-bold transition-all hover:brightness-105 ${currentDuty.badge}`}
            title="Click to toggle Resident Duty Status"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span className={`w-1.5 h-1.5 rounded-full ${currentDuty.dot} animate-pulse flex-shrink-0`} />
              <span className="truncate">{currentDuty.label}</span>
            </span>
            <span className="text-[8.5px] opacity-75 uppercase tracking-wider">Switch ↻</span>
          </button>
        )}
      </div>

      {/* Featured medimind.ai Fullscreen Card */}
      <div className="px-2 pt-0.5 pb-2">
        <button
          onClick={() => {
            onSelectScreen('chatbot');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full group relative overflow-hidden rounded-2xl p-2.5 flex items-center justify-between text-left transition-all duration-300 border backdrop-blur-md ${
            activeScreen === 'chatbot'
              ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-purple-600/30 border-blue-400/60 shadow-[0_0_24px_rgba(59,130,246,0.35)]'
              : 'bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border-blue-500/25 hover:border-blue-400/50 hover:bg-blue-500/15 hover:shadow-[0_0_16px_rgba(59,130,246,0.2)]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles size={15} className="text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-xs text-zinc-900 dark:text-white tracking-tight">medimind.ai</span>
              </div>
              <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-mono truncate">Clinical Copilot • Gemini</p>
            </div>
          </div>
          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 dark:text-blue-300 border border-blue-400/30 flex items-center gap-1 shadow-sm">
            <Maximize2 size={9} /> Full
          </span>
        </button>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-3.5 no-scrollbar">
        {sections.map(sec => (
          <div key={sec}>
            <p className="px-2.5 text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
              <span>{sec}</span>
            </p>
            <div className="space-y-0.5">
              {navItems.filter(item => item.section === sec).map(item => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectScreen(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={15} className={`flex-shrink-0 transition-colors ${isActive ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                        item.badge === 'Live' || item.badge === 'Daily Q'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : isActive
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : 'bg-zinc-200/80 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Pulse Credits Meter */}
      <div
        onClick={() => {
          onOpenCredits();
          if (onCloseMobile) onCloseMobile();
        }}
        className="p-3 border-t border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/80 dark:bg-black/30 hover:bg-zinc-100 dark:hover:bg-white/[0.05] cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between text-[11px] mb-1.5 font-mono">
          <span className="font-bold text-zinc-500 dark:text-zinc-400 uppercase text-[9px] flex items-center gap-1">
            <span>🪙 Pulse Credits Vault</span>
          </span>
          <span className="font-bold text-amber-500">{credits} PC</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full" style={{ width: `${Math.min(100, (credits / 1000) * 100)}%` }} />
        </div>
        <div className="flex items-center justify-between text-[8.5px] font-mono text-zinc-400 dark:text-zinc-400 mt-1">
          <span>Tier 3 Fellowship Unlock</span>
          <span>{((credits / 1000) * 100).toFixed(0)}% (150 in Escrow)</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col h-screen z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Sliding Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-[260px] max-w-[80vw] h-full shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
