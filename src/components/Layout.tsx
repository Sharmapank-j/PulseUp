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
    <div className="relative mx-auto flex min-h-screen max-w-[1500px]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-pulse-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-accent-purple/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-blue/5 blur-3xl" />
        <div className="absolute top-20 right-1/4 h-40 w-40 rounded-full bg-pulse-400/5 blur-2xl animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-20 left-1/4 h-32 w-32 rounded-full bg-accent-amber/5 blur-2xl animate-[float_8s_ease-in-out_infinite-reverse]" />
      </div>

      {/* Sidebar */}        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/5 px-4 py-6 dark:border-white/10 glass-inset glass-inset-dark md:flex">
        <div className="flex items-center gap-2 px-2">
          {/* logo */}
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pulse-400 via-pulse-500 to-pulse-600 font-display text-lg font-extrabold text-[#0B101B] shadow-3d-sm animate-[edge-glow_2s_ease-in-out_infinite]">
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
              className={(attrs) => {
                const { isActive } = attrs
                return (
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300 shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-ice'
                  }`
                )
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-x-0.5" size={18} />
                  <span className="relative z-10">{label}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-pulse-500 rounded-full shadow-glow-sm" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Credit HUD */}
        <div className="card-clay card-clay-dark card-clay-hover p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Pulse Credits
            </span>
            <Activity size={14} className="text-pulse-500" />
          </div>
          <div className="mt-1 font-mono text-2xl font-bold bg-gradient-to-r from-pulse-400 to-pulse-600 bg-clip-text text-transparent">{state.credits}</div>
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

        <div className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-pulse-500/5 border border-pulse-500/10 px-2 py-1.5 text-[10px] font-semibold text-pulse-600 dark:text-pulse-300 dark:border-pulse-500/20">
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
        <header className="sticky top-0 z-10 hidden items-center justify-between border-b border-white/10 bg-zinc-50/80 px-8 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0B101B]/80 md:flex">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Trophy size={16} className="text-pulse-500" />
            Score {state.pulseScore} · {state.syncedOppIds.length} synced opportunities ·{' '}
            {state.sessions.length} mentor sessions
          </div>
          <div className="flex items-center gap-2">
            <span className="chip chip-glass chip-glass-dark bg-pulse-500/10 text-pulse-600 dark:text-pulse-300">
              PulseAI engine on
            </span>
            <span className="chip chip-glass chip-glass-dark bg-zinc-200/60 dark:bg-white/10">Zero PHI</span>
            <span className="chip chip-glass chip-glass-dark bg-zinc-200/60 dark:bg-white/10">100% free</span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>

        <footer className="relative px-4 pb-6 pt-2 text-center text-[11px] text-zinc-400 md:px-8">
          <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
            <div className="mx-auto h-40 w-40 -translate-y-1/2 rounded-full bg-pulse-500/5 blur-3xl" />
          </div>
          <div className="flex items-center justify-center gap-2 relative">
            <span className="h-1 w-1 rounded-full bg-pulse-500 animate-pulse" />
            <span className="tracking-wide opacity-60">PulseUp Cloud</span>
            <span className="opacity-40">·</span>
            <span className="opacity-50">deterministic PulseAI v1</span>
            <span className="opacity-40">·</span>
            <span className="opacity-50">auditable credit ledger</span>
            <span className="opacity-40">·</span>
            <span className="opacity-50">zero-PHI data policy</span>
            <span className="opacity-40">·</span>
            <span className="opacity-40">demo data modeled on the public Indian opportunity ecosystem</span>
          </div>
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
