import { useMemo, useState } from 'react'
import { Star, Send, Clock, X, Loader2, CircleCheck, Bot } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { Card, SectionTitle, ProgressBar, EmptyState, timeAgo } from '../components/ui'
import { matchMentors } from '../lib/agent'
import { api } from '../lib/api'
import type { Mentor, SBAR } from '../types'

let sessSeq = 0
const nextSessionId = () => {
  sessSeq += 1
  return `s_${Date.now().toString(36)}_${sessSeq}`
}

export default function Mentors() {
  const { state, spendCredits, openSession, respondSession, pushToast, user } = usePulse()
  const matches = useMemo(() => matchMentors(state.plan), [state.plan])
  const [ticketFor, setTicketFor] = useState<Mentor | null>(null)
  const [sbar, setSbar] = useState<SBAR>({ situation: '', background: '', assessment: '', request: '' })
  const [sending, setSending] = useState(false)
  const [triageNote, setTriageNote] = useState<string | null>(null)
  const [triageMentor, setTriageMentor] = useState<Mentor | null>(null)

  function validate(s: SBAR) {
    return Object.values(s).every((v) => v.trim().length >= 8)
  }

  async function submit() {
    if (!ticketFor) return
    if (!validate(sbar)) {
      pushToast('Fill every SBAR field (≥8 characters each)')
      return
    }
    setSending(true)
    try {
      if (user) {
        // server-side escrow: credit is deducted and recorded in the D1 ledger
        const res = await api.openSession(ticketFor.id, { ...sbar })
        openSession({
          id: res.sessionId,
          mentorId: ticketFor.id,
          mentorName: ticketFor.name,
          sbar,
          status: 'queued',
          cost: res.escrow,
          createdAt: Date.now(),
        })
        spendCredits(res.escrow, `SBAR escrow locked: ${ticketFor.name} (${res.escrow} cr) — server-ledger synced`)
      } else {
        // offline demo path — local ledger only
        await new Promise((r) => window.setTimeout(r, 700))
        const ok = spendCredits(
          ticketFor.sessionCost,
          `SBAR escrow locked: ${ticketFor.name} (${ticketFor.sessionCost} cr)`,
        )
        if (!ok) {
          pushToast('Insufficient Pulse Credits for this ticket')
          setTicketFor(null)
          setSending(false)
          return
        }
        openSession({
          id: nextSessionId(),
          mentorId: ticketFor.id,
          mentorName: ticketFor.name,
          sbar,
          status: 'queued',
          cost: ticketFor.sessionCost,
          createdAt: Date.now(),
        })
      }
      pushToast(`Ticket queued to ${ticketFor.name}${user ? ' — server ledger synced' : ''}`)
      setSbar({ situation: '', background: '', assessment: '', request: '' })
      setTriageNote(null)
      setTriageMentor(null)
      setTicketFor(null)
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  async function askRouter() {
    try {
      const res = await api.agentTriage({ ...sbar })
      const suggested = matchMentors(null).find((m) => m.mentor.id === res.mentorId)?.mentor ?? null
      setTriageMentor(suggested)
      setTriageNote(
        `${res.engine === 'live-llm' ? 'live agent' : 'deterministic router'}: ${res.rationale}`,
      )
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Router unavailable')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Mentor panel"
          subtitle="simulated mentor personas while real-mentor onboarding is in progress — every ticket is a structured SBAR handover; escrow releases only when the session completes"
          right={
            <span className="chip bg-amber-500/10 text-amber-600 dark:text-amber-300">
              simulated panel (beta)
            </span>
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map(({ mentor, matchScore, reason }) => (
            <div key={mentor.id} className="card card-hover flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display font-bold">{mentor.name}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{mentor.role}</div>
                </div>
                <span
                  className={`chip ${
                    mentor.availableNow
                      ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                  }`}
                >
                  <Clock size={11} /> {mentor.availableNow ? 'now' : 'next 48h'}
                </span>
              </div>
              <div className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {mentor.institution}
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-bold text-amber-500">
                  <Star size={13} className="fill-current" /> {mentor.rating}
                  <span className="ml-0.5 font-normal text-zinc-400">({mentor.ratingCount})</span>
                </span>
                <span className="text-zinc-400">{mentor.experienceYears}y</span>
                <span className="font-mono text-pulse-500">{matchScore}% match</span>
              </div>
              <ProgressBar value={matchScore} />

              <div className="mt-3 flex flex-wrap gap-1.5">
                {mentor.expertise.slice(0, 3).map((e) => (
                  <span key={e} className="chip bg-zinc-200/60 dark:bg-white/5 dark:text-zinc-300">
                    {e}
                  </span>
                ))}
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">{mentor.bio}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-zinc-400 italic">{reason}</p>

              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="font-mono text-sm font-bold text-pulse-500">
                  {mentor.sessionCost} cr
                </span>
                <button
                  className="btn-primary text-xs"
                  onClick={() => {
                    setTicketFor(mentor)
                    setTriageNote(null)
                  }}
                >
                  <Send size={13} /> Open SBAR ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* My tickets */}
      <Card>
        <SectionTitle title="My SBAR tickets" subtitle="queued → responded · credits release to mentors on completion" />
        {state.sessions.length === 0 ? (
          <EmptyState title="No tickets yet" hint="Pick a mentor above and open your first structured handover." />
        ) : (
          <ul className="space-y-3">
            {state.sessions.map((s) => (
              <li key={s.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold">{s.mentorName}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {timeAgo(s.createdAt)} · {s.cost} cr escrowed
                    </div>
                  </div>
                  {s.status === 'queued' ? (
                    <button
                      className="btn-ghost px-3 py-1 text-xs"
                      onClick={() => {
                        respondSession(s.id)
                        pushToast('Mentor response received · +10 cr contribution credit')
                      }}
                    >
                      Simulate response
                    </button>
                  ) : (
                    <span className="chip bg-pulse-500/10 text-pulse-600 dark:text-pulse-300">
                      <CircleCheck size={12} /> responded
                    </span>
                  )}
                </div>
                <dl className="mt-3 grid gap-2 text-xs md:grid-cols-4">
                  {(
                    [
                      ['S', 'Situation', s.sbar.situation],
                      ['B', 'Background', s.sbar.background],
                      ['A', 'Assessment', s.sbar.assessment],
                      ['R', 'Request', s.sbar.request],
                    ] as const
                  ).map(([l, name, v]) => (
                    <div key={l} className="rounded-lg bg-zinc-100 p-2 dark:bg-white/5">
                      <dt className="font-mono font-bold text-pulse-500">
                        {l} · <span className="text-zinc-500 dark:text-zinc-400">{name}</span>
                      </dt>
                      <dd className="mt-1 leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* SBAR composer */}
      {ticketFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !sending && setTicketFor(null)}>
          <div className="card w-full max-w-xl p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-bold">SBAR ticket · {ticketFor.name}</h3>
              {!sending && (
                <button onClick={() => setTicketFor(null)} className="btn-ghost p-1.5">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {(
                [
                  ['situation', 'S — Situation: your one-line context'],
                  ['background', 'B — Background: relevant profile facts'],
                  ['assessment', 'A — Assessment: what you think the issue is'],
                  ['request', 'R — Request: the specific ask'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <textarea
                    className="input h-16 resize-none"
                    value={sbar[key]}
                    onChange={(e) => setSbar((s) => ({ ...s, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="chip bg-pulse-500/10 font-mono text-pulse-600 dark:text-pulse-300">
                  escrow: {ticketFor.sessionCost} cr
                </span>
                <button className="btn-ghost text-xs" onClick={askRouter} disabled={sending}>
                  <Bot size={13} /> Ask PulseAI router
                </button>
              </div>
              <button className="btn-primary" onClick={submit} disabled={sending}>
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Lock escrow & dispatch
              </button>
            </div>
            {triageNote && triageMentor && (
              <div className="mt-3 rounded-xl bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-200">
                {triageNote}
                {triageMentor.id !== ticketFor.id && ' · opens as a ticket to ' + triageMentor.name + ' unless you adjust the recipient'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
