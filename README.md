# PulseUp Cloud

**Career operating system for medical students** — opportunity intelligence, deterministic AI career navigation, structured mentorship, and research collaboration, focused on the Indian healthcare-education ecosystem.

Analyzed from, and inspired by, the original single-page demo (`pulseupdemo.netlify.app`); this project rebuilds that concept as a real, maintainable application instead of a hard-coded SPA monolith.

## What this project adds over the demo

| Original demo | PulseUp Cloud |
| --- | --- |
| One 1.4 MB JS bundle, no router, everything client state | Typed route tree (`react-router-dom`), 338 KB build, code-splitting ready |
| Static agent-flavored UI | `PulseAI` rule engine producing auditable, deterministic career plans (`src/lib/agent.ts`) |
| Credits as a UI number | Credit ledger as first-class state — every delta recorded with source, amount, and linked activity, persisted to `localStorage` |
| Escrow/auth as decorative strings | Working SBAR ticket flow with escrow lock, respond, and quality credit release |
| Single dark theme with tokens buried in CSS strings | Design-token system in `tailwind.config.js` (night palette, pulse palette, mono/display fonts), dark/light switch with "night call mode" |

## Modules

1. **Dashboard** — Career Score ring (animated SVG gauge), Pulse Credits HUD, top-ranked opportunities, mentor suggestions, auditable activity ledger.
2. **Opportunity Radar** — one catalog of the Indian ecosystem, with kind filters, zero-fee filter, search, and **sync-to-plan** (re-ranked live against your active plan).
3. **Career Navigator** — 4-step wizard → deterministic `PulseAI` engine generates a milestone timeline, skill-gap baselines/targets, and mentor routing. Same inputs → same plan; provenance field `pulseai-v1-deterministic`.
4. **Research Hub** — manuscript-pipeline kanban with check-pointed stage advancement and an authorship lock; grant sprint tracker; **evidence matrix** where every claim is source-linked and confidence-scored, plus a deterministic anti-predatory-journal shield.
5. **Mentorship** — mentor directory with deterministic match scores and reasons, **SBAR ticket composer** (Situation/Background/Assessment/Request, all fields required, ≥8 chars) with credit escrow, queue → respond → +10 cr release loop.
6. **Pulse Credits** — earning/spending rule tables, balance dashboard, and a full table-format ledger.
7. **NMR Readiness** — interprets India's medical-registration transition on researched facts: the live National Medical Register portal (voluntary, ₹0 fee, Aadhaar + degree + SMC-verification flow) vs the 2026 *draft* unified-registration amendment (pan-India licence — not in force), interactive per-track checklist, an **auto-fetched NMC compliance feed**, and an always-on compliance rulebook.

## Architecture

- `src/types.ts` — full domain model. No runtime enums; union types only.
- `src/store/PulseStore.tsx` — single global store (career score, credits, plan, sessions, synced opportunities, events) with `localStorage` persistence, server hydration, and a toast host.
- `src/lib/agent.ts` — PulseAI engine: `generatePlan`, `scoreOpportunity`, `matchMentors`, `triageSBAR`. Pure functions, deterministic, swappable for hosted LLM/agent services.
- `src/data/` — researched catalog, mentor directory, NMR data, compliance rulebook.
- `src/components/` — design system: Card, chip, btn/input primitives, PulseRing gauge, ECG line, shell layout with sidebar/credit HUD/theme switch/toasts.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000 (binds 0.0.0.0)
npm run build    # build:web (public/) + build:worker (dist-worker/)
npm run typecheck
npm run lint     # oxlint src worker
```

## Backend (Cloudflare Worker + D1)

- `worker/worker.ts` — D1 schema (`user_state`, `ledger`, `sessions`, `opportunity_syncs`, `cache`) with server-side auto-migration; credit escrow and ledger writes happen in the same `db.batch` as balance updates.
- Agents (`/api/agent/plan|scout|chat|triage`) call an OpenAI-compatible gateway (defaults to OpenRouter free tier via `AI_API_KEY`); every LLM output is schema-validated server-side and falls back to the deterministic engine (provenance recorded in plan/ledger).
- `/api/nmc-updates` — server-side fetch of `nmc.org.in/whats-new`, D1-cached (6h TTL), curated official-source fallback.
- Sign in with Freebuff per `@freebuff/auth`: wrap before asset/SPA serving, `getUser()` on every user-data route, `isSameOriginRequest` on mutations, rows keyed by `user.sub` only.

## Zero-PHI policy

Every mentorship, research, and observership surface in this codebase is modeled to operate without protected patient data. SBAR tickets use structured professional context only, research item templates default to retrospective/zero-PHI designs.
