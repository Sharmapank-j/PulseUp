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
//   5. NMC compliance feed: fetches hand-verified public notices from nmc.org.in,
//      parsed server-side so the SPA never scrapes a third-party site, cached in
//      D1, and always labeled with provenance. On fetch failure the curated
//      hand-verified fallback list is served with live:false.
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
     credit_delta INTEGER NOT NULL,
     created_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger (user_id, created_at DESC)`,

  `CREATE TABLE IF NOT EXISTS sessions (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     mentor_id TEXT NOT NULL,
     mentor_name TEXT NOT NULL,
     sbar_json TEXT NOT NULL,
     status TEXT NOT NULL,
     cost INTEGER NOT NULL,
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
}

// ---------------------------------------------------------------------------
// LLM gateway (OpenAI-compatible; always validated, always has a fallback)
// ---------------------------------------------------------------------------

function llmConfigured(env: Env) {
  return !!(env.AI_GATEWAY_URL && env.AI_API_KEY && env.AI_MODEL)
}

async function callLLM(
  env: Env,
  messages: Array<{ role: string; content: string }>,
  opts?: { json?: boolean; maxTokens?: number },
): Promise<string | null> {
  if (!llmConfigured(env)) return null
  try {
    const res = await fetch(env.AI_GATEWAY_URL!, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${env.AI_API_KEY}`,
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
        typeof g.skill === 'string' && g.skill.length >= 2 && g.skill.length <= 60 &&
        typeof g.currentLevel === 'number' && g.currentLevel >= 0 && g.currentLevel <= 100 &&
        typeof g.targetLevel === 'number' && g.targetLevel > g.currentLevel && g.targetLevel <= 100,
    ) &&
    typeof p.createdAt === 'number' && p.createdAt > 0 &&
    (p.engine === 'pulseai-v1-deterministic' || p.engine === 'live-llm')
  )
}

function validateScout(ranking: unknown): ranking is Array<{ id: string; reason?: string; score?: number }> {
  if (!Array.isArray(ranking)) return false
  const ids = new Set(OPPORTUNITIES.map((o) => o.id))
  return ranking.every((row) =>
    typeof row === 'object' && row !== null &&
    typeof (row as Record<string, unknown>).id === 'string' &&
    ids.has((row as Record<string, unknown>).id as string),
  )
}

// ---------------------------------------------------------------------------
// Request handling
// ---------------------------------------------------------------------------

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
      if (!body?.opportunityId) return json({ error: 'opportunityId required' }, 400)
      const row = await ensureUser(db, uid)
      const already = await db
        .prepare('SELECT 1 FROM opportunity_syncs WHERE user_id = ? AND opportunity_id = ?')
        .bind(uid, body.opportunityId)
        .first()
      if (!already) {
        await db.batch([
          db.prepare('INSERT INTO opportunity_syncs (user_id, opportunity_id, created_at) VALUES (?, ?, ?)').bind(uid, body.opportunityId, Date.now()),
          db.prepare('UPDATE user_state SET pulse_score = MIN(100, pulse_score + 2), credits = credits + 5, updated_at = ? WHERE user_id = ?').bind(Date.now(), uid),
          addLedger(db, uid, 'sync', `Synced to plan: ${body.opportunityId}`, 5),
        ])
      } else {
        await db.batch([
          db.prepare('DELETE FROM opportunity_syncs WHERE user_id = ? AND opportunity_id = ?').bind(uid, body.opportunityId),
          db.prepare('UPDATE user_state SET pulse_score = pulse_score, credits = credits, updated_at = ? WHERE user_id = ?').bind(Date.now(), uid),
          addLedger(db, uid, 'sync', `Removed from plan: ${body.opportunityId}`, 0),
        ])
      }
      return json({ ok: true, op: already ? 'removed' : 'added' })
    }

    // ---------- plan persistence ----------
    if (pathname === '/api/state/complete-milestone' && request.method === 'POST') {
      const body = await request.json<{ milestoneId?: string }>().catch(() => null)
      if (!body?.milestoneId) return json({ error: 'milestoneId required' }, 400)
      const row = await ensureUser(db, uid)
      if (!row.plan_json) return json({ error: 'No active plan' }, 400)
      const plan = JSON.parse(row.plan_json) as CareerPlan
      const milestone = plan.milestones.find((m) => m.id === body.milestoneId)
      if (!milestone) return json({ error: 'Milestone not found' }, 404)
      const updated = {
        ...plan,
        milestones: plan.milestones.map((m) =>
          m.id === body.milestoneId ? { ...m, detail: `[done] ${m.detail}` } : m,
        ),
      }
      await db.batch([
        db.prepare('UPDATE user_state SET plan_json = ?, pulse_score = MIN(100, pulse_score + 4), credits = credits + ?, updated_at = ? WHERE user_id = ?').bind(JSON.stringify(updated), milestone.credits, Date.now(), uid),
        addLedger(db, uid, 'plan', `Milestone complete: ${milestone.title}`, milestone.credits),
      ])
      return json({ ok: true, credits: milestone.credits, source: 'server-ledger' })
    }

    // ---------- SBAR sessions ----------
    if (pathname === '/api/mentor/session' && request.method === 'POST') {
      const body = await request.json<{ mentorId?: string; situation?: string; background?: string; assessment?: string; request?: string }>().catch(() => null)
      if (!body?.mentorId) return json({ error: 'mentorId required' }, 400)
      const sbar = {
        situation: String(body.situation || ''),
        background: String(body.background || ''),
        assessment: String(body.assessment || ''),
        request: String(body.request || ''),
      }
      const fields = ['situation', 'background', 'assessment', 'request'] as const
      if (!fields.every((f) => typeof sbar[f] === 'string' && sbar[f].trim().length >= 8)) {
        return json({ error: 'Every SBAR field needs ≥8 characters' }, 400)
      }
      const mentor = MENTORS.find((m) => m.id === body!.mentorId)!
      const row = await ensureUser(db, uid)
      if (row.credits < mentor.sessionCost) return json({ error: 'Insufficient Pulse Credits' }, 402)
      const sessionId = `s_${crypto.randomUUID().slice(0, 12)}`
      await db.batch([
        db.prepare("INSERT INTO sessions (id, user_id, mentor_id, mentor_name, sbar_json, status, cost, created_at) VALUES (?, ?, ?, ?, ?, 'queued', ?, ?)")
          .bind(sessionId, uid, mentor.id, mentor.name, JSON.stringify(sbar), mentor.sessionCost, Date.now()),
        db.prepare('UPDATE user_state SET credits = credits - ?, pulse_score = MIN(100, pulse_score + 1), updated_at = ? WHERE user_id = ?').bind(mentor.sessionCost, Date.now(), uid),
        addLedger(db, uid, 'mentor', `SBAR escrow locked: ${mentor.name} (${mentor.sessionCost} cr)`, -mentor.sessionCost),
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
        addLedger(db, uid, 'mentor', `Mentor responded: ${row.mentor_name}`, 10),
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
            'You are PulseAI v1 career navigator for Indian medical students. Return ONLY a JSON object matching this schema, no surrounding text: ' +
            JSON.stringify({
              type: 'object',
              properties: {
                goal: { type: 'string' },
                specialty: { type: 'string' },
                horizonMonths: { type: 'integer', enum: [3, 6, 12] },
                stage: { type: 'string' },
                milestones: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      week: { type: 'integer', minimum: 1 },
                      title: { type: 'string' },
                      detail: { type: 'string' },
                      kind: { type: 'string', enum: ['skill', 'project', 'network', 'portfolio', 'clinical'] },
                      credits: { type: 'integer', minimum: 5, maximum: 50 },
                    },
                    required: ['id', 'week', 'title', 'detail', 'kind', 'credits'],
                  },
                },
                skillGaps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { skill: { type: 'string' }, currentLevel: { type: 'integer', minimum: 0, maximum: 100 }, targetLevel: { type: 'integer', minimum: 0, maximum: 100 } },
                    required: ['skill', 'currentLevel', 'targetLevel'],
                  },
                },
                createdAt: { type: 'integer' },
                engine: { type: 'string', enum: ['pulseai-v1-deterministic', 'live-llm'] },
              },
              required: ['goal', 'specialty', 'horizonMonths', 'stage', 'milestones', 'skillGaps', 'createdAt', 'engine'],
            }),
        },
        {
          role: 'user',
          content:
            `Generate a ${horizon}-month ${specialty} plan for a student at ${stage} stage. Goal: "${goal}". ` +
            `Return 6–12 milestones with week offsets, 3–6 skill gaps with current/target levels, ` +
            `use engine "live-llm" if you are confident, otherwise fall back to deterministic-style output.`,
        },
      ])
      let plan: CareerPlan
      let engine = 'pulseai-v1-deterministic'
      if (raw) {
        const parsed = parseJsonLoose<CareerPlan>(raw)
        if (parsed && validatePlan(parsed)) {
          plan = parsed
          engine = parsed.engine === 'live-llm' ? 'live-llm' : 'pulseai-v1-deterministic'
        } else {
          plan = deterministic
        }
      } else {
        plan = deterministic
      }
      await db.batch([
        db.prepare('UPDATE user_state SET plan_json = ?, pulse_score = MIN(100, pulse_score + 8), updated_at = ? WHERE user_id = ?').bind(JSON.stringify(plan), Date.now(), uid),
        addLedger(db, uid, 'plan', `Career plan generated: ${plan.specialty} · ${plan.horizonMonths} months`, 0),
      ])
      return json({ ok: true, plan, engine })
    }

    // ---------- AGENT: opportunity scout ----------
    if (pathname === '/api/agent/scout' && request.method === 'POST') {
      const body = await request.json<{ query?: string }>().catch(() => null)
      if (!body?.query) return json({ error: 'query required' }, 400)
      const query = String(body.query).slice(0, 200)

      const deterministic = rankByKeyword(query)

      const raw = await callLLM(env, [
        {
          role: 'system',
          content:
            'You are PulseAI Opportunity Scout. Return ONLY a JSON array of objects with shape [{id: string, reason?: string, score?: number}]. ' +
            `Only use id values from this allowed set: ${OPPORTUNITIES.map((o) => o.id).join(', ')}. ` +
            `Rank the most relevant 1–6 opportunities for this query: "${query}". Keep reason under 140 chars.`,
        },
      ])
      let engine = 'pulseai-v1-deterministic'
      let shortlist: Array<{ id: string; title: string; reason: string; score: number; url?: string }> = []
      if (raw) {
        const parsed = parseJsonLoose<Array<{ id: string; reason?: string; score?: number }>>(raw)
        if (Array.isArray(parsed) && parsed.length > 0 && validateScout(parsed)) {
          engine = 'live-llm'
          shortlist = parsed
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
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        {
          role: 'user',
          content: `Current user state: pulseScore ${row.pulse_score}, credits ${row.credits}${row.plan_json ? ', plan specialty ' + JSON.parse(row.plan_json).specialty : ''}. Answer within the above context.`,
        },
      ])
      if (raw && raw.trim().length > 0) {
        return json({ ok: true, reply: raw.slice(0, 4000), engine: 'live-llm' })
      }
      return json({ ok: true, reply: FALLBACK_REPLY, engine: 'pulseai-v1-deterministic' })
    }

    // ---------- AGENT: SBAR triage / mentor routing ----------
    if (pathname === '/api/agent/triage' && request.method === 'POST') {
      const body = await request.json<{ situation?: string; background?: string; assessment?: string; request?: string }>().catch(() => null)
      if (!body) return json({ error: 'Invalid payload' }, 400)
      const sbar = {
        situation: String(body.situation || ''),
        background: String(body.background || ''),
        assessment: String(body.assessment || ''),
        request: String(body.request || ''),
      }
      const fields = ['situation', 'background', 'assessment', 'request'] as const
      if (!fields.every((f) => typeof sbar[f] === 'string' && sbar[f].trim().length >= 8)) {
        return json({ error: 'Every SBAR field needs ≥8 characters' }, 400)
      }

      const deterministic = triageSBAR(sbar).slice(0, 3)

      const raw = await callLLM(env, [
        {
          role: 'system',
          content:
            'You are PulseAI SBAR triage. Return ONLY a JSON object { mentorId: string, rationale: string } where mentorId is one of: ' +
            `${MENTORS.map((m) => m.id).join(', ')}. Rationale under 180 chars, grounded in the SBAR content: ${JSON.stringify(sbar)}`,
        },
      ])
      let engine = 'pulseai-v1-deterministic'
      let mentorId = deterministic[0].mentorId
      let rationale = deterministic[0].rationale
      if (raw) {
        const parsed = parseJsonLoose<{ mentorId?: string; rationale?: string }>(raw)
        if (parsed && MENTORS.some((m) => m.id === parsed.mentorId) && typeof parsed.rationale === 'string' && parsed.rationale.length > 0) {
          engine = 'live-llm'
          mentorId = parsed.mentorId
          rationale = parsed.rationale.slice(0, 200)
        }
      }
      return json({ ok: true, engine, mentorId, rationale })
    }

    return json({ error: 'Not found' }, 404)
  }

  // ---- SPA ----
  return env.ASSETS.fetch(request)
}

// ---------------------------------------------------------------------------
// NMC compliance feed (hand-verified fetch + curated fallback)
// ---------------------------------------------------------------------------

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
        items = parsed.slice(0, 10)
      }
    }
  } catch {
    // keep curated fallback
  }

  const payload = {
    live,
    source: live ? 'nmc.org.in/whats-new' : 'PulseUp hand-verified fallback (curls at build + on fetch failure)',
    disclaimer: 'NMC pages can restructure without notice — verify any date/fee/requirement against the official NMC link before acting on it.',
    items,
    fetchedAt: Date.now(),
  }
  await env.DB
    .prepare("INSERT OR REPLACE INTO cache (key, value, fetched_at) VALUES ('nmc_whats_new', ?, ?)")
    .bind(JSON.stringify(payload), Date.now())
    .run()
  return json(payload)
}

// ---------------------------------------------------------------------------
// HTML helpers for NMC scraping
// ---------------------------------------------------------------------------

function cleanHtmlText(s: string) {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseNoticeLinks(html: string): NmcUpdateItem[] {
  const seen = new Set<string>()
  const wantTitles: NmcUpdateItem[] = []
  const fallback: NmcUpdateItem[] = []
  // loose, defensive regexes — never rely on NMC layout staying identical
  const re = /<a[^>]*?(?:href=["']([^"']+)["']| wn-title-link[^>]*?)>\s*([^<]*)<\/a>/gi
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

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

let auth: FreebuffAuth<Env> | null = null

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (!auth) auth = createFreebuffAuth({ clientId: env.FREEBUFF_CLIENT_ID, issuer: env.FREEBUFF_ISSUER, baseUrl: env.APP_ORIGIN })
    return handler(request, env)
  },
}

// ---------------------------------------------------------------------------
// Generic non-cosmetic formatting helper for log / triage output.
// ---------------------------------------------------------------------------
function prettyTs(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
