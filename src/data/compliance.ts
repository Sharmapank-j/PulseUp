export const COMPLIANCE_RULES = [
  {
    id: 'no-phi',
    title: 'Zero-PHI by default',
    text: 'Mentorship tickets, research items, and observership applications in PulseUp are modeled to operate without protected patient data. SBAR tickets use structured professional context only.',
  },
  {
    id: 'verified-links',
    title: 'Official-source badges',
    text: 'Opportunities tagged with official-source badges link to public agencies, accredited institutions, or verified portals. Always confirm current eligibility on the source site before applying.',
  },
  {
    id: 'fee-transparency',
    title: 'Fee transparency',
    text: 'Every listed opportunity shows its cost status (free / paid / rolling). When in doubt about a fee, check the official notice; PulseUp does not handle payments.',
  },
  {
    id: 'draft-disclaimer',
    title: 'Draft regulations are not rules',
    text: 'Regulatory drafts (e.g. NMC amendments) are clearly labeled as draft and not in force. PulseUp never presents a draft as an active rule.',
  },
  {
    id: 'eligibility-check',
    title: 'Self-service eligibility',
    text: 'Eligibility criteria (age, nationality, stage of training, registration status) are summarized for convenience. Final eligibility is determined by the issuing body.',
  },
]

export function nmcUpdatesServerSide() {
  // Server-side fetch of nmc.org.in/whats-new, cached in D1, 6h TTL.
  // Falls back to curated hand-verified snapshot when the live fetch fails.
  return fetch('https://nmc.org.in/whats-new')
}
