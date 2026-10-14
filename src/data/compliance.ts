export const COMPLIANCE_RULES: Array<{ rule: string; how: string }> = [
  {
    rule: 'Never present draft regulation as active law',
    how: 'Every regulation reference carries a live/draft badge. The 2026 Unified Registration framework is shown only as a draft until the NMC notifies it.',
  },
  {
    rule: 'No credential claims, no fake certificates',
    how: 'PulseUp credits, scores, and dossiers are internal platform values — they are never represented as NMC/CME credit units or medical registrations. Simulated mentor personas are labeled as such.',
  },
  {
    rule: 'Zero-PHI by design',
    how: 'Mentorship uses structured SBAR context only. Research templates default to retrospective/de-identified designs. Nothing on the platform substitutes for clinical judgement or a licensed practitioner’s duty.',
  },
  {
    rule: 'Primary sources or honest labeling',
    how: 'Every catalog entry links its official source and carries an “official source” or “confirm first” badge. Unverified fees/deadlines say “confirm at source” instead of invented numbers.',
  },
  {
    rule: 'Research and authorship integrity',
    how: 'The research hub enforces stage-gated pipelines, locks authorship at internal review, and the anti-predatory-journal shield requires indexed/whitelisted sources. No fabricated results, ethics approvals, or references.',
  },
  {
    rule: 'Automatic, sourced updates only',
    how: 'The NMC updates feed is auto-fetched from nmc.org.in server-side, cached for freshness, and labeled with provenance + fetch time. Curated fallbacks are shown as hand-verified snapshots when the live fetch fails.',
  },
]
