import type { ReactNode } from 'react'
import { ShieldCheck, TriangleAlert } from 'lucide-react'
import type { Opportunity } from '../types'

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return <div className={`card ${hover ? 'card-hover' : ''} p-5 ${className}`}>{children}</div>
}

export function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  )
}

const KIND_STYLES: Record<string, string> = {
  research: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  event: 'bg-purple-500/10 text-purple-600 dark:text-purple-300',
  certification: 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300',
  observership: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  grant: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  quiz: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
  exam: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
  webinar: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
}

export function KindChip({ kind }: { kind: Opportunity['kind'] }) {
  return <span className={`chip ${KIND_STYLES[kind]} uppercase`}>{kind}</span>
}

export function VerifiedBadge({ verified }: { verified?: 'official' | 'provisional' }) {
  if (!verified) return null
  return verified === 'official' ? (
    <span className="chip bg-pulse-500/10 text-pulse-600 dark:text-pulse-300" title="Facts read from the official source page">
      <ShieldCheck size={11} /> official source
    </span>
  ) : (
    <span className="chip bg-amber-500/10 text-amber-600 dark:text-amber-300" title="From indexed listings or recent posts — confirm at the source">
      <TriangleAlert size={11} /> confirm first
    </span>
  )
}

export function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 85
      ? 'text-pulse-500 border-pulse-500/40'
      : score >= 70
        ? 'text-amber-500 border-amber-500/40'
        : 'text-zinc-500 border-zinc-400/30'
  return (
    <span className={`chip border bg-transparent font-mono ${tone}`} title="PulseUp relevance score">
      {score}
      <span className="text-[9px] font-sans opacity-70">PU</span>
    </span>
  )
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'pulse',
}: {
  value: number
  max?: number
  tone?: 'pulse' | 'blue' | 'purple' | 'amber'
}) {
  const tones = {
    pulse: 'bg-pulse-500',
    blue: 'bg-accent-blue',
    purple: 'bg-accent-purple',
    amber: 'bg-accent-amber',
  }
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-700 ${tones[tone]}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  accent = 'pulse',
}: {
  label: string
  value: ReactNode
  sub?: string
  accent?: 'pulse' | 'blue' | 'purple' | 'amber'
}) {
  const accents = {
    pulse: 'text-pulse-500',
    blue: 'text-accent-blue',
    purple: 'text-accent-purple',
    amber: 'text-accent-amber',
  }
  return (
    <div className="card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className={`mt-1 font-mono text-2xl font-bold ${accents[accent]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div>}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-1 p-10 text-center">
      <div className="font-display font-bold text-zinc-500 dark:text-zinc-300">{title}</div>
      {hint && <div className="text-sm text-zinc-400">{hint}</div>}
    </div>
  )
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
