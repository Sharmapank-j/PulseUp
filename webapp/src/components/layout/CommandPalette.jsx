import React, { useState, useEffect } from 'react';
import {
  Search,
  LayoutDashboard,
  FlaskConical,
  Target,
  Stethoscope,
  MessageSquare,
  PartyPopper,
  Compass,
  CreditCard,
  ExternalLink,
  X
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onSelectScreen }) {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dashboard', title: 'Daily Career Board', sub: 'Overview, career score, sprint milestones & radar', icon: LayoutDashboard, category: 'Screens' },
    { id: 'research', title: 'Research & Publishing Hub', sub: 'CRediT authorship matrix, bounties, journal risk shield', icon: FlaskConical, category: 'Screens' },
    { id: 'goalspaces', title: 'Goal Spaces Workbench', sub: 'Kanban sprints, team discussion, AI copilot, file vault', icon: Target, category: 'Screens' },
    { id: 'aetcom', title: 'AETCOM Bioethics Hub', sub: 'NMC CBME module logbook, SPIKES bedside simulator', icon: Stethoscope, category: 'Screens' },
    { id: 'mentorship', title: 'Async Mentorship Triage', sub: 'SBAR ticket queue, voice memos, verified consultant directory', icon: MessageSquare, category: 'Screens' },
    { id: 'campus', title: 'Campus Pulse & Med-Q', sub: 'National clinical quiz arena, medical fests & competitions', icon: PartyPopper, category: 'Screens' },
    { id: 'opportunities', title: 'Bharat Opportunities Engine', sub: 'Central JR posts, ICMR grants, TMC observerships, rural bond', icon: Compass, category: 'Screens' },
    { id: 'identity', title: 'Verified Medical Passport', sub: 'NMC/ABDM credentials, procedure logbook, printable ERAS CV', icon: CreditCard, category: 'Screens' },
  ];

  const filtered = query.trim()
    ? commands.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.sub.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animation-fadeIn"
    >
      <div className="w-full max-w-xl bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.14] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-white/[0.07] bg-zinc-50/50 dark:bg-white/[0.02]">
          <Search size={18} className="text-zinc-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search clinical workstations, opportunities, journals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-sans"
          />
          <kbd className="text-[10px] font-mono bg-zinc-200 dark:bg-white/[0.1] px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Clinical Workstations
          </p>
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400">
              No matching clinical items found for "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectScreen(item.id);
                    onClose(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-zinc-100 dark:hover:bg-white/[0.07] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:text-emerald group-hover:bg-emerald/10 transition-colors">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] truncate">
                      {item.sub}
                    </p>
                  </div>
                  <ExternalLink size={13} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
