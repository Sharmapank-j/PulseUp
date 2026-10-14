import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Radar as RadarIcon,
  Compass,
  FlaskConical,
  Users,
  Trophy,
  Activity,
  Zap,
  Bot,
  IdCard,
} from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { EcgLine } from './PulseRing'
import { ThemeSwitch } from './ThemeSwitch'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/radar', label: 'Opportunity Radar', icon: RadarIcon },
  { to: '/plan', label: 'Career Navigator', icon: Compass },
  { to: '/research', label: 'Research Hub', icon: FlaskConical },
  { to: '/mentors', label: 'Mentorship', icon: Users },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/nmr', label: 'NMR Readiness', icon: IdCard },
  { to: '/credits', label: 'Pulse Credits', icon: Zap },
]

export default function Layout() {
  const { state, toast } = usePulse()

  return (
    <div className="mx-auto flex min-h-screen max-w-[1500px]">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200 px-4 py-6 dark:border-white/10 md:flex">
        <div className="flex items-center gap-2 px-2">
          {/* logo */}
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-pulse-500 font-display text-lg font-extrabold text-[#0B101B] shadow-glow-sm">
            P
          </div>
          <div>
            <div className="font-display font-extrabold tracking-tight">PulseUp</div>
            <div className="-mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-pulse-500">
              Cloud · Career OS
            </div>
          </div>
        </div>

        <EcgLine className="my-4 text-pulse-500/60" />

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-ice'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Credit HUD */}
        <div className="card mt-4 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Pulse Credits
            </span>
            <Activity size={14} className="text-pulse-500" />
          </div>
          <div className="mt-1 font-mono text-2xl font-bold text-pulse-500">{state.credits}</div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            earn by contributing · spend on mentorship
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Theme
          </div>
          <ThemeSwitch />
        </div>

        <div className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-zinc-200/50 px-2 py-1.5 text-[10px] font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
          100% free · no paywall · zero PHI
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 dark:border-white/10 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-pulse-500 font-bold text-[#0B101B]">
                P
              </div>
              <span className="font-display font-bold">PulseUp</span>
            </div>
            <span className="font-mono text-sm font-bold text-pulse-500">{state.credits} cr</span>
          </div>
          <ThemeSwitch compact />
        </header>

        {/* Desktop top bar */}
        <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-8 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0B101B]/80 md:flex">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Trophy size={16} className="text-pulse-500" />
            Score {state.pulseScore} · {state.syncedOppIds.length} synced opportunities ·{' '}
            {state.sessions.length} mentor sessions
          </div>
          <div className="flex items-center gap-2">
            <span className="chip bg-pulse-500/10 text-pulse-600 dark:text-pulse-300">
              PulseAI engine on
            </span>
            <span className="chip bg-zinc-200/60 dark:bg-white/10">Zero PHI</span>
            <span className="chip bg-zinc-200/60 dark:bg-white/10">100% free</span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>

        <footer className="px-4 pb-6 pt-2 text-center text-[11px] text-zinc-400 md:px-8">
          PulseUp Cloud — deterministic PulseAI v1 · auditable credit ledger · zero-PHI data policy ·
          demo data modeled on the public Indian opportunity ecosystem
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-up">
          <div className="card flex items-center gap-2 px-4 py-2.5 shadow-glow">
            <span className="h-2 w-2 rounded-full bg-pulse-500" />
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}
