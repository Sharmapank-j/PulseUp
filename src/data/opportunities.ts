export const OPPORTUNITIES = [
  { id: 'opp-1', kind: 'research', title: 'ICMR-STS Projects 2026', org: 'ICMR', url: 'https://www.icmr.nic.in/', cost: 'Free', dates: 'Jun-Aug 2026', tags: ['research', 'ICMR', 'students'], location: 'Pan-India', pulseScore: 85 },
  { id: 'opp-2', kind: 'observership', title: 'AIIMS Observership Program', org: 'AIIMS Delhi', url: 'https://www.aiims.edu/', cost: 'Free', dates: 'Rolling', tags: ['observership', 'AIIMS', 'clinical'], location: 'New Delhi', pulseScore: 90 },
  { id: 'opp-3', kind: 'conference', title: 'CMC Pegasus Medical Conference', org: 'Christian Medical College', url: 'https://cmcvexperts.com/', cost: '₹500-2000', dates: 'Sep 2026', tags: ['conference', 'research', 'presentation'], location: 'Vellore', pulseScore: 78 },
  { id: 'opp-4', kind: 'research', title: 'JPIMER SPANDAN Research Meet', org: 'JIPMER Puducherry', url: 'https://www.jipmer.edu.in/', cost: 'Free', dates: 'Oct 2026', tags: ['research', 'presentation', 'students'], location: 'Puducherry', pulseScore: 82 },
  { id: 'opp-5', kind: 'workshop', title: 'AIIMS Pulse Workshop Series', org: 'AIIMS', url: 'https://www.aiims.edu/', cost: 'Free', dates: 'Monthly', tags: ['workshop', 'skills', 'students'], location: 'New Delhi', pulseScore: 75 },
  { id: 'opp-6', kind: 'grant', title: 'VGST Innovation Grant', org: 'VGST Karnataka', url: 'https://v IGM.Karnataka.gov.in/', cost: '₹1-5L', dates: 'Rolling', tags: ['grant', 'innovation', 'research'], location: 'Karnataka', pulseScore: 70 },
  { id: 'opp-7', kind: 'observership', title: 'NIMHANS Clinical Observership', org: 'NIMHANS Bangalore', url: 'https://www.nimhans.ac.in/', cost: 'Free', dates: 'Rolling', tags: ['observership', 'psychiatry', 'clinical'], location: 'Bangalore', pulseScore: 88 },
  { id: 'opp-8', kind: 'conference', title: 'Medical Dialogues National Summit', org: 'Medical Dialogues', url: 'https://medicaldialogues.in/', cost: '₹1000-5000', dates: 'Nov 2026', tags: ['conference', 'networking', 'research'], location: 'New Delhi', pulseScore: 72 },
]

export function searchOpportunities(query: string): typeof OPPORTUNITIES {
  const q = query.toLowerCase()
  return OPPORTUNITIES.filter(o =>
    o.title.toLowerCase().includes(q) ||
    o.org.toLowerCase().includes(q) ||
    o.tags.some(t => t.toLowerCase().includes(q))
  )
}

export function filterByKind(opportunities: typeof OPPORTUNITIES, kind: string): typeof OPPORTUNITIES {
  if (kind === 'all') return opportunities
  return opportunities.filter(o => o.kind === kind)
}

export function filterByCost(opportunities: typeof OPPORTUNITIES, freeOnly: boolean): typeof OPPORTUNITIES {
  if (!freeOnly) return opportunities
  return opportunities.filter(o => o.cost.toLowerCase().includes('free'))
}
