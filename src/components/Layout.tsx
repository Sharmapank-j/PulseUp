import React, { useState, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Search, Compass, FlaskConical, Users, CreditCard, FileText,
  BarChart3, Radio, Brain, BookOpen, Award, Calendar, Zap,
} from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'
import { PulseRing } from './PulseRing'
import { ThemeSwitch } from './ThemeSwitch'
import { usePulse } from '../store/PulseStore'
import type { themeMode } from '../store/PulseStore'

export default function Layout() {
  const navigate = useNavigate()
  const { theme, setTheme, credits, pulseScore, latestEvents } = usePulse()
  const [showSecrets, setShowSecrets] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const pages = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/radar', label: 'Opportunity Radar', icon: Search },
    { to: '/plan', label: 'Career Navigator', icon: Compass },
    { to: '/research', label: 'Research Hub', icon: FlaskConical },
    { to: '/mentors', label: 'Mentorship', icon: Users },
    { to: '/credits', label: 'Pulse Credits', icon: CreditCard },
    { to: '/nmr', label: 'NMR Readiness', icon: FileText },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#0B101B] text-zinc-900 dark:text-[#F1F5F9]">
      {/* Ambient gradient mesh background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 opacity-40 dark:opacity-30">
          <div className="absolute top-[-10%] left-[-5%] h-[40%] w-[40%] rounded-full bg-gradient-to-br from-pulse-500/10 via-purple-500/5 to-transparent blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] h-[50%] w-[50%] rounded-full bg-gradient-to-tl from-emerald-400/8 via-sky-500/5 to-transparent blur-3xl" />
          <div className="absolute top-[40%] right-[10%] h-[30%] w-[30%] rounded-full bg-gradient-to-br from-amber-400/6 via-rose-500/4 to-transparent blur-3xl" />
        </div>
      </div>

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between border-b border-zinc-200/60 bg-white/70 px-4 backdrop-blur-md dark:border-white/5 dark:bg-[#151D2D]/80 md:px-6">
        <div className="flex items-center gap-3">
          <button
            aria-label="Menu"
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse-500 text-[#0B101B] font-bold text-sm shadow-sm">
              P
            </div>
            <span className="text-sm font-semibold tracking-tight">PulseUp</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitch compact />
          <div className="hidden items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500 md:flex dark:bg-white/[0.06] dark:text-zinc-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <CreditCard size={11} className="text-pulse-500" />
            <span>{crCreditsDisplay}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside
          className="relative z-10 hidden h-[calc(100vh-52px)] w-56 flex-col border-r border-zinc-200/50 bg-white/40 backdrop-blur-sm pl-3 pr-2 dark:border-white/5 dark:bg-[#0B101B]/70 md:flex"
          aria-label="Main navigation"
        >
          {/* Glass inset panel */}
          <div className="absolute inset-0 rounded-r-2xl border border-white/10 bg-white/[0.18] p-3 backdrop-blur-xl dark:bg-white/[0.03] dark:border-white/5" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25), inset 0 0 30px rgba(16,185,129,0.05)' }}>
            <nav className="flex flex-col gap-0.5">
              {pages.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300'
                        : 'text-zinc-500 transition-colors hover:bg-white/50 hover:text-zinc-700 dark:hover:bg-white/[0.05] dark:hover:text-ice'
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5" size={18} />
                  {label}
                  {isActive && (
                    <span className="pointer-events-none absolute -right-0.5 top-1/2 h-5 w-0.5 bg-pulse-500 rounded-full shadow-sm" />
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto rounded-xl bg-gradient-to-b from-pulse-500/10 to-transparent p-3 text-center shadow-inner">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Career Score</div>
              <PulseRing value={pulseScore} />
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="relative z-20 h-full w-60 flex flex-col bg-white/90 backdrop-blur-xl shadow-2xl dark:bg-[#151D2D)/90 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-zinc-200/50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse-500 text-[#0B101B] font-bold text-sm shadow-sm">
                  P
                </div>
                <span className="text-sm font-semibold">PulseUp</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 p-3">
              {pages.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300'
                        : 'text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-white/5 dark:hover:text-ice'
                    }`
                  }
                >
                  <Icon className="h-4.5 w-4.5" size={18} />
                  {label}
                  {isActive && (
                    <span className="pointer-events-none absolute -right-0.5 top-1/2 h-5 w-0.5 bg-pulse-500 rounded-full shadow-sm" />
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto border-t border-zinc-200/50 p-3">
              <div className="overflow-hidden rounded-xl bg-gradient-to-b from-pulse-500/10 to-transparent p-3 text-center shadow-inner">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Career Score</div>
                <PulseRing value={pulseScore} />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="relative z-10 flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-4 pb-8 md:px-8">
            <div id="page-content">{/* pages render here */}</div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200/50 bg-white/50 py-3 text-center text-[11px] text-zinc-400 backdrop-blur-md dark:border-white/5 dark:bg-[#0B101B]/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 md:px-8">
          <span>PulseUp Cloud — deterministic PulseAI v1 · auditable credit ledger · zero-PHI data policy · demo data modeled on the public Indian opportunity ecosystem</span>
          <span className="whitespace-nowrap font-mono text-pulse-500">v0.0.0 · build {BUILD_VERSION}</span>
        </div>
      </footer>
    </div>
  )
}
