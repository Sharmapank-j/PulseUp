// PulseUp Cloud — Worker backend
//
// Responsibilities:
//   1. Serve the built SPA (env.ASSETS) with worker-first routing for /api and /auth
//   2. Sign in with Freebuff auth wrap (protects every user-data route server-side)
//   3. D1 persistence: user state, credit ledger, plans, SBAR sessions, opportunity syncs
//   4. Live agent services: /api/agent/* call an OpenAI-compatible LLM gateway
//      (AI_GATEWAY_URL + AI_API_KEY + AI_MODEL) and always VALIDATE output shape;
//      if the gateway is not configured or output is invalid, deterministic
//      fallback from src/lib/agent.ts runs so the product never breaks.
//
// Security properties (from @freebuff/auth guidance):
//   - getUser(request) gates every route that touches user data → 401 when null
//   - state changes require isSameOriginRequest → 403 on foreign Origin
//   - all rows keyed by user.sub (never client-supplied identity)
//   - personalized responses use Cache-Control: private, no-store

import { createFreebuffAuth, isSameOriginRequest, type FreebuffAuth } from '@freebuff/auth'
import { generatePlan, scoreOpportunity, triageSBAR } from '../src/lib/agent'
import { OPPORTUNITIES } from '../src/data/opportunities'
import { MENTORS } from '../src/data/mentors'
import type { CareerPlan, MentorSession, PlanMilestone, SkillGap } from '../src/types'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  DB: D1Database
  FREEBUFF_CLIENT_ID: string
  FREEBUFF_ISSUER?: string
  APP_ORIGIN: string
  // OpenAI-compatible gateway (e.g. OpenLLM, OpenAI, OpenRouter)
  AI_GATEWAY_URL?: string
  AI_API_KEY?: string
  AI_MODEL?: string
}

const JSON_HEADERS = { 'content-type': 'application/json', 'cache-control': 'private, no-store' }
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })

// ---------------------------------------------------------------------------
// D1 schema (controlled server-side migration)
// ---------------------------------------------------------------------------

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS user_state (
     user_id TEXT PRIMARY KEY,
     pulse_score INTEGER NOT NULL DEFAULT 38,
     credits INTEGER NOT NULL DEFAULT 120,
     plan_json TEXT,
     updated_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS ledger (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     kind TEXT NOT NULL,
     text TEXT NOT NULL,
     credit_delta INTEGER NOT NULL DEFAULT 0,
     created_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger (user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS sessions (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     mentor_id TEXT NOT NULL,
     mentor_name TEXT NOT NULL,
     sbar_json TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'queued',
     cost INTEGER NOT NULL DEFAULT 0,
     created_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS opportunity_syncs (
     user_id TEXT NOT NULL,
     opportunity_id TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     PRIMARY KEY (user_id, opportunity_id)
   )`,
  `CREATE TABLE IF NOT EXISTS cache (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL,
     fetched_at INTEGER NOT NULL
   )`,
]

let schemaReady = false
async function ensureSchema(db: D1Database) {
  if (schemaReady) return
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)))
  schemaReady = true
}

// ---------------------------------------------------------------------------
// D1 helpers
// ---------------------------------------------------------------------------

interface UserRow {
  user_id: string
  pulse_score: number
  credits: number
  plan_json: string | null
}

async function ensureUser(db: D1Database, userId: string): Promise<UserRow> {
  await ensureSchema(db)
  const existing = await db
    .prepare('SELECT user_id, pulse_score, credits, plan_json FROM user_state WHERE user_id = ?')
    .bind(userId)
    .first<UserRow>()
  if (existing) return existing
  await db
    .prepare('INSERT OR IGNORE INTO user_state (user_id, pulse_score, credits, plan_json, updated_at) VALUES (?, 38, 120, NULL, ?)')
    .bind(userId, Date.now())
    .run()
  await addLedger(db, userId, 'credit', 'Starting grant: 120 Pulse Credits', 0) // balance already seeded; ledger entry records provenance
  return { user_id: userId, pulse_score: 38, credits: 120, plan_json: null }
}

async function addLedger(db: D1Database, userId: string, kind: string, text: string, delta: number) {
  await db
    .prepare('INSERT INTO ledger (id, user_id, kind, text, credit_delta, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), userId, kind, text, delta, Date.now())
    .run()
}

// ---------------------------------------------------------------------------
// LLM gateway (OpenAI-compatible) with strict validation + deterministic fallback
// ---------------------------------------------------------------------------

function llmConfigured(env: Env): boolean {
  return Boolean(env.AI_API_KEY)
}

async function callLLM(
  env: Env,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  opts?: { json?: boolean; maxTokens?: number },
): Promise<string | null> {
  if (!llmConfigured(env)) return null
  // One-key free setup: if no custom gateway is configured, default to the
  // OpenRouter API (free-tier models with :free model ids, OpenAI-compatible).
  const base = env.AI_GATEWAY_URL?.replace(/\/+$/, '') || 'https://openrouter.ai/api/v1'
  const url = base.endsWith('/chat/completions') ? base : `${base}/v1/chat/completions`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.AI_API_KEY}`,
        'content-type': 'application/json',
        'x-title': 'PulseUp Cloud',
        ...(env.APP_ORIGIN ? { 'http-referer': env.APP_ORIGIN } : {}),
      },
      body: JSON.stringify({
        model: env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
        messages,
        temperature: 0.2,
        max_tokens: opts?.maxTokens ?? 1200,
        ...(opts?.json !== false ? { response_format: { type: 'json_object' } } : {}),
      }),
      signal: AbortSignal.timeout(25_000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    return data.choices?.[0]?.message?.content ?? null
  } catch {
    return null
  }
}

function parseJsonLoose<T>(raw: string | null): T | null {
  if (!raw) return null
  const text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Agent validators (defense against malformed LLM output)
// ---------------------------------------------------------------------------

const MILESTONE_KINDS = new Set(['skill', 'project', 'network', 'portfolio', 'clinical'])

function validatePlan(plan: unknown): plan is CareerPlan {
  const p = plan as CareerPlan
  return (
    !!p &&
    typeof p.goal === 'string' && p.goal.length > 3 &&
    typeof p.specialty === 'string' &&
    (p.horizonMonths === 3 || p.horizonMonths === 6 || p.horizonMonths === 12) &&
    Array.isArray(p.milestones) && p.milestones.length >= 6 && p.milestones.length <= 12 &&
    p.milestones.every(
      (m: PlanMilestone) =>
        typeof m.week === 'number' && m.week >= 1 && m.week <= p.horizonMonths * 4 &&
        typeof m.title === 'string' && m.title.length > 3 && m.title.length <= 140 &&
        typeof m.detail === 'string' && m.detail.length <= 400 &&
        MILESTONE_KINDS.has(m.kind) &&
        typeof m.credits === 'number' && m.credits >= 5 && m.credits <= 50,
    ) &&
    Array.isArray(p.skillGaps) && p.skillGaps.length >= 3 && p.skillGaps.length <= 6 &&
    p.skillGaps.every(
      (g: SkillGap) =>
        typeof g.skill === 'string' && typeof g.currentLevel === 'number' && g.currentLevel >= 0 && g.currentLevel <= 100 &&
        typeof g.targetLevel === 'number' && g.targetLevel >= 0 && g.targetLevel <= 100,
    )
  )
}

const OPP_IDS = new Set(OPPORTUNITIES.map((o) => o.id))
const MENTOR_IDS = new Set(MENTORS.map((m) => m.id))

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

let auth: FreebuffAuth | undefined

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    auth ??= createFreebuffAuth({
      clientId: env.FREEBUFF_CLIENT_ID,
      issuer: env.FREEBUFF_ISSUER,
      baseUrl: env.APP_ORIGIN,
      // loopback-only relaxation, per @freebuff/auth guidance — production keeps strict https
      ...(env.APP_ORIGIN.startsWith('http://localhost') ? { allowInsecureLocalhost: true as const } : {}),
    })
    return auth.wrap(handler)(request, env)
  },
}

async function handler(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const { pathname } = url

  // ---- public routes ----
  if (pathname === '/api/nmc-updates' && request.method === 'GET') {
    return nmcUpdates(env)
  }

  if (pathname === '/api/health') {
    await ensureSchema(env.DB)
    return json({ ok: true, service: 'pulseup-cloud', liveAgents: llmConfigured(env) })
  }

  if (pathname === '/api/agents/capabilities') {
    return json({
      liveAgents: llmConfigured(env),
      engine: llmConfigured(env) ? (env.AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free') : 'pulseai-v1-deterministic',
      endpoints: [
        { route: '/api/agent/plan', purpose: 'Career Navigator plan generation (validated JSON)' },
        { route: '/api/agent/scout', purpose: 'Opportunity Scout: natural-language ranking over the catalog' },
        { route: '/api/agent/chat', purpose: 'Career copilot conversation with catalog + plan context' },
        { route: '/api/agent/triage', purpose: 'Mentor routing proposals for an SBAR ticket' },
      ],
    })
  }

  // ---- protected API class ----
  if (pathname.startsWith('/api/')) {
    await ensureSchema(env.DB)
    const user = await auth!.getUser(request)
    if (!user) return json({ error: 'Sign in required' }, 401)

    // state-changing requests must be same-origin (CSRF)
    if (request.method !== 'GET' && !isSameOriginRequest(request, env.APP_ORIGIN)) {
      return new Response(null, { status: 403 })
    }

    const uid = user.sub
    const db = env.DB

    // ---------- aggregate state ----------
    if (pathname === '/api/state' && request.method === 'GET') {
      const row = await ensureUser(db, uid)
      const events = await db
        .prepare('SELECT id, kind, text, credit_delta, created_at FROM ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT 40')
        .bind(uid)
        .all<{ id: string; kind: string; text: string; credit_delta: number; created_at: number }>()
      const sessions = await db
        .prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
        .bind(uid)
        .all<{ id: string; mentor_id: string; mentor_name: string; sbar_json: string; status: string; cost: number; created_at: number }>()
      const syncs = await db
        .prepare('SELECT opportunity_id FROM opportunity_syncs WHERE user_id = ?')
        .bind(uid)
        .all<{ opportunity_id: string }>()
      return json({
        pulseScore: row.pulse_score,
        credits: row.credits,
        plan: row.plan_json ? (JSON.parse(row.plan_json) as CareerPlan) : null,
        sessions: sessions.results.map(mapSession),
        syncedOppIds: syncs.results.map((s) => s.opportunity_id),
        events: events.results.map(mapEvent),
      })
    }

    // ---------- opportunity sync (ledger-backed) ----------
    if (pathname === '/api/state/sync-opp' && request.method === 'POST') {
      const body = await request.json<{ opportunityId?: string }>().catch(() => null)
      const oppId = body?.opportunityId
      if (!oppId || !OPP_IDS.has(oppId)) return json({ error: 'Unknown opportunity' }, 400)
      await ensureUser(db, uid)
      const existing = await db
        .prepare('SELECT 1 FROM opportunity_syncs WHERE user_id = ? AND opportunity_id = ?')
        .bind(uid, oppId)
        .first()
      if (existing) return json({ ok: true, op: 'noop' })
      const opp = OPPORTUNITIES.find((o) => o.id === oppId)!
      await db.batch([
        db.prepare('INSERT INTO opportunity_syncs (user_id, opportunity_id, created_at) VALUES (?, ?, ?)').bind(uid, oppId, Date.now()),
        db.prepare('UPDATE user_state SET credits = credits + 5, pulse_score = MIN(100, pulse_score + 2), updated_at = ? WHERE user_id = ?').bind(Date.now(), uid),
        db.prepare('INSERT INTO ledger (id, user_id, kind, text, credit_delta, created_at) VALUES (?, ?, ?, ?, 5, ?)').bind(crypto.randomUUID(), uid, 'sync', `Synced to plan: ${opp.title}`, Date.now()),
      ])
      return json({ ok: true, op: 'synced', source: 'server-ledger' })
    }

    // ---------- milestone completion ----------
    if (pathname === '/api/state/complete-milestone' && request.method === 'POST') {
      const body = await request.json<{ milestoneId?: string }>().catch(() => null)
      if (!body?.milestoneId) return json({ error: 'milestoneId required' }, 400)
      const row = await ensureUser(db, uid)
      if (!row.plan_json) return json({ error: 'No active plan' }, 409)
      const plan = JSON.parse(row.plan_json) as CareerPlan
      const milestone = plan.milestones.find((m) => m.id === body.milestoneId)
      if (!milestone) return json({ error: 'Unknown milestone' }, 404)
      const milestoneCopy = JSON.parse(row.plan_json) as CareerPlan & {
        milestones: Array<PlanMilestone & { detail: string }>
      }
      const alreadyDone = milestoneCopy.milestones.find(
        (m) => m.id === body.milestoneId && m.detail.startsWith('[done]'),
      )
      if (alreadyDone) return json({ ok: true, op: 'noop' })
      for (const m of milestoneCopy.milestones) {
        if (m.id === body.milestoneId) m.detail = `[done] ${m.detail}`
      }
      await db.batch([
        bumpJson2P(db).bind(JSON.stringify(milestoneCopy), Date.now(), uid),
        db.prepare('UPDATE user_state SET credits = credits + ?, pulse_score = MIN(100, pulse_score + 4), updated_at = ? WHERE user_id = ?').bind(milestone.credits, Date.now(), uid),
        addLedger2(db, uid, 'plan', `Milestone complete: ${milestone.title}`, milestone.credits),
      ])
      return json({ ok: true, op: 'completed', credits: milestone.credits, source: 'server-ledger' })
    }

    // ---------- SBAR mentor session ----------
    if (pathname === '/api/mentor/session' && request.method === 'POST') {
      const body = await request.json<{ mentorId?: string; sbar?: Record<string, string> }>().catch(() => null)
      const sbar = body?.sbar
      if (!sbar || !MENTOR_IDS.has(body!.mentorId ?? '')) return json({ error: 'Invalid mentor or SBAR payload' }, 400)
      const fields: Array<keyof typeof sbar> = ['situation', 'background', 'assessment', 'request']
      if (!fields.every((f) => typeof sbar[f] === 'string' && sbar[f].trim().length >= 8)) {
        return json({ error: 'Every SBAR field needs ≥8 characters' }, 400)
      }
      const mentor = MENTORS.find((m) => m.id === body!.mentorId)!
      const row = await ensureUser(db, uid)
      if (row.credits < mentor.sessionCost) return json({ error: 'Insufficient Pulse Credits' }, 402)
      const sessionId = `s_${crypto.randomUUID().slice(0, 12)}`
      await db.batch([
        db.prepare("INSERT INTO sessions (id, user_id, mentor_id, mentor_name, sbar_json, status, cost, created_at) VALUES (?, ?, ?, ?, ?, 'queued', ?, ?)").bind(sessionId, uid, mentor.id, mentor.name, JSON.stringify(sbar), mentor.sessionCost, Date.now()),
        db.prepare('UPDATE user_state SET credits = credits - ?, pulse_score = MIN(100, pulse_score + 1), updated_at = ? WHERE user_id = ?').bind(mentor.sessionCost, Date.now(), uid),
        addLedger2(db, uid, 'mentor', `SBAR escrow locked: ${mentor.name} (${mentor.sessionCost} cr)`, -mentor.sessionCost),
      ])
      return json({ ok: true, sessionId, escrow: mentor.sessionCost, source: 'server-ledger' })
    }

    if (pathname === '/api/mentor/respond' && request.method === 'POST') {
      const body = await request.json<{ sessionId?: string }>().catch(() => null)
      if (!body?.sessionId) return json({ error: 'sessionId required' }, 400)
      const row = await db
        .prepare('SELECT status, mentor_name, user_id FROM sessions WHERE id = ? AND user_id = ?')
        .bind(body.sessionId, uid)
        .first<{ status: string; mentor_name: string; user_id: string }>()
      if (!row) return json({ error: 'Unknown session' }, 404)
      if (row.status !== 'queued') return json({ ok: true, op: 'noop' })
      await db.batch([
        db.prepare("UPDATE sessions SET status = 'responded' WHERE id = ?").bind(body.sessionId),
        db.prepare('UPDATE user_state SET credits = credits + 10, updated_at = ? WHERE user_id = ?').bind(Date.now(), uid),
        addLedger2(db, uid, 'mentor', `Mentor responded: ${row.mentor_name}`, 10),
      ])
      return json({ ok: true, op: 'responded', source: 'server-ledger' })
    }

    // ---------- AGENT: career navigator plan ----------
    if (pathname === '/api/agent/plan' && request.method === 'POST') {
      const body = await request
        .json<{ specialty?: string; stage?: string; horizonMonths?: number; goal?: string }>()
        .catch(() => null)
      if (!body) return json({ error: 'Invalid payload' }, 400)
      const specialty = String(body.specialty || 'research').slice(0, 60)
      const horizon = [3, 6, 12].includes(Number(body.horizonMonths)) ? Number(body.horizonMonths) : 6
      const stage = String(body.stage || 'clinical').slice(0, 40)
      const goal = String(body.goal || '').slice(0, 400)

      await ensureUser(db, uid)
      const deterministic = generatePlan({ specialty, goal, horizonMonths: horizon, stage })

      const raw = await callLLM(env, [
        {
          role: 'system',
          content:
            'You are PulseUp Career Navigator, a career planning agent for Indian medical students. Produce JSON with keys: goal (string), specialty (string), horizonMonths (3|6|12), milestones (array of 8-10 objects: {week:number within horizon, title<=100 chars, detail<=300 chars, kind one of skill|project|network|portfolio|clinical, credits 10-40}), skillGaps (array of 4 objects: {skill, currentLevel 0-100, targetLevel 0-100}). Rules: never invent named credentials, deadlines, or affiliations; milestones must be concrete actions; scatter kinds across skill/project/network/portfolio. Output JSON only.',
        },
        {
          role: 'user',
          content: JSON.stringify({ specialty, stage, horizonMonths: horizon, goal, referenceBlueprintWeeks: deterministic.milestones.map((m) => m.week) }),
        },
      ], { maxTokens: 1600 })

      const candidate = parseJsonLoose<CareerPlan>(raw)
      const usedLLM = validatePlan(candidate)
      const plan: CareerPlan = usedLLM
        ? candidate!
        : deterministic
      plan.engine = usedLLM ? 'live-llm' : 'pulseai-v1-deterministic'

      await db.batch([
        bumpJson2P(db).bind(JSON.stringify(plan), Date.now(), uid),
        db.prepare('UPDATE user_state SET pulse_score = MIN(100, pulse_score + 8), updated_at = ? WHERE user_id = ?').bind(Date.now(), uid),
        addLedger2(db, uid, 'plan', `Career plan generated: ${plan.specialty} · ${plan.horizonMonths} months (${plan.engine})`, 0),
      ])
      return json({ ok: true, plan, engine: plan.engine })
    }

    // ---------- AGENT: opportunity scout ----------
    if (pathname === '/api/agent/scout' && request.method === 'POST') {
      const body = await request.json<{ query?: string }>().catch(() => null)
      const query = String(body?.query || '').slice(0, 300)
      if (query.length < 3) return json({ error: 'query too short' }, 400)

      const deterministic = rankByKeyword(query)
      const catalog = OPPORTUNITIES.map((o) =>
        `${o.id} | ${o.title} | ${o.org} | kind=${o.kind} | ${o.cost} | ${o.dates} | tags=${o.tags.join(',')}`,
      ).join('\n')

      const raw = await callLLM(env, [
        {
          role: 'system',
          content:
            'You are PulseUp Opportunity Scout. Given a user query and a fixed catalog, return JSON: {result: [{id, reason<=140 chars, score 0-100}]} with max 6 entries, ids MUST come from the catalog, no fabricated opportunities.',
        },
        { role: 'user', content: `Query: ${query}\n\nCatalog:\n${catalog}` },
      ])

      const candidate = parseJsonLoose<{ result?: Array<{ id?: string; reason?: string; score?: number }> }>(raw)
      let shortlist: Array<{ id: string; title: string; reason: string; score: number; url?: string }>
      let engine: string

      if (candidate?.result) {
        const valid = candidate.result.filter(
          (r) => typeof r.id === 'string' && OPP_IDS.has(r.id),
        )
        if (valid.length > 0) {
          engine = 'live-llm'
          shortlist = valid
            .slice(0, 6)
            .map((r) => {
              const opp = OPPORTUNITIES.find((o) => o.id === r.id)!
              const re = scoreOpportunity(opp, null)
              return {
                id: opp.id,
                title: opp.title,
                reason: String(r.reason || '').slice(0, 140),
                score: Math.min(100, Math.max(0, typeof r.score === 'number' ? r.score : re)),
                url: opp.url,
              }
            })
        } else {
          engine = 'pulseai-v1-deterministic'
          shortlist = deterministic.slice(0, 6)
        }
      } else {
        engine = 'pulseai-v1-deterministic'
        shortlist = deterministic.slice(0, 6)
      }
      return json({ ok: true, engine, shortlist })
    }

    // ---------- AGENT: career copilot chat ----------
    if (pathname === '/api/agent/chat' && request.method === 'POST') {
      const body = await request.json<{ messages?: Array<{ role: string; content: string }> }>().catch(() => null)
      const msgs = Array.isArray(body?.messages) ? body!.messages.slice(-10) : []
      if (msgs.length === 0) return json({ error: 'messages required' }, 400)

      const row = await ensureUser(db, uid)
      const profileContext = {
        pulseScore: row.pulse_score,
        credits: row.credits,
        plan: row.plan_json ? JSON.parse(row.plan_json) : null,
        catalogSummary: OPPORTUNITIES.slice(0, 12).map((o) => `${o.title} (${o.kind})`),
        mentors: MENTORS.map((m) => `${m.name} — ${m.role} @ ${m.institution}`),
      }

      const raw = await callLLM(env, [
        {
          role: 'system',
          content:
            'You are PulseUp Career Copilot for Indian medical students. Ground every answer in the provided profile/catalog context; do not invent deadlines, fees, or affiliations; encourage zero-PHI practice and structured SBAR mentorship. Reply concisely (max 180 words), no markdown tables. ' +
            `Context: ${JSON.stringify(profileContext)}`,
        },
        ...msgs.map((m) => ({
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: String(m.content).slice(0, 2000),
        })),
      ], { json: false, maxTokens: 500 })

      return json({
        ok: true,
        reply: raw ?? FALLBACK_REPLY,
        engine: raw ? 'live-llm' : 'fallback-guidance',
      })
    }

    // ---------- AGENT: mentor triage ----------
    if (pathname === '/api/agent/triage' && request.method === 'POST') {
      const body = await request.json<{ sbar?: Record<string, string> }>().catch(() => null)
      const sbar = body?.sbar
      if (!sbar || !['situation', 'background', 'assessment', 'request'].every((k) => typeof sbar[k] === 'string')) {
        return json({ error: 'sbar object required' }, 400)
      }
      const deterministic = triageSBAR({ situation: sbar.situation, request: sbar.request })
      const raw = await callLLM(env, [
        {
          role: 'system',
          content:
            'You are PulseUp Mentor Match. Choose the best mentor for this SBAR ticket. Return JSON {mentorId, rationale<=160 chars}. mentorId must be one of the listed ids.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            sbar,
            mentors: MENTORS.map((m) => ({ id: m.id, name: m.name, role: m.role, institution: m.institution, expertise: m.expertise, availableNow: m.availableNow })),
          }),
        },
      ])
      const candidate = parseJsonLoose<{ mentorId?: string; rationale?: string }>(raw)
      if (candidate?.mentorId && MENTOR_IDS.has(candidate.mentorId)) {
        return json({ ok: true, engine: 'live-llm', mentorId: candidate.mentorId, rationale: String(candidate.rationale || '').slice(0, 160) })
      }
      return json({ ok: true, engine: 'pulseai-v1-deterministic', ...deterministic })
    }

    return json({ error: 'Not found' }, 404)
  }

  // ---- everything else: static SPA ----
  return env.ASSETS.fetch(request)
}

// ---------------------------------------------------------------------------
// NMC compliance feed: fetch official notices from nmc.org.in/whats-new,
// parsed server-side so the SPA never scrapes a third-party site, cached in
// D1, and always labeled with provenance. On fetch failure the curated
// hand-verified fallback list is served with live:false.
// ---------------------------------------------------------------------------

const NMC_UPDATES_TTL = 6 * 60 * 60 * 1000 // 6 hours
const NMC_WHATS_NEW = 'https://nmc.org.in/whats-new'

// Hand-verified snapshot (curated at build time from official pages) used
// only when the live fetch fails — every fallback row keeps official links.
const NMC_FALLBACK_UPDATES = [
  {
    title: 'NMR portal live since 23 Aug 2024 — application remains voluntary (Lok Sabha reply, Aug 2025)',
    url: 'https://nmc.org.in/',
  },
  {
    title: 'Unified Registration & Licence-to-Practice amendment published as DRAFT for comments — not in force',
    url: 'https://nmc.org.in/whats-new',
  },
  {
    title: 'NMC clarification: no fee for NMR registration; unified pan-India portal under development (Sep 2026 report)',
    url: 'https://medicaldialogues.in/health-news/nmc/no-nmr-registration-fee-for-doctors-unified-portal-to-generate-ids-nmc-clarifies-179077',
  },
]

interface NmcUpdateItem {
  title: string
  url: string
}

async function nmcUpdates(env: Env): Promise<Response> {
  await ensureSchema(env.DB)
  const cache = await env.DB.prepare("SELECT value, fetched_at FROM cache WHERE key = 'nmc_whats_new'")
    .first<{ value: string; fetched_at: number }>()

  if (cache && Date.now() - cache.fetched_at < NMC_UPDATES_TTL) {
    return json({ ...JSON.parse(cache.value as string), cached: true, fetchedAt: cache.fetched_at })
  }

  let live = false
  let items: NmcUpdateItem[] = NMC_FALLBACK_UPDATES
  try {
    const res = await fetch(NMC_WHATS_NEW, {
      headers: { 'user-agent': 'PulseUp-Compliance-Feed/1.0 (+educational; no scraping of patient data)' },
      signal: AbortSignal.timeout(15_000),
    })
    if (res.ok) {
      const html = await res.text()
      const parsed = parseNoticeLinks(html)
      if (parsed.length >= 3) {
        live = true
        items = parsed
      }
    }
  } catch {
    // network blocked or NMC unavailable — fall through to curated snapshot
  }

  const body = {
    live,
    source: NMC_WHATS_NEW,
    items: items.slice(0, 15),
    disclaimer:
      'Items are official notices/links as published by NMC. PulseUp interprets them only after the notice text is readable and never presents draft regulations as active rules.',
  }

  const fetchedAt = Date.now()
  try {
    await env.DB.prepare(
      "INSERT INTO cache (key, value, fetched_at) VALUES ('nmc_whats_new', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, fetched_at = excluded.fetched_at",
    )
      .bind(JSON.stringify({ ...body, fetchedAt }), fetchedAt)
      .run()
  } catch {
    // D1 write failure shouldn't block the read path
  }
  return json({ ...body, cached: false, fetchedAt })
}

function cleanHtmlText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[\u200b]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseNoticeLinks(html: string): NmcUpdateItem[] {
  const seen = new Set<string>()

  // Single pass over anchors: notice titles carry class wn-title-link; other
  // notice-looking links are a fallback net.
  const wantTitles: NmcUpdateItem[] = []
  const fallback: NmcUpdateItem[] = []
  const re = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) && wantTitles.length < 25) {
    const tag = m[0]
    const href = m[1].trim()
    const text = cleanHtmlText(m[2])
    if (!text) continue
    const url = href.startsWith('http') ? href : `https://nmc.org.in${href.startsWith('/') ? '' : '/'}${href}`
    if (seen.has(url)) continue
    if (/wn-title-link/.test(tag)) {
      if (text.length >= 15) {
        seen.add(url)
        wantTitles.push({ title: text.slice(0, 220), url })
      }
    } else if (text.length >= 25 && /notice|circular|regulation|guideline|advisory|public/i.test(text) && !/^(read more|view all|more|home|contact|search|login|sign|employee corner)/i.test(text)) {
      fallback.push({ title: text.slice(0, 220), url })
    }
  }
  return wantTitles.length > 0 ? wantTitles : fallback.slice(0, 20)
}

// keyword rank fallback for scout
function rankByKeyword(query: string) {
  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3)
  return OPPORTUNITIES.map((o) => {
    const hay = `${o.title} ${o.org} ${o.tags.join(' ')} ${o.kind} ${o.cost}`.toLowerCase()
    const hits = terms.filter((t) => hay.includes(t)).length
    return {
      id: o.id,
      title: o.title,
      reason: `keyword match: ${hits} term(s) from your query`,
      score: Math.min(100, 40 + hits * 15),
      url: o.url,
    }
  })
    .sort((a, b) => b.score - a.score)
}

// D1 statement fragments reused by batch inserts
function bumpJson2P(db: D1Database) {
  return db.prepare('UPDATE user_state SET plan_json = ?, updated_at = ? WHERE user_id = ?')
}
function addLedger2(db: D1Database, userId: string, kind: string, text: string, delta: number) {
  return db
    .prepare('INSERT INTO ledger (id, user_id, kind, text, credit_delta, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), userId, kind, text, delta, Date.now())
}

function mapEvent(e: { id: string; kind: string; text: string; credit_delta: number; created_at: number }) {
  return { id: e.id, kind: e.kind, text: e.text, creditDelta: e.credit_delta, ts: e.created_at }
}
function mapSession(s: {
  id: string
  mentor_id: string
  mentor_name: string
  sbar_json: string
  status: string
  cost: number
  created_at: number
}): MentorSession {
  return {
    id: s.id,
    mentorId: s.mentor_id,
    mentorName: s.mentor_name,
    sbar: JSON.parse(s.sbar_json),
    status: s.status === 'responded' ? 'responded' : 'queued',
    cost: s.cost,
    createdAt: s.created_at,
  }
}

const FALLBACK_REPLY =
  'Agent gateway unavailable — deterministic guidance only. Suggested next steps: 1) run the Career Navigator for a milestone plan; 2) sync two relevant opportunities from the Radar into your plan; 3) open one SBAR ticket with a research-methods mentor. Milestones and credits are still tracked server-side.'
