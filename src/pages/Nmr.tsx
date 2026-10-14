import { useEffect, useState } from 'react'
import { IdCard, ScrollText, Landmark, ExternalLink, CircleCheck, CircleDot, ShieldCheck, RefreshCw } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { Card, SectionTitle, VerifiedBadge, ProgressBar } from '../components/ui'
import { NMR_TRACKS, NMR_CHECKLIST, NMR_FAQ } from '../data/nmr.ts'
import { COMPLIANCE_RULES } from '../data/compliance.ts'
import { api } from '../lib/api'

interface NmcUpdateItem {
  title: string
  url: string
}
interface NmcUpdates {
  live: boolean
  source: string
  items: NmcUpdateItem[]
  disclaimer: string
  cached?: boolean
  fetchedAt: number
}

export default function Nmr() {
  const { state, toggleNmrItem, pushToast } = usePulse()
  const [stage, setStage] = useState<'ug-track' | 'grad-track'>('ug-track')
  const [updates, setUpdates] = useState<NmcUpdates | null>(null)
  const [updatesBusy, setUpdatesBusy] = useState(false)

  async function loadUpdates() {
    if (updatesBusy) return
    setUpdatesBusy(true)
    try {
      const res = await api.nmcUpdates()
      setUpdates(res)
    } catch {
      // keep the previous snapshot; endpoint also has its own server fallback
    } finally {
      setUpdatesBusy(false)
    }
  }

  // automatic load — the feed is refreshed server-side against nmc.org.in
  useEffect(() => {
    void loadUpdates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = NMR_CHECKLIST.filter((c) => c.stage === stage)
  const doneInStage = items.filter((c) => state.nmrChecked.includes(c.id)).length
  const doneAll = NMR_CHECKLIST.filter((c) => state.nmrChecked.includes(c.id)).length

  function toggle(id: string, label: string) {
    const wasChecked = state.nmrChecked.includes(id)
    toggleNmrItem(id, label)
    if (!wasChecked) pushToast(`+2 cr · readiness item logged (server mirror pending)`)
  }

  return (
    <div className="space-y-6">
      <Card glass className="relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-pulse-500/15 blur-2xl" />
        <div className="absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-accent-blue/10 blur-2xl" />
        <SectionTitle
          title="Unified medical registration — NMR readiness"
          subtitle="what is actually live, what is still a draft, and exactly which documents to keep ready — so the transition catches you prepared, not by surprise"
          right={
            <span className="chip chip-glass chip-glass-dark bg-pulse-500/10 font-mono text-pulse-600 dark:text-pulse-300">
              {doneAll}/{NMR_CHECKLIST.length} ready
            </span>
          }
          accent
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-glass chip-glass-dark bg-pulse-500/10 text-pulse-600 dark:text-pulse-300">
            <IdCard size={12} /> NMR portal live
          </span>
          <span className="chip chip-glass chip-glass-dark bg-amber-500/10 text-amber-600 dark:text-amber-300">
            2026 unified framework = draft only
          </span>
          <span className="chip chip-glass chip-glass-dark bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            ₹0 NMR registration fee
          </span>
        </div>
      </Card>

      {/* Track explorer */}        <div className="grid gap-4 lg:grid-cols-2">
        {NMR_TRACKS.map((t) => (
          <Card key={t.id} glass hover className="flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-display text-base font-bold">{t.title}</h3>
              {t.status === 'live' ? (
                <span className="chip chip-glass chip-glass-dark bg-pulse-500/10 text-pulse-600 dark:text-pulse-300">live service</span>
              ) : (
                <span className="chip chip-glass chip-glass-dark bg-amber-500/10 text-amber-600 dark:text-amber-300">draft — not in force</span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] italic text-zinc-400">{t.statusNote}</p>

            <dl className="mt-3 space-y-2 text-xs">
              <div>
                <dt className="font-bold uppercase tracking-wide text-zinc-400">What it is</dt>
                <dd className="mt-0.5 leading-relaxed text-zinc-600 dark:text-zinc-300">{t.what}</dd>
              </div>
              <div>
                <dt className="font-bold uppercase tracking-wide text-zinc-400">Who it applies to</dt>
                <dd className="mt-0.5 leading-relaxed text-zinc-600 dark:text-zinc-300">{t.who}</dd>
              </div>
              <div>
                <dt className="font-bold uppercase tracking-wide text-zinc-400">Fees</dt>
                <dd className="mt-0.5 leading-relaxed text-zinc-600 dark:text-zinc-300">{t.feeNote}</dd>
              </div>
            </dl>

            <div className="mt-3">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <ScrollText size={11} /> Timeline
              </div>
              <ul className="space-y-1.5">
                {t.timeline.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <CircleDot size={12} className="mt-0.5 shrink-0 text-pulse-500" />
                    <span>
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{m.date}</span> — {m.event}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-3 text-xs">
              {t.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-pulse-500 hover:underline"
                >
                  <Landmark size={12} /> {l.label} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive checklist */}
      <Card>
        <SectionTitle
          title="Document readiness checklist"
          subtitle="each item you bank improves your Passport score (+3) and earns +2 Pulse Credits"
          right={
            <div className="w-40">
              <ProgressBar value={doneInStage} max={items.length} />
            </div>
          }
        />
        <div className="mb-4 flex gap-2">
          {(
            [
              ['ug-track', 'I am a student (UG track)'],
              ['grad-track', 'I hold SMC registration (graduate track)'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStage(key)}
              className={`chip cursor-pointer px-3 py-1.5 transition ${
                stage === key
                  ? 'bg-pulse-500 text-[#0B101B]'
                  : 'bg-zinc-200/60 text-zinc-600 hover:bg-zinc-300/70 dark:bg-white/5 dark:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="space-y-2.5">
          {items.map((item) => {
            const checked = state.nmrChecked.includes(item.id)
            return (
              <li key={item.id}>
                <button
                  onClick={() => toggle(item.id, item.label)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    checked
                      ? 'border-pulse-500/50 bg-pulse-500/5'
                      : 'border-zinc-200 hover:border-pulse-500/40 dark:border-white/10'
                  }`}
                >
                  <span className={`mt-0.5 shrink-0 ${checked ? 'text-pulse-500' : 'text-zinc-400'}`}>
                    {checked ? <CircleCheck size={18} /> : <CircleDot size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`flex flex-wrap items-center gap-2 text-sm font-bold ${checked ? 'line-through decoration-pulse-500/50' : ''}`}>
                      {item.label}
                      <VerifiedBadge verified={item.verified} />
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {item.detail}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Card>

      {/* Auto-fetched official NMC updates */}
      <Card>
        <SectionTitle
          title="Verified NMC updates (auto-fetched)"
          subtitle="server-side pull from nmc.org.in, cached in D1, every item carries its official link — drafts are never shown as active rules"
          right={
            <button className="btn-ghost text-xs" onClick={loadUpdates} disabled={updatesBusy}>
              <RefreshCw size={13} className={updatesBusy ? 'animate-spin' : ''} />
              Refresh
            </button>
          }
        />
        {updates ? (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
              <span className={`chip ${updates.live ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'}`}>
                {updates.live ? 'live fetch from nmc.org.in' : 'curated snapshot (official pages)'}
              </span>
              <span className="font-mono">fetched {new Date(updates.fetchedAt).toLocaleString()}</span>
              {updates.cached && <span className="chip bg-zinc-200/60 dark:bg-white/5">D1 cache</span>}
            </div>
            <ul className="space-y-1.5">
              {updates.items.map((u, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-white/5">
                  <ShieldCheck size={13} className="mt-0.5 shrink-0 text-pulse-500" />
                  <span>
                    {u.title}
                    <a href={u.url} target="_blank" rel="noreferrer" className="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-pulse-500 hover:underline">
                      source
                    </a>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] italic leading-snug text-zinc-400">{updates.disclaimer}</p>
          </>
        ) : (
          <div className="skeleton h-24" />
        )}
      </Card>

      {/* Compliance rulebook */}
      <Card>
        <SectionTitle
          title="NMC compliance rulebook — always in force on PulseUp"
          subtitle="how this platform stays inside the lines while India's registration framework is in flux"
        />
        <ul className="grid gap-2 md:grid-cols-2">
          {COMPLIANCE_RULES.map((r) => (
            <li key={r.rule} className="card p-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <ShieldCheck size={13} className="shrink-0 text-pulse-500" /> {r.rule}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{r.how}</p>
            </li>
          ))}
        </ul>
      </Card>

      {/* FAQ */}
      <Card>
        <SectionTitle title="Straight answers" subtitle="verified clarified vs still-unknown — no speculation" />
        <ul className="space-y-3">
          {NMR_FAQ.map((f) => (
            <li key={f.q} className="card p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
                {f.q}
                <VerifiedBadge verified={f.verified} />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{f.a}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
