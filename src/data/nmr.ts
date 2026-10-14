export const NMR_TRACKS = [
  {
    id: 'nmr-portal',
    title: 'National Medical Register (NMR)',
    status: 'live',
    statusNote: 'Live since 23 Aug 2024 · voluntary per govt reply in Lok Sabha (Aug 2025)',
    what: 'National electronic register of registered allopathic doctors under the NMC, with Aadhaar-linked identity verification.',
    who: 'Doctors already registered on the Indian Medical Register / State registers. Students enter after State Medical Council registration on completing internship.',
    feeNote: 'No fee for NMR registration (NMC official clarification, Sep 2026).',
    links: [
      { label: 'Official NMC homepage', url: 'https://nmc.org.in/', verified: true },
      { label: 'NMR portal (ABDM-hosted)', url: 'https://nmr-nmc.abdm.gov.in/nmr/v3/', verified: true },
    ],
    timeline: [
      { date: '23 Aug 2024', event: 'NMR portal launched', verified: true },
      { date: 'Aug 2025', event: 'Govt confirms NMR application is voluntary', verified: true },
      { date: 'Sep 2026', event: 'NMC confirms ₹0 NMR registration fee', verified: true },
    ],
  },
  {
    id: 'unified-draft',
    title: 'Unified Registration & pan-India licence (2026 draft)',
    status: 'draft',
    statusNote: 'DRAFT regulation — not in force; no verified start date',
    what: 'Draft NMC amendment proposing NMR UIDs linked to State Medical Register entries, national↔state electronic synchronisation, and a pan-India licence.',
    who: 'Will reshape the flow for today\'s students and future graduates once notified.',
    feeNote: 'Draft proposes registration/licence fee at SMC level; transition for current practitioners indicated as free.',
    links: [
      { label: 'Draft amendment notice', url: 'https://nmc.org.in/whats-new', verified: true },
      { label: 'Implementation concerns report', url: 'https://medicaldialogues.in/health-news/nmc/nmc-draft-proposes-mandatory-nmr-registration-doctors-raise-implementation-concerns-177902', verified: true },
    ],
    timeline: [
      { date: '2026', event: 'Draft amendment published for comments', verified: true },
      { date: 'Not notified', event: 'No verified general effective date yet', verified: true },
    ],
  },
]

export const NMR_CHECKLIST = [
  { id: 'c-aadhaar', label: 'Aadhaar number', detail: 'Required for NMR application identity verification.', stage: 'grad-track', verified: 'official' },
  { id: 'c-degree', label: 'MBBS degree certificate', detail: 'Digital copy required for NMR application.', stage: 'grad-track', verified: 'official' },
  { id: 'c-smc', label: 'State Medical Council registration certificate', detail: 'First registration certificate from SMC where doctor first registered.', stage: 'grad-track', verified: 'official' },
  { id: 'c-internship', label: 'Internship completion documents', detail: 'Required for SMC provisional/permanent registration.', stage: 'ug-track', verified: 'provisional' },
  { id: 'c-college-records', label: 'College verification readiness', detail: 'Keep registrations/qualification records consistent with college records.', stage: 'grad-track', verified: 'official' },
  { id: 'c-fee-zero', label: 'Zero-fee expectation', detail: 'NMC clarified NMR registration carries no fee. Any portal demanding money for NMR is a red flag.', stage: 'ug-track', verified: 'official' },
]

export const NMR_FAQ = [
  { q: 'Is NMR registration mandatory right now?', a: 'No. Government told Lok Sabha in Aug 2025 that NMR ID application is voluntary. The 2026 unified framework is a draft — not a current rule.', verified: 'official' },
  { q: 'Does NMR replace State Medical Council registration?', a: 'Not today. SMCs are active verifiers in the NMR flow; state registration remains first gateway after internship.', verified: 'official' },
  { q: 'I am still a student — what should I do?', a: 'Track UG-side checklist (internship paperwork, consistent college records). When unified portal is notified, NMR UID flow will draw on documents you already hold.', verified: 'provisional' },
  { q: 'What does this mean for my portfolio/export?', a: 'Keep PulseUp dossier export aligned with documents NMR verification chain will ask for: degree, SMC certificate, consistent college records.', verified: 'provisional' },
]
