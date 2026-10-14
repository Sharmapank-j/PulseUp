import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Zap, Users, FlaskConical, ArrowRight, Compass } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { PulseRing } from '../components/PulseRing'
import { Card, SectionTitle, Stat, timeAgo } from '../components/ui'
import { OPPORTUNITIES } from '../data/opportunities'
import { scoreOpportunity, matchMentors } from '../lib/agent'

export default function Dashboard() {
  const { state, rankOpps, isSynced } = usePulse()

  const topOpps = useMemo(
    () => rankOpps(OPPORTUNITIES).slice(0, 3),
    [rankOpps],
  )
  const topMentors = useMemo(() => matchMentors(state.plan).slice(0, 2), [state.plan])
  const doneMilestones = useMemo(
    () => state.plan?.milestones.filter((m) => m.detail.startsWith('[done]')).length ?? 0,
    [state.plan],
  )
  const totalCreditsEarned = useMemo(
    () =>
      state.events
        .filter((e) => (e.creditDelta ?? 0) > 0)
        .reduce((acc, e) => acc + (e.creditDelta ?? 0), 0) + 120,
    [state.events],
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card glass className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pulse-500/20 via-transparent to-transparent" />
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-pulse-400/20 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-accent-purple/15 blur-2xl" />
        <div className="absolute inset-0 glass-shine" />
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="md:max-w-xl">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pulse-500/20 to-emerald-500/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-pulse-600 dark:text-pulse-300 border border-pulse-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-block h-full w-full animate-ping rounded-full bg-pulse-400 opacity-75" />
                  <span className="relative inline-block h-2 w-2 rounded-full bg-pulse-500" />
                </span>
                PulseUp Clinical OS
              </span>
              <span className="chip chip-glass chip-glass-dark bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                100% free to use
              </span>
              <span className="chip chip-glass chip-glass-dark bg-blue-500/10 text-blue-600 dark:text-blue-300">
                real Indian med-field data
              </span>
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl gradient-text">
              Good to see you, future specialist.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {state.plan
                ? `Your ${state.plan.horizonMonths}-month ${state.plan.specialty} plan is active — ${doneMilestones}/${state.plan.milestones.length} milestones complete.`
                : 'No career plan yet. Run the Career Navigator to generate a 6–12 month plan with milestones, skill gaps, and mentor routing.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!state.plan && (
                <Link to="/plan" className="btn-primary">
                  <Compass size={16} /> Generate my plan <ArrowRight size={14} />
                </Link>
              )}
              <Link to={state.plan ? '/radar' : '/plan'} className="btn-ghost">
                {state.plan ? 'Open Opportunity Radar' : 'How PulseAI works'}
              </Link>
            </div>
          </div>
          <div className="relative shrink-0">
            <PulseRing value={state.pulseScore} />
            <div className="absolute -bottom-1 left-1/2 mt-2 flex -translate-x-1/2 items-center gap-1">
              <Trophy size={13} className="text-amber-500" />
              <span className="font-mono text-xs text-amber-500">
                top {100 - state.pulseScore}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total credits earned" value={totalCreditsEarned} sub="120 starting grant included" glass />
        <Stat
          label="Opportunities cataloged"
          value={OPPORTUNITIES.length}
          sub="licensed Indian ecosystem sources"
          accent="blue"
          glass
        />
        <Stat
          label="Sprint delivery completion"
          value={state.plan ? `${Math.round((doneMilestones / state.plan.milestones.length) * 100)}%` : '—'}
          sub={state.plan ? 'plan milestones' : 'no active plan'}
          accent="purple"
          glass
        />
        <Stat
          label="Mentorship standing"
          value={state.sessions.filter((s) => s.status === 'responded').length}
          sub={`of ${state.sessions.length} SBAR tickets answered`}
          accent="amber"
          glass
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top opportunities */}
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Top-ranked opportunities this week"
            subtitle="routed through your active plan by the Opportunity Scout"
            right={
              <Link to="/radar" className="btn-ghost text-xs">
                Full radar <ArrowRight size={13} />
              </Link>
            }
          />
          <ul className="space-y-3">
            {topOpps.map((opp) => {
              const score = scoreOpportunity(opp, state.plan)
              return (
                <li
                  key={opp.id}
                  className="card card-hover glass-inset flex items-start justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold leading-snug">{opp.title}</div>
                    <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {opp.org} · {opp.region} · {opp.dates}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="chip font-mono bg-pulse-500/10 text-pulse-600 dark:text-pulse-300">
                      {score}
                    </span>
                    {isSynced(opp.id) && (
                      <span className="chip bg-pulse-500/10 text-pulse-600 dark:text-pulse-300">
                        synced
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        {/* Suggested mentors */}
        <Card glass>
          <SectionTitle
            title="Mentor match suggestions"
            subtitle={'scored ' + (state.plan ? 'against your plan' : 'on ratings alone')}
            accent
          />
          <ul className="space-y-3">
            {topMentors.map((m) => (
              <li key={m.mentor.id} className="card glass-inset p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-bold">{m.mentor.name}</div>
                  <span className="font-mono text-xs text-pulse-500">{m.matchScore}%</span>
                </div>
                <div className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {m.mentor.institution}
                </div>
                <div className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                  {m.reason}
                </div>
              </li>
            ))}
          </ul>
          <Link to="/mentors" className="btn-ghost mt-3 w-full justify-center text-xs">
            <Users size={14} /> Open SBAR ticket console
          </Link>
        </Card>
      </div>

      {/* Activity ledger */}
      <Card glass>
        <SectionTitle
          title="Auditable activity ledger"
          subtitle="every credit movement and agent action, newest first"
          right={
            <Link to="/credits" className="btn-glass btn-glass-dark text-xs">
              <Zap size={13} /> Credits detail
            </Link>
          }
        />
        {state.events.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <FlaskConical size={16} className="text-pulse-500" />
            No entries yet — generate a plan or sync an opportunity to start your audit trail.
          </div>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {state.events.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              >
                <span className="truncate">{e.text}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-zinc-400">
                  {e.creditDelta ? (
                    <span
                      className={`font-mono ${e.creditDelta > 0 ? 'text-pulse-500' : 'text-rose-500'}`}
                    >
                      {e.creditDelta > 0 ? `+${e.creditDelta}` : e.creditDelta} cr
                    </span>
                  ) : null}
                  {timeAgo(e.ts)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
