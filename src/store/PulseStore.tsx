import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CareerPlan, MentorSession, Opportunity, PulseEvent, PulseState } from '../types'
import { scoreOpportunity } from '../lib/agent'
import { api, type Capabilities, type ServerState, type SessionUser } from '../lib/api'

export interface AuthInfo {
  user: SessionUser | null
  capabilities: Capabilities | null
}

const STORAGE_KEY = 'pulseup-cloud-state-v1'
const THEME_KEY = 'pulseup-cloud-theme'

export type ThemeMode = 'light' | 'dark' | 'night'

const initialState: PulseState = {
  pulseScore: 38,
  credits: 120,
  syncedOppIds: [],
  plan: null,
  sessions: [],
  events: [],
  nmrChecked: [],
}

function loadState(): PulseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<PulseState>
    return { ...initialState, ...parsed }
  } catch {
    return initialState
  }
}

function persistState(state: PulseState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private mode) — keep in-memory only
  }
}

let eventSeq = 0
const makeEvent = (kind: PulseEvent['kind'], text: string, creditDelta?: number): PulseEvent => {
  eventSeq += 1
  return { id: `ev_${Date.now().toString(36)}_${eventSeq}`, ts: Date.now(), kind, text, creditDelta }
}

export interface PulseStore {
  state: PulseState
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  user: SessionUser | null
  capabilities: Capabilities | null
  hydrated: boolean
  setPlan: (plan: CareerPlan) => void
  toggleSyncOpp: (opp: Opportunity) => void
  isSynced: (oppId: string) => boolean
  awardCredits: (amount: number, text: string) => void
  spendCredits: (amount: number, text: string) => boolean
  openSession: (session: MentorSession) => void
  respondSession: (sessionId: string) => void
  completeMilestone: (milestoneId: string, credits: number, title: string) => void
  toggleNmrItem: (id: string, label: string) => void
  rankOpps: (opps: Opportunity[]) => Opportunity[]
  toast: string | null
  pushToast: (text: string) => void
}

const PulseContext = createContext<PulseStore | null>(null)

export function PulseStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PulseState>(loadState)
  const [toast, setToast] = useState<string | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(
    () => (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark',
  )

  const setThemePersisted = useCallback((t: ThemeMode) => {
    setTheme(t)
    try {
      localStorage.setItem(THEME_KEY, t)
    } catch {
      // storage unavailable
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme !== 'light')
    document.documentElement.dataset.night = theme === 'night' ? 'true' : 'false'
  }, [theme])

  useEffect(() => {
    persistState(state)
  }, [state])

  const pushToast = useCallback((text: string) => {
    setToast(text)
    window.setTimeout(() => setToast((t) => (t === text ? null : t)), 3200)
  }, [])

  // Hydrate from the backend when the visitor has a Freebuff session.
  // The server is authoritative for ledger, plans, and sessions.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        api.capabilities().then((c) => !cancelled && setCapabilities(c)).catch(() => {})
        const { user: sessionUser } = await api.session()
        if (cancelled) return
        if (sessionUser) {
          setUser(sessionUser)
          const remote: ServerState = await api.serverState()
          if (cancelled) return
          setState((s) => ({
            ...s,
            pulseScore: remote.pulseScore,
            credits: remote.credits,
            plan: remote.plan ?? s.plan,
            sessions: remote.sessions,
            syncedOppIds: remote.syncedOppIds,
            events: remote.events.map((e) => ({
              id: e.id,
              kind: e.kind as PulseEvent['kind'],
              text: e.text,
              creditDelta: e.creditDelta,
              ts: e.ts,
            })),
          }))
        }
      } catch {
        // backend unreachable — stay on local state
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setPlan = useCallback((plan: CareerPlan) => {
    setState((s) => ({
      ...s,
      plan,
      pulseScore: Math.min(100, s.pulseScore + 8),
      events: [makeEvent('plan', `Career plan generated: ${plan.specialty} · ${plan.horizonMonths} months`, 0), ...s.events].slice(0, 60),
    }))
  }, [])

  const toggleSyncOpp = useCallback((opp: Opportunity) => {
    setState((s) => {
      const isSynced = s.syncedOppIds.includes(opp.id)
      const ev: PulseEvent = makeEvent(
        'sync',
        isSynced ? `Removed from plan: ${opp.title}` : `Synced to plan: ${opp.title}`,
        isSynced ? 0 : 5,
      )
      if (!isSynced) {
        // server mirror is fire-and-forget; the server ledger stays authoritative
        void api.syncOpp(opp.id).catch(() => setToast('Offline — synced locally only'))
      }
      return {
        ...s,
        syncedOppIds: isSynced
          ? s.syncedOppIds.filter((id) => id !== opp.id)
          : [...s.syncedOppIds, opp.id],
        pulseScore: Math.min(100, s.pulseScore + (isSynced ? 0 : 2)),
        credits: s.credits + (isSynced ? 0 : 5),
        events: [ev, ...s.events].slice(0, 60),
      }
    })
  }, [])

  const isSynced = useCallback(
    (oppId: string) => state.syncedOppIds.includes(oppId),
    [state.syncedOppIds],
  )

  const awardCredits = useCallback((amount: number, text: string) => {
    setState((s) => ({
      ...s,
      credits: s.credits + amount,
      events: [makeEvent('credit', text, amount), ...s.events].slice(0, 60),
    }))
  }, [])

  const spendCredits = useCallback(
    (amount: number, text: string) => {
      let ok = false
      setState((s) => {
        if (s.credits < amount) return s
        ok = true
        return {
          ...s,
          credits: s.credits - amount,
          pulseScore: Math.min(100, s.pulseScore + 1),
          events: [makeEvent('credit', text, -amount), ...s.events].slice(0, 60),
        }
      })
      return ok
    },
    [],
  )

  const openSession = useCallback((session: MentorSession) => {
    setState((s) => ({
      ...s,
      sessions: [session, ...s.sessions],
      events: [makeEvent('mentor', `SBAR ticket opened: ${session.mentorName}`, -session.cost), ...s.events].slice(0, 60),
    }))
  }, [])

  const respondSession = useCallback((sessionId: string) => {
    setState((s) => {
      const session = s.sessions.find((x) => x.id === sessionId)
      if (!session || session.status !== 'queued') return s
      void api.respondSession(sessionId).catch(() => setToast('Offline — responded locally only'))
      return {
        ...s,
        sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, status: 'responded' } : x)),
        credits: s.credits + 10,
        events: [makeEvent('mentor', `Mentor responded: ${session.mentorName}`, 10), ...s.events].slice(0, 60),
      }
    })
  }, [])

  const completeMilestone = useCallback((milestoneId: string, credits: number, title: string) => {
    setState((s) => {
      if (!s.plan) return s
      const alreadyDone = s.plan.milestones.find((m) => m.id === milestoneId && !!m.detail.startsWith('[done]'))
      if (alreadyDone) return s
      void api.completeMilestone(milestoneId).catch(() => setToast('Offline — completed locally only'))
      return {
        ...s,
        pulseScore: Math.min(100, s.pulseScore + 4),
        credits: s.credits + credits,
        plan: {
          ...s.plan,
          milestones: s.plan.milestones.map((m) =>
            m.id === milestoneId ? { ...m, detail: `[done] ${m.detail}` } : m,
          ),
        },
        events: [makeEvent('plan', `Milestone complete: ${title}`, credits), ...s.events].slice(0, 60),
      }
    })
  }, [])

  const toggleNmrItem = useCallback((id: string, label: string) => {
    setState((s) => {
      const checked = s.nmrChecked.includes(id)
      return {
        ...s,
        nmrChecked: checked ? s.nmrChecked.filter((x) => x !== id) : [...s.nmrChecked, id],
        pulseScore: Math.min(100, s.pulseScore + (checked ? 0 : 3)),
        credits: s.credits + (checked ? 0 : 2),
        events: [
          makeEvent('profile', checked ? `Checklist item unset: ${label}` : `NMR readiness: ${label}`, checked ? 0 : 2),
          ...s.events,
        ].slice(0, 60),
      }
    })
  }, [])

  const rankOpps = useCallback(
    (opps: Opportunity[]) =>
      [...opps].sort((a, b) => scoreOpportunity(b, state.plan) - scoreOpportunity(a, state.plan)),
    [state.plan],
  )

  const value = useMemo<PulseStore>(
    () => ({
      state,
      theme,
      setTheme: setThemePersisted,
      user,
      capabilities,
      hydrated,
      setPlan,
      toggleSyncOpp,
      isSynced,
      awardCredits,
      spendCredits,
      openSession,
      respondSession,
      completeMilestone,
      toggleNmrItem,
      rankOpps,
      toast,
      pushToast,
    }),
    [
      state,
      theme,
      setThemePersisted,
      user,
      capabilities,
      hydrated,
      setPlan,
      toggleSyncOpp,
      isSynced,
      awardCredits,
      spendCredits,
      openSession,
      respondSession,
      completeMilestone,
      toggleNmrItem,
      rankOpps,
      toast,
      pushToast,
    ],
  )

  return <PulseContext.Provider value={value}>{children}</PulseContext.Provider>
}

export function usePulse(): PulseStore {
  const ctx = useContext(PulseContext)
  if (!ctx) throw new Error('usePulse must be used inside PulseStoreProvider')
  return ctx
}
