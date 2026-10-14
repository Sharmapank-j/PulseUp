import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Radio, Clock, MapPin, Tag, Zap, X, Eye, ArrowRight, ExternalLink } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { OPPORTUNITIES, searchOpportunities, filterByKind, filterZeroFee, sortByScore } from '../data/opportunities'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui'

export default function Radar() {
  const navigate = useNavigate()
  const { plan, syncedOpportunities } = usePulse()
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const [onlyZeroFee, setOnlyZeroFee] = useState(false)

  const q = query.trim()
  const filtered = useMemo(() => {
    let list = q ? searchOpportunities(q) : OPPORTUNITIES
    list = filterByKind(list, kind)
    list = filterZeroFee(list, onlyZeroFee)
    return sortByScore(list)
  }, [q, kind, onlyZeroFee])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-ice">
          Opportunity Radar
        </h1>
        <button
          onClick={() => navigate('/plan')}
          className="rounded-xl bg-pulse-500 px-3 py-1.5 text-sm font-semibold text-[#0B101B] shadow-3d-sm hover:shadow-3d-hover transition-shadow"
        >
          Sync to plan
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'research', 'observership', 'conference', 'workshop', 'grant'].map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                kind === k
                  ? 'bg-pulse-500 text-[#0B101B] shadow-3d-sm'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10'
              }`}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Zero fee toggle */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={onlyZeroFee}
          onChange={(e) => setOnlyZeroFee(e.target.checked)}
          className="accent-pulse-500"
        />
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Zero-fee only
        </span>
      </label>

      {/* Opportunity cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-400">
            No opportunities match your filters.
          </div>
        ) : (
          filtered.map((opp) => (
            <Card key={opp.id} hover className="group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription className="!mb-0">{opp.kind}</CardDescription>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      opp.cost.toLowerCase().includes('free')
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                    }`}
                  >
                    {opp.cost}
                  </span>
                </div>
              </CardHeader>
              <CardTitle className="text-base">{opp.title}</CardTitle>
              <CardDescription className="mt-0.5">{opp.org}</CardDescription>
              <CardContent>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
                  <MapPin size={12} />
                  <span>{opp.location}</span>
                  <span className="mx-1.5">·</span>
                  <Clock size={12} />
                  <span>{opp.dates}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {opp.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-white/5 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-200/50 dark:border-white/5 pt-3">
                  <div className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                    <Radio size={12} className="text-pulse-500" />
                    <span>Score: {opp.pulseScore}</span>
                  </div>
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 transition-colors hover:bg-pulse-500 hover:text-[#0B101B] dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-pulse-500 dark:hover:text-[#0B101B]"
                  >
                    View details
                    <ExternalLink size={10} />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
