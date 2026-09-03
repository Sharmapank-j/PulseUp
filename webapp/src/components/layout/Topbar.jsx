import React from 'react';
import { Search, Sun, Moon, Radio, ShieldCheck } from 'lucide-react';

export default function Topbar({
  title,
  onOpenSearch,
  isDarkMode,
  onToggleDarkMode,
  isRedShift,
  onToggleRedShift,
  onShowNmcStatus
}) {
  return (
    <header className="h-[52px] sticky top-0 z-15 backdrop-blur-md bg-white/90 dark:bg-[#0B101B]/90 border-b border-zinc-200 dark:border-white/[0.07] px-6 flex items-center justify-between gap-4">
      {/* Title */}
      <h1 className="font-display font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex-1 truncate">
        {title}
      </h1>

      {/* Search Bar Trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.07] text-zinc-500 dark:text-[#94A3B8] hover:bg-zinc-200/70 dark:hover:bg-white/[0.09] transition-all"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Search opportunities, spaces, journals...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="text-[10px] font-mono bg-zinc-200 dark:bg-white/[0.1] px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
          ⌘K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Red-Shift Mode Toggle */}
        <button
          onClick={onToggleRedShift}
          title="Toggle Night Call / Red-Shift Mode"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            isRedShift
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              : 'bg-zinc-100 dark:bg-white/[0.05] border-zinc-200 dark:border-white/[0.07] text-zinc-600 dark:text-zinc-400 hover:text-rose-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="hidden md:inline">Night Call</span>
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title="Toggle Light / Dark Mode"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.07] transition-colors"
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* NMC National Node Status */}
        <button
          onClick={onShowNmcStatus}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden lg:inline">NMC Node Live</span>
          <span className="lg:hidden">Live</span>
        </button>
      </div>
    </header>
  );
}
