import React from 'react';
import { Search, Sun, Moon, Menu } from 'lucide-react';

export default function Topbar({
  title,
  onOpenSearch,
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileMenu
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
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.07] transition-colors"
        >
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
