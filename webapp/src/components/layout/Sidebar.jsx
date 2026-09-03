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
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeScreen, onSelectScreen, credits = 340, onOpenCredits }) {
  const navItems = [
    { id: 'dashboard', label: 'Career Board', icon: LayoutDashboard, badge: null, section: 'Workspace' },
    { id: 'research', label: 'Research Hub', icon: FlaskConical, badge: '2', section: 'Clinical' },
    { id: 'goalspaces', label: 'Goal Spaces', icon: Target, badge: null, section: 'Clinical' },
    { id: 'aetcom', label: 'AETCOM Ethics', icon: Stethoscope, badge: '22/27', section: 'Clinical' },
    { id: 'mentorship', label: 'Mentorship', icon: MessageSquare, badge: '1', section: 'Clinical' },
    { id: 'campus', label: 'Campus & Med-Q', icon: PartyPopper, badge: 'Live', section: 'India' },
    { id: 'opportunities', label: 'Bharat Opps', icon: Compass, badge: '68', section: 'India' },
    { id: 'identity', label: 'Medical Passport', icon: CreditCard, badge: 'Tier 2', section: 'Credential' },
  ];

  const sections = ['Workspace', 'Clinical', 'India', 'Credential'];

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white dark:bg-[#1C2541] border-r border-zinc-200 dark:border-white/[0.07] flex flex-col h-screen z-20 select-none">
      {/* Logo Header */}
      <div className="p-4 flex items-center gap-2.5 border-b border-zinc-200 dark:border-white/[0.07]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald to-[#34D399] flex items-center justify-center font-extrabold text-navy-950 text-base shadow-sm">
          P
        </div>
        <div>
          <span className="font-display font-extrabold text-base tracking-tight text-zinc-900 dark:text-white">PulseUp</span>
          <span className="ml-1.5 text-[9px] font-bold text-emerald bg-emerald/10 px-1.5 py-0.5 rounded">BHARAT OS</span>
        </div>
      </div>

      {/* User Chip */}
      <div
        onClick={() => onSelectScreen('identity')}
        className="p-3 mx-2 my-2 rounded-xl flex items-center gap-2.5 hover:bg-zinc-100 dark:hover:bg-white/[0.04] cursor-pointer transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-white/[0.05]"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald/40">
          AS
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">Dr. Aarav Sharma</p>
          <p className="text-[10px] text-zinc-500 dark:text-[#94A3B8] truncate">JR-2 Resident · MAMC</p>
        </div>
        <div className="text-[10.5px] font-mono font-bold text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded-full">
          785
        </div>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {sections.map(sec => (
          <div key={sec}>
            <p className="px-2 text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 dark:text-[#475569] mb-1">
              {sec}
            </p>
            <div className="space-y-0.5">
              {navItems.filter(item => item.section === sec).map(item => {
                const Icon = item.icon;
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectScreen(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald/10 text-emerald dark:bg-emerald/15 dark:text-emerald font-semibold border-l-2 border-emerald'
                        : 'text-zinc-600 dark:text-[#94A3B8] hover:bg-zinc-100 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.badge === 'Live'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-700 dark:text-zinc-300'
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
        onClick={onOpenCredits}
        className="p-3 border-t border-zinc-200 dark:border-white/[0.07] bg-zinc-50 dark:bg-black/20 hover:bg-zinc-100 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-semibold text-zinc-500 dark:text-[#475569] uppercase text-[9.5px]">Pulse Credits</span>
          <span className="font-mono font-bold text-amber-500">{credits} PC</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald to-[#34D399] rounded-full" style={{ width: `${Math.min(100, (credits / 1000) * 100)}%` }} />
        </div>
      </div>
    </aside>
  );
}
