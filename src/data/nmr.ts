export const NMR_TRACKS = [
  {
    id: 'nmr-portal',
    title: 'National Medical Register (NMR)',
    status: 'live',
    statusNote: 'Live since 23 Aug 2024 · voluntary per govt reply in Lok Sabha (Aug 2025)',
    what: 'National electronic register of registered allopathic doctors under the NMC, with Aadhaar-linked identity verification. Your application is routed: NMR portal → State Medical Council (where first registered) → college verification → NMC approval → NMR ID.',
    who: 'Doctors already registered on the Indian Medical Register / State registers — students enter the track after State Medical Council registration on completing internship.',
    feeNote: 'No fee for NMR registration (NMC official clarification, Sep 2026).',
    links: [
      { label: 'Official NMC homepage with NMR link', url: 'https://nmc.org.in/', verified: true },
      { label: 'NMR portal (ABDM-hosted route, official)', url: 'https://nmr-nmc.abdm.gov.in/nmr/v3/', verified: true },
    ],
    timeline: [
      { date: '23 Aug 2024', event: 'NMR portal launched (Aadhaar-linked identity announced)', verified: true },
      { date: 'Aug 2025', event: 'Government confirms NMR ID application is voluntary (Lok Sabha reply)', verified: true },
      { date: 'Sep 2026', event: 'NMC confirms ₹0 NMR registration fee; unified pan-India portal under development', verified: true },
    ],
  },
  {
    id: 'unified-draft',
    title: 'Unified Registration & pan-India licence (2026 draft)',
    status: 'draft',
    statusNote: 'DRAFT regulation — not in force; no verified start date',
    what: 'Draft NMC "Registration of Medical Practitioners and Licence to Practice Medicine" amendment: proposes NMR UIDs linked to State Medical Register entries, national↔state electronic synchronisation, and a licence valid for practice across India without fresh registration in each state.',
    who: 'Will reshape the flow for today’s students and future graduates — required registrations may be keyed to the new portal once notified.',
    feeNote: 'Draft proposes a registration/licence fee at Stage-Medical-Council level; current practitioners’ one-time transition/update is indicated as free.',
    links: [
      { label: 'Draft amendment notice + NMC notices page', url: 'https://nmc.org.in/whats-new', verified: true },
      { label: 'Implementation-concerns report (Medical Dialogues)', url: 'https://medicaldialogues.in/health-news/nmc/nmc-draft-proposes-mandatory-nmr-registration-doctors-raise-implementation-concerns-177902', verified: true },
    ],
    timeline: [
      { date: '2026', event: 'Draft amendment published for comments', verified: true },
      { date: 'Not notified', event: 'No verified general effective date yet', verified: true },
    ],
  },
]

export interface ChecklistItem {
  id: string
  label: string
  detail: string
  stage: 'ug-track' | 'grad-track'
  verified: 'official' | 'provisional'
}

export const NMR_CHECKLIST: ChecklistItem[] = [
  {
    id: 'c-aadhaar',
    label: 'Aadhaar number (for identity verification)',
    detail: 'Required for the NMR application; the portal verifies identity against Aadhaar.',
    stage: 'grad-track',
    verified: 'official',
  },
  {
    id: 'c-degree',
    label: 'MBBS degree certificate (digital copy)',
    detail: 'Listed as a required upload in the launch information for the NMR application.',
    stage: 'grad-track',
    verified: 'official',
  },
  {
    id: 'c-smc',
    label: 'State Medical Council / first registration certificate',
    detail: 'The certificate from the SMC (or erstwhile MCI route) where the doctor first registered; SMC verifies the NMR application first.',
    stage: 'grad-track',
    verified: 'official',
  },
  {
    id: 'c-internship',
    label: 'Internship completion — the gateway to SMC registration',
    detail: 'State Medical Council provisional/permanent registration requires internship completion documents; each SMC has its own document list — obtain it in writing.',
    stage: 'ug-track',
    verified: 'provisional',
  },
  {
    id: 'c-college-records',
    label: 'College verification readiness',
    detail: 'After SMC verification, the flow routes to the issuing college for verification — keep registrations/qualification records consistent with college records.',
    stage: 'grad-track',
    verified: 'official',
  },
  {
    id: 'c-fee-zero',
    label: 'Zero-fee expectation',
    detail: 'NMC clarified NMR registration carries no fee (Sep 2026). If any portal or agent demands money for NMR, treat it as a red flag.',
    stage: 'ug-track',
    verified: 'official',
  },
]

export const NMR_FAQ: Array<{ q: string; a: string; verified: 'official' | 'provisional' }> = [
  {
    q: 'Is NMR registration mandatory right now?',
    a: 'No. The government told the Lok Sabha in August 2025 that applying for an NMR ID is voluntary. The 2026 unified framework that would change this is a draft — not a current rule.',
    verified: 'official',
  },
  {
    q: 'Does NMR replace State Medical Council registration?',
    a: 'Not today. SMCs are active verifiers in the NMR flow, and state registration remains your first gateway after internship. The draft proposes deep sync of state and national registers in the future.',
    verified: 'official',
  },
  {
    q: 'I am still a student — what should I do now on PulseUp?',
    a: 'Track the UG-side checklist (internship paperwork, consistent college records) and keep your departure data clean. When the unified portal is notified, the NMR UID flow will draw directly on the documents you will already hold.',
    verified: 'provisional',
  },
  {
    q: 'What does this mean for my portfolio/export?',
    a: 'Keep your PulseUp dossier export aligned with the same documents the NMR verification chain will ask for: degree, SMC first-registration certificate, and consistent college records.',
    verified: 'provisional',
  },
]
