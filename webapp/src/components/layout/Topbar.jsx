import React from 'react';
import { Search, Sun, Moon, Radio, ShieldCheck, Menu, Bot, Sparkles } from 'lucide-react';

export default function Topbar({
  title,
  onOpenSearch,
  isDarkMode,
  onToggleDarkMode,
  isRedShift,
  onToggleRedShift,
  onShowNmcStatus,
  onToggleMobileMenu,
  onSelectScreen
}) {
  return (
    <header className="h-[52px] sticky top-0 z-15 backdrop-blur-md bg-white/90 dark:bg-[#0B101B]/90 border-b border-zinc-200 dark:border-white/[0.07] px-4 md:px-6 flex items-center justify-between gap-3">
      {/* Mobile Menu Hamburger */}
      <button
        onClick={onToggleMobileMenu}
        className="md:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.07] flex-shrink-0"
        title="Open Navigation"
      >
        <Menu size={17} />
      </button>

      {/* Title */}
      <h1 className="font-display font-bold text-xs md:text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex-1 truncate">
        {title}
      </h1>

      {/* medimind.ai Quick Toggle in Topbar */}
      {onSelectScreen && (
        <button
          onClick={() => onSelectScreen('chatbot')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-md bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 border border-blue-400/40 text-blue-600 dark:text-blue-300 hover:from-blue-600/30 hover:to-purple-600/30 transition-all shadow-sm hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] flex-shrink-0"
          title="Open medimind.ai Fullscreen Copilot"
        >
          <Sparkles size={13} className="text-amber-400 animate-pulse" />
          <span className="font-display font-black tracking-tight">medimind.ai</span>
          <span className="hidden sm:inline text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30">
            Full
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
        </button>
      )}

      {/* Search Bar Trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.07] text-zinc-500 dark:text-[#94A3B8] hover:bg-zinc-200/70 dark:hover:bg-white/[0.09] transition-all"
      >
        <Search size={14} />
        <span className="hidden lg:inline">Search opportunities, spaces, journals...</span>
        <span className="lg:hidden hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline text-[10px] font-mono bg-zinc-200 dark:bg-white/[0.1] px-1.5 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
          ⌘K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
        {/* Red-Shift Mode Toggle */}
        <button
          onClick={onToggleRedShift}
          title="Toggle Night Call / Red-Shift Mode"
          className={`flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
            isRedShift
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
              : 'bg-zinc-100 dark:bg-white/[0.05] border-zinc-200 dark:border-white/[0.07] text-zinc-600 dark:text-zinc-400 hover:text-rose-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="hidden sm:inline">Night Call</span>
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
          className="flex items-center gap-1.5 px-2 md:px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden md:inline">NMC Node Live</span>
          <span className="md:hidden">Live</span>
        </button>
      </div>
    </header>
  );
}
