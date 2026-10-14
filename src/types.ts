// PulseUp Cloud — domain types
// Note: no runtime enums (erasableSyntaxOnly) — union types only.

export type OpportunityKind =
  | 'research'
  | 'event'
  | 'certification'
  | 'observership'
  | 'grant'
  | 'quiz'
  | 'exam'
  | 'webinar'

export interface Opportunity {
  id: string
  title: string
  org: string
  kind: OpportunityKind
  region: string
  dates: string
  cost: string
  eligibility: string
  perks: string[]
  tags: string[]
  pulseScore: number // 0–100 baseline relevance for a pre-clinical/clinical UG building a research+portfolio profile
  url?: string
  statusNote?: string
  verified: 'official' | 'provisional'
}

export interface Mentor {
  id: string
  name: string
  role: string
  institution: string
  expertise: string[]
  experienceYears: number
  rating: number // 0–5
  ratingCount: number
  availableNow: boolean
  sessionCost: number // Pulse Credits per SBAR ticket
  bio: string
}

export type MilestoneKind = 'skill' | 'project' | 'network' | 'portfolio' | 'clinical'

export interface PlanMilestone {
  id: string
  week: number // week offset from plan start
  title: string
  detail: string
  kind: MilestoneKind
  credits: number // credits awarded when completed
}

export interface SkillGap {
  skill: string
  currentLevel: number // 0–100
  targetLevel: number
}

export interface CareerPlan {
  goal: string
  specialty: string
  horizonMonths: number
  stage: string
  milestones: PlanMilestone[]
  skillGaps: SkillGap[]
  createdAt: number
  engine: string // provenance: 'pulseai-v1-deterministic'
}

export interface SBAR {
  situation: string
  background: string
  assessment: string
  request: string
}

export interface MentorSession {
  id: string
  mentorId: string
  mentorName: string
  sbar: SBAR
  status: 'queued' | 'responded'
  cost: number
  createdAt: number
}

export interface PulseEvent {
  id: string
  ts: number
  kind: 'credit' | 'plan' | 'sync' | 'profile' | 'mentor'
  text: string
  creditDelta?: number
}

export interface PulseState {
  pulseScore: number
  credits: number
  syncedOppIds: string[]
  plan: CareerPlan | null
  sessions: MentorSession[]
  events: PulseEvent[]
  nmrChecked: string[]
}

export const PULSE_SCORE_MAX = 100
