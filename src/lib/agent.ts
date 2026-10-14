// PulseAI v1 — deterministic rules engine.
//
// Architecture note: this module is deliberately a pure function library so it
// can be swapped for a real agent service (LLM-backed) later. UI only depends
// on the `CareerPlan` / score shapes, never on how they were produced.
//
// Guarantees a deterministic engine gives us:
//   * same input → same plan (testable, auditable)
//   * no hallucinated credentials, deadlines, or claims
//   * every recommendation is traceable to a rule

import type {
  CareerPlan,
  Mentor,
  Opportunity,
  PlanMilestone,
  SkillGap,
} from '../types'
import { MENTORS } from '../data/mentors'

export interface PlanInput {
  specialty: string
  goal: string
  horizonMonths: number
  stage: string // 'pre-clinical' | 'para-clinical' | 'clinical' | 'internship'
}

let milestoneSeq = 0
const nextId = () => `pm_${Date.now().toString(36)}_${(milestoneSeq++).toString(36)}`

// Specialty-specific research track titles. Everything else is generic scaffolding.
const SPECIALTY_TRACKS: Record<string, { project: string; reading: string; mentorExp: string[] }> = {
  research: {
    project: 'Frame answerable research question (PICO) in the specialty of interest',
    reading: 'Structured reading habit: 3 PubMed abstracts per week via a reference manager',
    mentorExp: ['research', 'publications', 'ICMR-STS'],
  },
  cardiology: {
    project: 'Retrospective ECG dataset audit (≥30 anonymised de-identified records, zero PHI)',
    reading: 'Weekly ECG pattern drills + landmark cardiology trial summaries',
    mentorExp: ['cardiology', 'research', 'ecg'],
  },
  surgery: {
    project: 'Laparoscopic skills log + single-institution surgical outcomes mini-audit',
    reading: 'Surgical tech briefs: operative videos with technique notes',
    mentorExp: ['surgical skills', 'laparoscopy', 'observership'],
  },
  pediatrics: {
    project: 'Multicenter clinical audit of growth-chart documentation practices',
    reading: 'Case-based pediatrics drills with quiz conditioning',
    mentorExp: ['pediatrics', 'case discussion', 'quiz prep'],
  },
  'emergency medicine': {
    project: 'Triage-time retrospective audit in a district casualty digitising SBAR handovers',
    reading: 'ECG/radiology rapid-recognition drills; ACLS protocol flashcards',
    mentorExp: ['ecg', 'emergency', 'POCUS'],
  },
  radiology: {
    project: 'Structured image-report template study with a teaching-hospital dataset',
    reading: 'Pattern-based film reading drills; observership preparedness',
    mentorExp: ['observership', 'POCUS'],
  },
  default: {
    project: 'Small multi-step clinical audit or retrospective chart review (zero-PHI design)',
    reading: 'Specialty primer reading with weekly abstract extraction',
    mentorExp: ['research', 'career planning'],
  },
}

const DEFAULT_TRACK = SPECIALTY_TRACKS.default

function trackFor(specialty: string) {
  const key = specialty.trim().toLowerCase()
  return SPECIALTY_TRACKS[key] ?? DEFAULT_TRACK
}

export function generatePlan(input: PlanInput): CareerPlan {
  const track = trackFor(input.specialty)
  const months = input.horizonMonths

  const milestoneBlueprints: Array<
    Omit<PlanMilestone, 'id'> & { weekOf?: 'early' | 'mid' | 'late' }
  > = [
    {
      week: 1,
      title: 'Career diagnostic + skill-gap baseline',
      detail: `Complete the PulseUp skills baseline for the ${input.specialty} pathway; log current certifications, research exposure, and target milestones.`,
      kind: 'skill',
      credits: 15,
    },
    {
      week: 2,
      title: 'Set up research infrastructure',
      detail:
        'Reference manager, Zotero library, PubMed alerts for the specialty. Zero-PHI data policy adopted.',
      kind: 'skill',
      credits: 10,
    },
    {
      week: 4,
      title: 'Complete a methodology module',
      detail:
        'Study design, bias, and sample-size basics (biostatistics short course or ICMR module). Produces a written artifact for the portfolio.',
      kind: 'skill',
      credits: 20,
    },
    {
      week: 6,
      title: 'Start the anchor project',
      detail: track.project,
      kind: 'project',
      credits: 25,
    },
    {
      week: Math.max(8, Math.round(months * 4 * 0.15)),
      title: 'Open 2 mentor SBAR tickets',
      detail: `Send structured SBAR tickets to mentors with expertise: ${track.mentorExp.join(', ')}. Ask for one review and one direction-setting session.`,
      kind: 'network',
      credits: 15,
    },
    {
      week: Math.max(10, Math.round(months * 4 * 0.3)),
      title: 'Earmark an institutional event / abstract',
      detail:
        'Pick one CMC Pegasus / AIIMS Pulse / JIPMER SPANDAN circuit event and register; draft the abstract skeleton.',
      kind: 'portfolio',
      credits: 20,
    },
    {
      week: Math.max(14, Math.round(months * 4 * 0.55)),
      title: 'Execute the data/work collection sprint',
      detail:
        'Timed sprint: finish the anchor project data/work phase with weekly PulseUp sprint tickets and a burndown check every Friday.',
      kind: 'project',
      credits: 30,
    },
    {
      week: Math.max(16, Math.round(months * 4 * 0.75)),
      title: 'Draft + internal review',
      detail:
        'Write the abstract/manuscript draft; run two internal peer-review passes before any external submission.',
      kind: 'project',
      credits: 35,
    },
    {
      week: Math.max(18, months * 4 - 2),
      title: 'Portfolio + passport update',
      detail:
        'Log the completed deliverable in the Medical Passport; request mentor verification; export the dossier.',
      kind: 'portfolio',
      credits: 25,
    },
    {
      week: months * 4,
      title: 'Retrospective + next-quarter plan',
      detail:
        'Score progress against the skill baseline, archive what worked, and frame the next 90-day goal.',
      kind: 'skill',
      credits: 15,
    },
  ]

  const milestones = milestoneBlueprints.map((m) => ({ ...m, id: nextId() }))

  const skillGaps: SkillGap[] = [
    { skill: 'Research methodology', currentLevel: 25, targetLevel: input.horizonMonths >= 12 ? 75 : 60 },
    { skill: 'Academic writing', currentLevel: 30, targetLevel: input.horizonMonths >= 12 ? 70 : 55 },
    {
      skill: `${input.specialty} pattern recognition`,
      currentLevel: 35,
      targetLevel: input.horizonMonths >= 12 ? 80 : 65,
    },
    { skill: 'Biostatistics', currentLevel: 20, targetLevel: 50 },
    { skill: 'Professional networking', currentLevel: 25, targetLevel: 60 },
  ]

  return {
    goal: input.goal,
    specialty: input.specialty,
    horizonMonths: input.horizonMonths,
    stage: input.stage,
    milestones,
    skillGaps,
    createdAt: Date.now(),
    engine: 'pulseai-v1-deterministic',
  }
}

// Opportunity scoring: relevance of a catalog item to an active plan speciality + synced plan gaps.
export function scoreOpportunity(opp: Opportunity, plan: CareerPlan | null): number {
  if (!plan) return opp.pulseScore
  let score = opp.pulseScore
  const spec = plan.specialty.toLowerCase()

  // specialty-tag and text affinity
  const haystack = `${opp.title} ${opp.org} ${opp.tags.join(' ')}`.toLowerCase()
  if (haystack.includes(spec)) score += 6

  // goal-shape affinity
  if (
    plan.goal.includes('research') &&
    (opp.kind === 'research' || opp.kind === 'grant')
  )
    score += 5

  // never reward cost for a student plan: free/zero-fee items rank higher
  if (opp.cost.toLowerCase().includes('free')) score += 3

  // grade by recency of window
  if (opp.dates.toLowerCase().startsWith('rolling') || opp.dates.toLowerCase().includes('year-round'))
    score += 2

  return Math.min(100, score)
}

export interface MentorMatch {
  mentor: Mentor
  matchScore: number
  reason: string
}

export function matchMentors(plan: CareerPlan | null): MentorMatch[] {
  return MENTORS.map((mentor) => {
    let matchScore = 50
    const reasons: string[] = []

    if (plan) {
      const track = trackFor(plan.specialty)
      const overlap = mentor.expertise.filter((e) => track.mentorExp.includes(e.toLowerCase().trim()))
      if (overlap.length > 0) {
        matchScore += overlap.length * 12
        reasons.push(`expertise overlap: ${overlap.join(', ')}`)
      }
      if (
        plan.goal.toLowerCase().includes('research') &&
        mentor.expertise.some((e) => e.includes('research'))
      ) {
        matchScore += 8
        reasons.push('supports research-first goals')
      }
    }

    matchScore += mentor.rating * 4 + Math.min(6, mentor.experienceYears)
    if (mentor.availableNow) {
      matchScore += 5
      reasons.push('available now')
    }
    if (mentor.sessionCost <= 30) reasons.push('low credit cost')

    return {
      mentor,
      matchScore: Math.min(99, matchScore),
      reason: reasons.length ? reasons.join(' · ') : 'general practitioner mentor',
    }
  }).sort((a, b) => b.matchScore - a.matchScore)
}

// SBAR triage: routes a ticket to the best-fit mentor the structured way.
export function triageSBAR(sbar: { situation: string; request: string }): { mentorId: string; rationale: string } {
  const text = `${sbar.situation} ${sbar.request}`.toLowerCase()
  const scores = MENTORS.map((m) => ({
    mentor: m,
    score: m.expertise.reduce((acc, e) => acc + (text.includes(e) ? 10 : 0), 0) + m.rating * 2,
  }))
  scores.sort((a, b) => b.score - a.score)
  const best = scores[0].mentor
  return {
    mentorId: best.id,
    rationale: `Routed by SBAR keyword affinity → "${best.expertise.find((e) => text.includes(e)) ?? 'highest-rated'}" · ${best.name}`,
  }
}
