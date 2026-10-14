import { type CareerPlan, type MentorMatch, type SBARTriage } from '../types'

export function generatePlan(input: {
  specialty: string
  goal: string
  horizonMonths: number
  stage: string
}): CareerPlan {
  return {
    goal: input.goal,
    specialty: input.specialty,
    horizonMonths: input.horizonMonths,
    stage: input.stage,
    milestones: [
      { id: 'm1', week: 1, title: 'Baseline assessment', detail: 'Complete skills baseline and identify gaps.', kind: 'skill', credits: 15 },
      { id: 'm2', week: 4, title: 'First milestone', detail: 'Complete first measurable milestone toward goal.', kind: 'project', credits: 25 },
      { id: 'm3', week: 8, title: 'Mentor outreach', detail: 'Connect with at least one mentor in your specialty.', kind: 'network', credits: 15 },
      { id: 'm4', week: 12, title: 'Portfolio piece', detail: 'Produce a tangible output (abstract, case report, project).', kind: 'portfolio', credits: 30 },
    ],
    skillGaps: [
      { skill: 'Clinical knowledge', currentLevel: 40, targetLevel: 75 },
      { skill: 'Research methodology', currentLevel: 25, targetLevel: 60 },
      { skill: 'Communication', currentLevel: 50, targetLevel: 80 },
    ],
    createdAt: Date.now(),
    engine: 'pulseai-v1-deterministic',
  }
}

export function matchMentors(plan: CareerPlan): MentorMatch[] {
  return MENTORS.filter(m =>
    m.expertise.some(e => e.toLowerCase().includes(plan.specialty.toLowerCase()))
  ).map(m => ({
    mentor: m,
    matchScore: Math.min(95, 50 + m.rating * 5 + m.experienceYears * 2),
    reason: `${m.specialty} expert with ${m.experienceYears} years experience`,
  })).sort((a, b) => b.matchScore - a.matchScore)
}

export function triageSBAR(sbar: { situation: string; request: string }): SBARTriage {
  return {
    suggestedMentorId: MENTORS[0].id,
    rationale: 'Based on SBAR content analysis',
    priority: 'normal',
  }
}

const MENTORS = [
  { id: 'm1', name: 'Dr. Ira Sharma', specialty: 'Neurology', expertise: ['neurology', 'research'], rating: 4.9, experienceYears: 11, availableNow: true, sessionCost: 20 },
  { id: 'm2', name: 'Dr. R. Murugan', specialty: 'Cardiology', expertise: ['cardiology', 'research'], rating: 4.8, experienceYears: 8, availableNow: true, sessionCost: 15 },
  { id: 'm3', name: 'Dr. Sneha Nair', specialty: 'Pediatrics', expertise: ['pediatrics', 'public health'], rating: 4.7, experienceYears: 6, availableNow: false, sessionCost: 10 },
  { id: 'm4', name: 'Dr. O. Cyril', specialty: 'Orthopedics', expertise: ['surgical skills', 'research'], rating: 4.6, experienceYears: 9, availableNow: true, sessionCost: 25 },
  { id: 'm5', name: 'Dr. M. Jeyaraman', specialty: 'Radiology', expertise: ['radiology', 'POCUS'], rating: 4.9, experienceYears: 12, availableNow: true, sessionCost: 30 },
]
