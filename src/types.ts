export interface Opportunity {
  id: string
  kind: string
  title: string
  org: string
  url: string
  cost: string
  dates: string
  tags: string[]
  location: string
  pulseScore: number
}

export interface Mentor {
  id: string
  name: string
  specialty: string
  expertise: string[]
  rating: number
  experienceYears: number
  availableNow: boolean
  sessionCost: number
  nextSlot: string
}

export interface SbarTicket {
  id: string
  situation: string
  background: string
  assessment: string
  request: string
  status: 'queued' | 'in_progress' | 'resolved'
  mentorId: string
  authorId: string
  createdAt: number
  escrowCredits: number
  resolvedAt?: number
}

export interface CareerPlan {
  goal: string
  specialty: string
  horizonMonths: number
  stage: string
  milestones: PlanMilestone[]
  skillGaps: SkillGap[]
  createdAt: number
  engine: string
}

export interface PlanMilestone {
  id: string
  week: number
  title: string
  detail: string
  kind: string
  credits: number
}

export interface SkillGap {
  skill: string
  currentLevel: number
  targetLevel: number
}

export interface CreditLedgerEntry {
  id: string
  date: number
  source: string
  kind: string
  amount: number
  note: string
  relatedActivity?: string
}

export interface NmcUpdateItem {
  title: string
  url: string
  date?: string
  verified: boolean
}
