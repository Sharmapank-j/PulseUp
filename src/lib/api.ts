// Typed client for the PulseUp Worker API.

import type { CareerPlan, SBAR } from '../types'

export interface SessionUser {
  sub?: string
  name?: string
  email?: string
  picture?: string
}

export interface ServerState {
  pulseScore: number
  credits: number
  plan: CareerPlan | null
  sessions: Array<{
    id: string
    mentorId: string
    mentorName: string
    sbar: SBAR
    status: 'queued' | 'responded'
    cost: number
    createdAt: number
  }>
  syncedOppIds: string[]
  events: Array<{ id: string; kind: string; text: string; creditDelta: number; ts: number }>
}

export interface Capabilities {
  liveAgents: boolean
  engine: string
  endpoints: Array<{ route: string; purpose: string }>
}

export function isSameOriginRequest() {
  return typeof window !== 'undefined'
}

export interface NmcUpdatesResponse {
  live: boolean
  source: string
  items: Array<{ title: string; url: string }>
  disclaimer: string
  cached?: boolean
  fetchedAt: number
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = (await res.clone().json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `API error ${res.status}`)
  }
  return (await res.json()) as T
}

export const api = {
  capabilities: () => request<Capabilities>('/api/agents/capabilities'),
  nmcUpdates: () => request<NmcUpdatesResponse>('/api/nmc-updates'),
  session: () =>
    request<{ user: SessionUser | null }>('/auth/freebuff/session'),
  serverState: () => request<ServerState>('/api/state'),
  syncOpp: (opportunityId: string) =>
    request<{ ok: boolean; op: string; source?: string }>('/api/state/sync-opp', {
      method: 'POST',
      body: JSON.stringify({ opportunityId }),
    }),
  completeMilestone: (milestoneId: string) =>
    request<{ ok: boolean; op: string; credits?: number; source?: string }>(
      '/api/state/complete-milestone',
      { method: 'POST', body: JSON.stringify({ milestoneId }) },
    ),
  openSession: (mentorId: string, sbar: Record<string, string>) =>
    request<{ ok: boolean; sessionId: string; escrow: number; source?: string }>(
      '/api/mentor/session',
      { method: 'POST', body: JSON.stringify({ mentorId, sbar }) },
    ),
  respondSession: (sessionId: string) =>
    request<{ ok: boolean; op: string; source?: string }>('/api/mentor/respond', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),
  agentPlan: (input: { specialty: string; stage: string; horizonMonths: number; goal: string }) =>
    request<{ ok: boolean; plan: CareerPlan; engine: string }>('/api/agent/plan', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  agentScout: (query: string) =>
    request<{ ok: boolean; engine: string; shortlist: Array<{ id: string; title: string; reason: string; score: number; url?: string }> }>(
      '/api/agent/scout',
      { method: 'POST', body: JSON.stringify({ query }) },
    ),
  agentChat: (messages: Array<{ role: 'user' | 'assistant'; content: string }>) =>
    request<{ ok: boolean; reply: string; engine: string }>('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),
  agentTriage: (sbar: Record<string, string>) =>
    request<{ ok: boolean; engine: string; mentorId: string; rationale: string }>(
      '/api/agent/triage',
      { method: 'POST', body: JSON.stringify({ sbar }) },
    ),
}

export function signInPath(returnTo = '/#/agents') {
  return `/auth/freebuff/signin?returnTo=${encodeURIComponent(returnTo)}`
}
