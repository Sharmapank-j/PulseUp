import { useMemo, useState, type ReactNode } from 'react'
import { BookmarkPlus, BookmarkCheck, ExternalLink, Calendar, Search } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { Card, SectionTitle, KindChip, ScorePill, EmptyState, VerifiedBadge } from '../components/ui'
import { OPPORTUNITIES, OPPORTUNITY_KINDS } from '../data/opportunities'
import { scoreOpportunity } from '../lib/agent'
import type { Opportunity, OpportunityKind } from '../types'

export default function Radar() {
  const { state, toggleSyncOpp, isSynced } = usePulse()
  const [kind, setKind] = useState<(typeof OPPORTUNITY_KINDS)[number]>('all')
  const [query, setQuery] = useState('')
  const [onlyZeroFee, setOnlyZeroFee] = useState(false)
  const [sort, setSort] = useState<'pulse' | 'alpha'>('pulse')

  const results = useMemo(() => {
    let opps = OPPORTUNITIES
    if (kind !== 'all') opps = opps.filter((o) => o.kind === (kind as OpportunityKind))
    if (onlyZeroFee) opps = opps.filter((o) => o.cost.toLowerCase().includes('free'))
    if (query.trim()) {
      const q = query.toLowerCase()
      opps = opps.filter((o) =>
        `${o.title} ${o.org} ${o.tags.join(' ')} ${o.region}`.toLowerCase().includes(q),
      )
    }
    const scored = opps
      .map((o) => ({ ...o, liveScore: scoreOpportunity(o, state.plan) }))
      .sort((a, b) => (sort === 'pulse' ? b.liveScore - a.liveScore : a.title.localeCompare(b.title)))
    return scored
  }, [kind, onlyZeroFee, query, sort, state.plan])

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Bharat Opportunity Radar"
          subtitle='one catalog of the Indian medical oppo ecosystem, re-ranked by PulseAI against your active plan'
        />
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="input pl-9"
              placeholder="Search title, org, tag, city…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="chip cursor-pointer select-none border border-pulse-500/40 bg-pulse-500/5 px-3 py-1.5 text-pulse-600 dark:text-pulse-300">
              <input
                type="checkbox"
                className="mr-1.5 accent-pulse-500"
                checked={onlyZeroFee}
                onChange={(e) => setOnlyZeroFee(e.target.checked)}
              />
              zero-fee only
            </label>
            <select className="input w-32 py-1.5" value={sort} onChange={(e) => setSort(e.target.value as 'pulse' | 'alpha')}>
              <option value="pulse">Pulse score</option>
              <option value="alpha">A → Z</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {OPPORTUNITY_KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`chip uppercase transition ${
                kind === k
                  ? 'bg-pulse-500 text-[#0B101B]'
                  : 'bg-zinc-200/60 text-zinc-600 hover:bg-zinc-300/70 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </Card>

      {results.length === 0 ? (
        <EmptyState title="No opportunities match" hint="Loosen a filter or clear the search." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((o) => (
            <OppCard key={o.id} opp={o} synced={isSynced(o.id)} onSync={() => toggleSyncOpp(o)} />
          ))}
        </div>
      )}
    </div>
  )
}

function OppCard({
  opp,
  synced,
  onSync,
}: {
  opp: Opportunity & { liveScore: number }
  synced: boolean
  onSync: () => void
}) {
  return (
    <Card hover className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <KindChip kind={opp.kind} />
        <div className="flex items-center gap-1.5">
          <VerifiedBadge verified={opp.verified} />
          <ScorePill score={opp.liveScore} />
        </div>
      </div>
      <h3 className="mt-2 font-display font-bold leading-snug">{opp.title}</h3>
      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{opp.org}</div>

      <dl className="mt-3 space-y-1.5 text-xs">
        <Row icon={<Calendar size={12} />} k="Window" v={opp.dates} />
        <Row k="Cost" v={opp.cost} />
        <Row k="Eligibility" v={opp.eligibility} />
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {opp.perks.slice(0, 2).map((p) => (
          <span key={p} className="chip bg-zinc-200/60 dark:bg-white/5 dark:text-zinc-300">
            {p}
          </span>
        ))}
      </div>
      {opp.statusNote && (
        <p className="mt-2 text-[11px] italic leading-relaxed text-zinc-400">{opp.statusNote}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <button
          onClick={onSync}
          className={`btn text-xs ${
            synced
              ? 'bg-pulse-500/15 text-pulse-600 dark:text-pulse-300'
              : 'btn-primary'
          }`}
        >
          {synced ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
          {synced ? 'In plan' : 'Sync to plan'}
        </button>
        {opp.url && (
          <a
            href={opp.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 transition hover:text-pulse-500 dark:text-zinc-400"
          >
            source <ExternalLink size={12} />
          </a>
        )}
      </div>
    </Card>
  )
}

function Row({ icon, k, v }: { icon?: ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="flex shrink-0 items-center gap-1.5 font-semibold uppercase tracking-wide text-zinc-400" style={{ fontSize: 10 }}>
        {icon}
        {k}
      </dt>
      <dd className="truncate text-right text-zinc-600 dark:text-zinc-300">{v}</dd>
    </div>
  )
}
