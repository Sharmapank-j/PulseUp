import React from 'react';
import { Search, Sun, Moon, Menu, ShieldCheck, Activity } from 'lucide-react';

export default function Topbar({
  title,
  onOpenSearch,
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileMenu,
  dutyStatus = 'on_duty'
}) {
  const dutyLabels = {
    on_duty: { label: 'Ward Duty', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    night_call: { label: 'Night Call', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
    in_ot: { label: 'In OT / Procedures', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    research: { label: 'Research Block', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
    off_call: { label: 'Post-Duty Rest', color: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30' },
  };

  const activeDuty = dutyLabels[dutyStatus] || dutyLabels.on_duty;

  return (
    <header className="h-[52px] sticky top-0 z-15 backdrop-blur-xl bg-white/85 dark:bg-[#070B14]/85 border-b border-zinc-200/90 dark:border-white/[0.08] px-3.5 md:px-6 flex items-center justify-between gap-3 shadow-xs">
      {/* Mobile Menu Hamburger & Viewport Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.07] flex-shrink-0"
          title="Open Navigation"
        >
          <Menu size={17} />
        </button>

        <div className="min-w-0">
          <h1 className="font-display font-black text-xs md:text-sm tracking-tight text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
            {title}
          </h1>
        </div>
      </div>

      {/* Live Hospital Telemetry & Cardiac Rhythm Monitor */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-mono shadow-xs select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <svg className="w-10 h-3.5 text-emerald-500 dark:text-emerald-400" viewBox="0 0 70 20" fill="none">
          <path
            d="M 0 10 L 15 10 L 18 10 L 22 6 L 25 10 L 28 10 L 32 2 L 36 18 L 40 10 L 44 10 L 48 7 L 52 10 L 70 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg"
          />
        </svg>
        <span className="font-bold tracking-tight">72 BPM • Sinus Rhythm</span>
      </div>

      {/* Center Search Bar Trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 px-2.5 md:px-3.5 py-1.5 rounded-xl text-xs bg-zinc-100/90 dark:bg-white/[0.05] border border-zinc-200/90 dark:border-white/[0.08] text-zinc-500 dark:text-[#94A3B8] hover:bg-zinc-200/70 dark:hover:bg-white/[0.09] hover:border-emerald-500/40 transition-all shadow-xs group"
      >
        <Search size={13} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
        <span className="hidden lg:inline font-sans text-xs">Search clinical opps, CRediT, AETCOM…</span>
        <span className="lg:hidden hidden sm:inline font-sans text-xs">Search OS…</span>
        <kbd className="hidden sm:inline text-[9.5px] font-mono font-bold bg-white dark:bg-white/[0.1] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 shadow-xs">
          ⌘K
        </kbd>
      </button>

      {/* Actions: NMC Node, Duty Status, Dark Mode Toggle */}
      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        {/* NMC Node Live Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/[0.08] dark:bg-blue-500/[0.12] border border-blue-500/25 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold">
          <ShieldCheck size={12} className="text-blue-500" />
          <span>NMC-NODE</span>
          <span className="w-1 h-1 rounded-full bg-blue-500"></span>
          <span className="text-[9px] opacity-75">MAMC</span>
        </div>

        {/* Resident Duty Shift Badge */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold ${activeDuty.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span>{activeDuty.label}</span>
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Daytime Clinical White-Coat View' : 'Switch to Dark ICU Ward View'}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.08] border border-zinc-200/90 dark:border-white/[0.08] transition-all shadow-xs hover:border-emerald-500/40"
        >
          {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-600" />}
        </button>
      </div>
    </header>
  );
}
