import { useMemo, useState } from 'react'
import { Compass, Sparkles, CircleCheck, ShieldCheck, Loader2 } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { Card, SectionTitle, ProgressBar, ScorePill, EmptyState } from '../components/ui'
import { generatePlan, matchMentors } from '../lib/agent'
import { api } from '../lib/api'
import type { MilestoneKind } from '../types'

const SPECIALTIES = [
  'research',
  'cardiology',
  'surgery',
  'pediatrics',
  'emergency medicine',
  'radiology',
  'other specialty',
]
const STAGES = ['pre-clinical', 'para-clinical', 'clinical', 'internship']
const HORIZONS = [3, 6, 12]

const KIND_TONES: Record<MilestoneKind, string> = {
  skill: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
  project: 'bg-pulse-500/10 text-pulse-600 dark:text-pulse-300',
  network: 'bg-purple-500/10 text-purple-600 dark:text-purple-300',
  portfolio: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  clinical: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
}

export default function Plan() {
  const { state, setPlan, pushToast } = usePulse()
  const [step, setStep] = useState(state.plan ? 2 : 1)
  const [specialty, setSpecialty] = useState('cardiology')
  const [stage, setStage] = useState('clinical')
  const [horizon, setHorizon] = useState(6)
  const [goal, setGoal] = useState('')
  const [thinking, setThinking] = useState(false)

  const mentorMatches = useMemo(() => (state.plan ? matchMentors(state.plan).slice(0, 3) : []), [state.plan])

  function runEngine() {
    setThinking(true)
    // deliberate beat so the engine's "work" is visible
    window.setTimeout(() => {
      const payload = {
        specialty,
        stage,
        horizonMonths: horizon,
        goal: goal.trim() || `Build a credible ${specialty} portfolio with one completed research deliverable`,
      }
      // live agent first; deterministic local engine as the always-works fallback
      api.agentPlan(payload)
        .then(({ plan, engine }) => {
          setPlan(plan)
          setThinking(false)
          setStep(2)
          pushToast(
            engine === 'live-llm'
              ? 'Live agent generated your plan (validated server-side)'
              : 'PulseAI fallback engine generated your plan',
          )
        })
        .catch(() => {
          const plan = generatePlan(payload)
          setPlan(plan)
          setThinking(false)
          setStep(2)
          pushToast('PulseAI local engine generated your plan')
        })
    }, 900)
  }

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Career Navigator"
          subtitle="PulseAI v1 · deterministic engine — same inputs always produce the same plan, every rule auditable"
          right={<span className="chip bg-pulse-500/10 text-pulse-600 dark:text-pulse-300"><ShieldCheck size={12} /> no hallucinated credentials</span>}
        />
        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="label">1 · Specialty track</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpecialty(s)}
                    className={`chip cursor-pointer px-3 py-1.5 capitalize transition ${
                      specialty === s
                        ? 'bg-pulse-500 text-[#0B101B]'
                        : 'bg-zinc-200/60 text-zinc-600 hover:bg-zinc-300/70 dark:bg-white/5 dark:text-zinc-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">2 · Current stage</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`chip cursor-pointer px-3 py-1.5 transition ${
                      stage === s
                        ? 'bg-accent-blue text-white'
                        : 'bg-zinc-200/60 text-zinc-600 hover:bg-zinc-300/70 dark:bg-white/5 dark:text-zinc-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">3 · Horizon</label>
              <div className="flex flex-wrap gap-2">
                {HORIZONS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`chip cursor-pointer px-3 py-1.5 transition ${
                      horizon === h
                        ? 'bg-accent-purple text-white'
                        : 'bg-zinc-200/60 text-zinc-600 hover:bg-zinc-300/70 dark:bg-white/5 dark:text-zinc-300'
                    }`}
                  >
                    {h} months
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">4 · Goal (your own words)</label>
              <input
                className="input"
                placeholder="e.g. Publish my first medical research paper in the next six months"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full md:w-auto" onClick={runEngine} disabled={thinking}>
              {thinking ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> PulseAI is routing rules…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate plan
                </>
              )}
            </button>
            {thinking && (
              <div className="space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <p className="text-xs text-zinc-400">
                  running: career diagnostic → skill-gap baseline → milestone scaffold → mentor routing
                </p>
              </div>
            )}
          </div>
        ) : state.plan ? (
          <PlanView />
        ) : (
          <EmptyState title="No plan active" hint="Complete the wizard to generate one." />
        )}
      </Card>

      {state.plan && (
        <Card>
          <SectionTitle
            title="Skill-gap radar"
            subtitle="baseline at plan creation vs target at horizon completion"
            right={<ScorePill score={state.pulseScore} />}
          />
          <div className="grid gap-5 md:grid-cols-2">
            {state.plan.skillGaps.map((gap) => (
              <div key={gap.skill}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold">{gap.skill}</span>
                  <span className="font-mono text-zinc-400">
                    {gap.currentLevel} → <span className="text-pulse-500">{gap.targetLevel}</span>
                  </span>
                </div>
                <div className="relative">
                  <ProgressBar value={gap.currentLevel} tone="amber" />
                  <div className="absolute inset-x-0 top-0 h-1.5 overflow-hidden rounded-full">
                    <div className="h-full w-full bg-transparent" />
                  </div>
                  <div className="relative -mt-1.5">
                    <ProgressBar value={gap.targetLevel} tone="pulse" />
                  </div>
                  <span className="absolute right-0 -top-4 h-8" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            amber = current baseline at plan creation · green = target by horizon · re-run the engine
            after each complete retrospective to re-baseline
          </p>
        </Card>
      )}

      {state.plan && mentorMatches.length > 0 && (
        <Card>
          <SectionTitle
            title="Mentor routing by the plan"
            subtitle="top matches from the deterministic router (expertise overlap + rating)"
          />
          <div className="grid gap-3 md:grid-cols-3">
            {mentorMatches.map((m) => (
              <div key={m.mentor.id} className="card card-hover p-4">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-bold">{m.mentor.name}</span>
                  <span className="font-mono text-xs text-pulse-500">{m.matchScore}%</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {m.mentor.role}
                </div>
                <div className="mt-2 text-[11px] leading-relaxed text-zinc-400">{m.reason}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function PlanView() {
  const { state, completeMilestone, pushToast } = usePulse()
  const plan = state.plan!
  const WEEKS = plan.horizonMonths * 4
  const done = plan.milestones.filter((m) => m.detail.startsWith('[done]')).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="chip bg-accent-blue/10 text-accent-blue capitalize">{plan.specialty}</span>
        <span className="chip bg-zinc-200/60 dark:bg-white/5 dark:text-zinc-300">{plan.stage}</span>
        <span className="chip bg-zinc-200/60 dark:bg-white/5 dark:text-zinc-300">
          {plan.horizonMonths} months · {WEEKS} weeks
        </span>
        <span className="chip bg-pulse-500/10 font-mono text-pulse-600 dark:text-pulse-300">
          {done}/{plan.milestones.length} done
        </span>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        <Compass size={14} className="mr-1.5 inline text-pulse-500" />
        {plan.goal}
      </p>

      <ProgressBar value={done} max={plan.milestones.length} />

      <ol className="relative max-h-[26rem] space-y-3 overflow-y-auto pr-2">
        {plan.milestones.map((m) => {
          const isDone = m.detail.startsWith('[done]')
          const weekStr = `week ${m.week}/${WEEKS}`
          return (
            <li key={m.id} className="relative pl-8">
              <span
                className={`absolute left-2 top-1.5 grid h-4 w-4 place-items-center rounded-full border-2 ${
                  isDone ? 'border-pulse-500 bg-pulse-500' : 'border-zinc-300 bg-transparent dark:border-white/20'
                }`}
              >
                {isDone && <CircleCheck size={12} className="text-[#0B101B]" />}
              </span>
              <div className={`card p-4 ${isDone ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`chip ${KIND_TONES[m.kind]} uppercase`}>{m.kind}</span>
                      <span className="font-mono text-[10px] text-zinc-400">{weekStr}</span>
                    </div>
                    <div
                      className={`mt-1 text-sm font-bold ${isDone ? 'line-through decoration-pulse-500/60' : ''}`}
                    >
                      {m.title}
                    </div>
                    <div className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {isDone ? m.detail.replace('[done] ', '') : m.detail}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="font-mono text-xs text-pulse-500">+{m.credits} cr</span>
                    {!isDone && (
                      <button
                        className="btn-ghost px-2 py-1 text-[11px]"
                        onClick={() => {
                          completeMilestone(m.id, m.credits, m.title)
                          pushToast(`+${m.credits} credits · milestone logged`)
                        }}
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
