import { useEffect, useRef, useState } from 'react'
import { RefreshCw, Send, Sparkles, CircleAlert, Link2 } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { Card, SectionTitle } from '../components/ui'
import { api, signInPath } from '../lib/api'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  engine?: string
}

export default function Agents() {
  const { state, setPlan, pushToast, user, capabilities, hydrated } = usePulse()
  const [msgs, setMsgs] = useState<ChatMsg[]>([        {
          role: 'assistant',
          content:
            'Career Copilot online. Ask about opportunities, mentorship, or the next step in your plan — answers are grounded in your real-catalog profile data. 100% free to use; when no live model key is configured, the deterministic engine answers.',
          engine: 'system',
        },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const [scoutQuery, setScoutQuery] = useState('')
  const [scoutBusy, setScoutBusy] = useState(false)
  const [scoutResult, setScoutResult] = useState<{
    engine: string
    shortlist: Array<{ id: string; title: string; reason: string; score: number; url?: string }>
  } | null>(null)
  const [regenBusy, setRegenBusy] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const signedIn = Boolean(user)

  async function sendChat() {
    const text = chatInput.trim()
    if (!text || chatBusy) return
    setChatBusy(true)
    setChatInput('')
    const history = msgs.filter((m) => m.engine !== 'system').slice(-8)
    setMsgs((m) => [...m, { role: 'user', content: text }])
    try {
      const res = await api.agentChat([
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: text },
      ])
      setMsgs((m) => [...m, { role: 'assistant', content: res.reply, engine: res.engine }])
    } catch (err) {
      const notAuthed = err instanceof Error && /sign in required/i.test(err.message)
      setMsgs((m) => [
        ...m,
        {
          role: 'assistant',
          content: notAuthed
            ? 'The live agent gateway needs an account. Sign in with Freebuff (button above) — same-origin and 401-protected server-side.'
            : `Gateway error: ${err instanceof Error ? err.message : 'unknown'}`,
          engine: 'error',
        },
      ])
    } finally {
      setChatBusy(false)
    }
  }

  async function runScout() {
    if (!scoutQuery.trim()) return
    setScoutBusy(true)
    try {
      const res = await api.agentScout(scoutQuery.trim())
      setScoutResult(res)
      pushToast(`Scout returned ${res.shortlist.length} item(s) · ${res.engine}`)
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Scout unavailable')
    } finally {
      setScoutBusy(false)
    }
  }

  async function regeneratePlan() {
    if (!state.plan || regenBusy) return
    setRegenBusy(true)
    const p = state.plan
    try {
      const res = await api.agentPlan({
        specialty: p.specialty,
        stage: p.stage,
        horizonMonths: p.horizonMonths,
        goal: p.goal,
      })
      setPlan(res.plan)
      pushToast(`Plan re-ranked by ${res.engine} — ${res.plan.milestones.length} milestones`)
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Plan agent unavailable')
    } finally {
      setRegenBusy(false)
    }
  }

  const liveTag = (engine?: string) => (
    <span
      className={`chip font-mono ${
        engine === 'live-llm'
          ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300'
          : engine === 'error'
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
            : 'bg-zinc-200/60 dark:bg-white/5 dark:text-zinc-300'
      }`}
    >
      {engine ?? 'agent'}
    </span>
  )

  return (
    <div className="space-y-6">
      {/* status card */}
      <Card>
        <SectionTitle
          title="Live agent services"
          subtitle={
            capabilities?.liveAgents
              ? `LLM gateway configured (${capabilities.engine}) · outputs schema-validated server-side`
              : 'No LLM key configured — deterministic PulseAI fallback serves every endpoint'
          }
          right={
            <span
              className={`chip ${
                capabilities?.liveAgents
                  ? 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
              }`}
            >
              {capabilities?.liveAgents ? 'live LLM' : 'fallback engine'}
            </span>
          }
        />
        {hydrated && !signedIn && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-amber-500/10 p-3 text-sm">
            <CircleAlert size={15} className="text-amber-500" />
            Agent endpoints require sign-in — per-user data is keyed by your Freebuff account (server-enforced 401s).
            <a href={signInPath()} className="btn-primary text-xs">
              Sign in with Freebuff
            </a>
          </div>
        )}
        {!capabilities?.liveAgents && (
          <div className="mt-3 rounded-xl bg-pulse-500/5 p-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-300">
            <strong className="text-pulse-600 dark:text-pulse-300">Free live-AI setup (2 minutes, ₹0):</strong>{' '}
            agents default to OpenRouter’s free tier (Llama-3.3-70B). Create a free key at{' '}
            <a className="font-semibold text-pulse-500 hover:underline" href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
              openrouter.ai/keys
            </a>{' '}
            (no credit card needed), tell this assistant the key value, and it will be stored as a Worker secret —
            the backend then uses ‘https://openrouter.ai/api/v1’ automatically. Without the key every agent still
            works using the deterministic engine.
          </div>
        )}
        <div className="mt-3 grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 md:grid-cols-2">
          {(capabilities?.endpoints ?? []).map((e) => (
            <div key={e.route} className="card p-3">
              <span className="font-mono text-[11px] text-pulse-500">{e.route}</span>
              <span className="ml-2">{e.purpose}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* chat */}
        <Card className="flex flex-col">
          <SectionTitle
            title="Career Copilot chat"
            subtitle="grounded in your plan, pulse score, and catalog — no hallucinated credentials by system prompt"
          />
          <ul className="mb-3 max-h-[24rem] flex-1 space-y-2 overflow-y-auto pr-1">
            {msgs.map((m, i) => (
              <li
                key={i}
                className={`rounded-xl p-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-8 bg-pulse-500/10'
                    : 'mr-8 bg-zinc-100 dark:bg-white/5'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {m.role}
                  </span>
                  {m.role === 'assistant' && liveTag(m.engine)}
                </div>
                {m.content}
              </li>
            ))}
            <div ref={chatEndRef} />
          </ul>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="e.g. What should I do first for cardiology research?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            />
            <button className="btn-primary px-3" onClick={sendChat} disabled={chatBusy || !chatInput.trim()}>
              {chatBusy ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </Card>

        {/* scout */}
        <Card>
          <SectionTitle
            title="Opportunity Scout (natural language)"
            subtitle="the LLM ranks only real catalog ids — no fabricated listings, enforced by validation"
          />
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="e.g. zero-fee research grants for peds"
              value={scoutQuery}
              onChange={(e) => setScoutQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runScout()}
            />
            <button className="btn-primary px-3" onClick={runScout} disabled={scoutBusy || !scoutQuery.trim()}>
              {scoutBusy ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
            </button>
          </div>
          {scoutResult && (
            <div className="mt-4 space-y-2">
              <div className="chip bg-zinc-200/60 font-mono dark:bg-white/5 dark:text-zinc-300">
                engine: {scoutResult.engine}
              </div>
              {scoutResult.shortlist.map((r) => (
                <div key={r.id} className="card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-bold">{r.title}</div>
                    <span className="font-mono text-xs text-pulse-500">{r.score}</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{r.reason}</div>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-pulse-500"
                    >
                      source <Link2 size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* plan regeneration */}
      <Card>
        <SectionTitle
          title="Plan regeneration"
          subtitle="send the active plan back through the live agent — same validation, fresh milestones"
          right={
            <button
              className="btn-primary text-xs"
              onClick={regeneratePlan}
              disabled={!state.plan || regenBusy}
            >
              <RefreshCw size={13} className={regenBusy ? 'animate-spin' : ''} />
              Re-run navigator
            </button>
          }
        />
        {!state.plan && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No active plan — generate one in the Career Navigator first.
          </p>
        )}
        {state.plan && (
          <span className="chip bg-pulse-500/10 font-mono text-pulse-600 dark:text-pulse-300">
            {state.plan.milestones.length} milestones · {state.plan.specialty} · engine {state.plan.engine}
          </span>
        )}
      </Card>
    </div>
  )
}
