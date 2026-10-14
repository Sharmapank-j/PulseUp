import type { Opportunity } from '../types'
import { scoreOpportunity } from '../lib/agent'

export function topOpportunities(opportunities: Opportunity[], plan: { specialty: string; goal: string } | null, limit = 8): Opportunity[] {
  const scored = opportunities
    .map((o) => ({ ...o, _score: scoreOpportunity(o, plan) }))
    .sort((a, b) => b._score - a._score)
  return scored.slice(0, limit).map(({ _score, ...o }) => o)
}
