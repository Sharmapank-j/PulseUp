export const OPPORTUNITIES = [
  { id: 'opp-1', kind: 'research', title: 'ICMR-STS Short-Term Studentship', org: 'Indian Council of Medical Research', url: 'https://www.icmr.nic.in/', cost: 'Free (stipend ₹20,000)', dates: 'May-Jul 2026', tags: ['research', 'ICMR', 'stipend', 'students'], location: 'Pan-India (host institutions)', pulseScore: 92 },
  { id: 'opp-2', kind: 'observership', title: 'AIIMS Delhi Elective Observership', org: 'All India Institute of Medical Sciences', url: 'https://www.aiims.edu/', cost: 'Free', dates: 'Rolling (3 months in advance)', tags: ['observership', 'AIIMS', 'clinical', 'top-institute'], location: 'New Delhi', pulseScore: 95 },
  { id: 'opp-3', kind: 'conference', title: 'CMC Vellore Pegasus Annual Conference', org: 'Christian Medical College Vellore', url: 'https://cmc-fe.org/', cost: '₹1,500 (student discount available)', dates: 'Mid Sep 2026', tags: ['conference', 'research', 'presentation', 'networking'], location: 'Vellore, Tamil Nadu', pulseScore: 80 },
  { id: 'opp-4', kind: 'research', title: 'JIPMER SPANDAN Undergraduate Research Meet', org: 'JIPMER Puducherry', url: 'https://www.jipmer.edu.in/', cost: 'Free', dates: 'Oct 2026', tags: ['research', 'presentation', 'students', 'poster'], location: 'Puducherry', pulseScore: 85 },
  { id: 'opp-5', kind: 'workshop', title: 'AIIMS Pulse AI in Healthcare Workshop', org: 'AIIMS Delhi (student body)', url: 'https://aiimspulse.in/', cost: 'Free', dates: 'Monthly weekends', tags: ['workshop', 'ai', 'skills', 'students'], location: 'New Delhi / online', pulseScore: 78 },
  { id: 'opp-6', kind: 'grant', title: 'VGST Karnataka Innovation Grant (Student Category)', org: 'Vision Group on Science and Technology, Karnataka', url: 'https://www.vistip.karnataka.gov.in/', cost: '₹1-5L grant', dates: 'Rolling', tags: ['grant', 'innovation', 'research', 'funding'], location: 'Karnataka', pulseScore: 72 },
  { id: 'opp-7', kind: 'observership', title: 'NIMHANS Clinical Observership Program', org: 'National Institute of Mental Health and Neurosciences', url: 'https://www.nimhans.ac.in/', cost: 'Free', dates: 'Rolling', tags: ['observership', 'psychiatry', 'neuro', 'clinical'], location: 'Bangalore', pulseScore: 88 },
  { id: 'opp-8', kind: 'conference', title: 'Medical Dialogues National Health Summit', org: 'Medical Dialogues', url: 'https://medicaldialogues.in/', cost: '₹2,000 (early bird)', dates: 'Nov 2026', tags: ['conference', 'networking', 'research', 'policy'], location: 'New Delhi', pulseScore: 74 },
  { id: 'opp-9', kind: 'research', title: 'AIIMS Jamia Millia Islamia Collaborative Research Initiative', org: 'AIIMS + Jamia Millia Islamia', url: 'https://www.jmi.ac.in/', cost: 'Free', dates: 'Jul 2026 onwards', tags: ['research', 'collaboration', 'students'], location: 'New Delhi', pulseScore: 82 },
  { id: 'opp-10', kind: 'workshop', title: 'SURGE Surgery Skills Workshop', org: 'Surge Foundation', url: 'https://surge.org.in/', cost: '₹2,500', dates: 'Quarterly', tags: ['surgery', 'skills', 'workshop', 'hands-on'], location: 'Multiple cities', pulseScore: 76 },
  { id: 'opp-11', kind: 'conference', title: 'AETCOM (Attitude, Ethics & Communication) National Seminar', org: 'NMC / UGC', url: 'https://www.ugc.ac.in/', cost: 'Free', dates: 'Bi-monthly', tags: ['ethics', 'communication', 'compulsory', 'NMC'], location: 'Pan-India (institutional)', pulseScore: 88 },
  { id: 'opp-12', kind: 'research', title: 'ICMR Multisite Cohort Study (Student Researcher Role)', org: 'ICMR', url: 'https://www.icmr.nic.in/', cost: 'Stipend available', dates: 'Jun 2026 - May 2027', tags: ['research', 'cohort', 'long-term', 'ICMR'], location: 'Pan-India', pulseScore: 86 },
  { id: 'opp-13', kind: 'observership', title: 'SGPGI Lucknow Clinical Observership', org: 'Sanjay Gandhi Postgraduate Institute', url: 'https://www.sgpgi.ac.in/', cost: 'Free', dates: 'Rolling', tags: ['observership', 'clinical', 'top-institute'], location: 'Lucknow', pulseScore: 84 },
  { id: 'opp-14', kind: 'conference', title: 'JIPMER Annual Medical Symposium (JAMS)', org: 'JIPMER Students Union', url: 'https://www.jipmer.edu.in/', cost: '₹800', dates: 'Dec 2026', tags: ['conference', 'students', 'presentation', 'networking'], location: 'Puducherry', pulseScore: 79 },
  { id: 'opp-15', kind: 'grant', title: 'SERBPower Women Fellowship (UG bridge program)', org: 'SERB (Science and Engineering Research Board)', url: 'https://www.serbonline.in/', cost: '₹1.5L fellowship', dates: 'Aug 2026', tags: ['grant', 'fellowship', 'research', 'women-in-science'], location: 'Pan-India', pulseScore: 70 },
  { id: 'opp-16', kind: 'research', title: 'National Medical Registry (NMR) Data Quality Project', org: 'NMC / ABDM', url: 'https://nmr-nmc.abdm.gov.in/', cost: 'Free', dates: 'Ongoing', tags: ['research', 'data', 'public-health', 'NMR'], location: 'Pan-India', pulseScore: 75 },
]

export function searchOpportunities(query: string): typeof OPPORTUNITIES {
  const q = query.toLowerCase().trim()
  if (!q) return OPPORTUNITIES
  return OPPORTUNITIES.filter(
    (o) =>
      o.title.toLowerCase().includes(q) ||
      o.org.toLowerCase().includes(q) ||
      o.tags.some((t) => t.toLowerCase().includes(q)) ||
      o.location.toLowerCase().includes(q)
  )
}

export function filterByKind(list: typeof OPPORTUNITIES, kind: string): typeof OPPORTUNITIES {
  if (kind === 'all') return list
  return list.filter((o) => o.kind === kind)
}

export function filterZeroFee(list: typeof OPPORTUNITIES, zeroFeeOnly: boolean): typeof OPPORTUNITIES {
  if (!zeroFeeOnly) return list
  return list.filter((o) => o.cost.toLowerCase().includes('free'))
}

export function sortByScore(list: typeof OPPORTUNITIES): typeof OPPORTUNITIES {
  return [...list].sort((a, b) => b.pulseScore - a.pulseScore)
}
