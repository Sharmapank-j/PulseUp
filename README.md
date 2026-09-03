# PulseUp — AI-Powered Career Operating System for Indian Healthcare Professionals
> *Built in Bharat, Engineered for Clinical Excellence*

PulseUp is an AI-powered Career Operating System designed specifically for Indian medical professionals (students, interns, residents, and practitioners) to streamline clinical milestones, research collaboration, and regulatory compliance under the National Medical Commission (NMC). It centralizes career scoring, competency tracking (CBME/AETCOM), residency/fellowship opportunities, and peer networking within a unified clinical dark interface.

---

## 🚀 How to Open the Prototype

The interactive prototype is completely self-contained, offline-capable, and requires zero compilation or external build steps.

1. **Direct Browser Launch**:
   - Open `prototype/index.html` directly in any modern web browser (**Google Chrome**, **Microsoft Edge**, **Mozilla Firefox**, or **Safari**).
   - Alternatively, navigate to the `PulseUp` directory in your terminal and launch it:
     ```bash
     # Windows (PowerShell)
     Start-Process prototype/index.html

     # macOS
     open prototype/index.html

     # Linux
     xdg-open prototype/index.html
     ```
2. **Zero Dependencies**:
   - No `npm install`, Node.js server, Python server, or external build tool required.
   - All styling, SVG icons, and vanilla JavaScript state engines are bundled inside `prototype/index.html`.
   - Uses Google Fonts CDN (`Inter`, `Plus Jakarta Sans`, `JetBrains Mono`) with local system fallbacks (`sans-serif`, `monospace`) if running completely offline.

---

## 🖥️ Interactive Prototype Workstations (8 Core Screens)

The prototype features a responsive sidebar navigation and a global **Command Bar (`Ctrl+K` or `Cmd+K`)** mapping to 8 major clinical workstations:

| Screen | Identifier | Key Interactive Features |
|---|---|---|
| **1. Daily Career Board** | `#pg-dashboard` | Welcome banner, dynamic Career Score (0–1000 ring meter), active research sprint progress bars, Bharat Opportunity Radar (4 high-yield items), Goal Spaces quick dock, and an NMC AETCOM nudge card. |
| **2. Research & Publishing Hub** | `#pg-research` | CRediT Authorship Matrix (4 contributors, role tags, progress bars, authorship rank, status tags), 2 active Research Bounty cards, and Anti-Predatory Journal Shield with 3 recommended journals and impact factors. |
| **3. Goal Spaces Workbench** | `#pg-goalspaces` | Space cards grid (6 specialty groups), interactive 3-column Kanban board (To Do, In Progress, Done) with hoverable cards, threaded clinical Discussion Chat with AI Copilot responses, and Research File Vault tab. |
| **4. AETCOM Bioethics Hub** | `#pg-aetcom` | NMC CBME longitudinal module tracker (22/27 modules completed), module logbook table with distinct done/active/pending states, interactive AI simulation cards for the **SPIKES protocol** and Casualty De-escalation, and a Reflective Journal with automated plagiarism scoring. |
| **5. Async Mentorship Triage** | `#pg-mentorship` | Audio query ticket list with unread indicators, animated SVG/CSS sound waveform visualization, audio player controls, and an verified mentor directory featuring clinical credentials, reviews, and star ratings. |
| **6. Campus Pulse & Med-Q** | `#pg-campus` | Live JavaScript countdown timer (`setInterval`) for the daily Med-Q clinical quiz, interactive 4-option quiz arena with correct/wrong color-reveal and instant rationales, and 4 medical college fest cards with vibrant gradient banners. |
| **7. Bharat Opportunities Engine** | `#pg-opportunities` | Real-time clickable filter pills (All, Grants, Observerships, Fests, Quizzes), 3 comprehensive opportunity cards (AIIMS JR, ICMR-STS, TMC Oncology Observership) with 1-Click Apply triggers, and an animated Rural Bond progress tracker. |
| **8. Verified Medical Passport** | `#pg-identity` | Digital profile hero, verified National Medical Commission (NMC) registration chip, Ayushman Bharat Digital Mission (ABDM / HPR ID) verification chip, 3-node visual Career Timeline, digital clinical competency badge shelf, and a verified Procedure Logbook. |

**Universal Interactions:**
- **Command Palette**: Press `Ctrl+K` (or `Cmd+K`) from any screen to open the 8-item instant search overlay.
- **Feedback Engine**: Every action button triggers a non-blocking bottom-right slide-up toast notification with relevant contextual feedback.

### 🌟 Interactive Clinical Upgrades (Latest Release)
- **Interactive AETCOM Bedside Simulator**: Click "▶ Run Simulator" on SPIKES Protocol, Casualty De-escalation, or Medico-Legal Consent to launch a multi-stage branching dialogue engine with realistic clinical communication dilemmas, empathy scoring, and instant journal reflection logging.
- **Multi-Question National Med-Q Quiz Arena**: Experience a 5-question clinical spotter round (Pediatrics, Cardiology, Trauma, Pharma, OBG) with live score tracking (+50 PC per correct), streak bonuses, and Nelson/Harrison textbook citations.
- **Dynamic Kanban Sprint Board**: Drag/move tasks across `To Do` ⇄ `In Review` ⇄ `Completed` stages with auto-updating column counters and live sprint completion calculation.
- **Interactive AI Research Copilot**: Type any research question in the Goal Spaces Discussion tab to receive contextual clinical advice citing STROBE guidelines, ICMJE authorship rules, or biostatistical methodology.
- **Bharat Opportunities Engine Search & Application Drawer**: Real-time category filtering (JR Posts, ICMR Grants, Observerships), instant text search, and a comprehensive Application Drawer showing 7th CPC salary breakdowns (₹89,420/mo), automated NMC eligibility checks, and 1-Click Apply.
- **SBAR Mentorship Ticket Creator**: Enforce Situation-Background-Assessment-Recommendation structuring, escrow locking, and automated SLA timers for consultant inquiries.
- **Clinical Procedure Logger & ERAS/NMC CV Exporter**: Log procedures directly into the NMC Logbook with supervisor tags, and export/print a formatted official Medical CV with QR verification seals.
- **Night Call Red-Shift Ergonomic Mode**: Topbar toggle switches the interface into a red-shift monochrome palette for dark ICU/ward night shifts to prevent pupillary strain.

---

## 📚 Indian Medical Events & Research Database

The `research/` directory provides an authoritative, curated clinical career intelligence engine covering **68 verified national medical opportunities** across 5 categories with official website URLs, eligibility requirements, and suggested Pulse Credits.

### Deliverables Breakdown

1. **`research/medical_events_database.md`**:
   - Comprehensive markdown repository containing deep descriptive dossiers for all 68 opportunities.
   - Includes host institutions, target career stages (MBBS undergraduate, intern, postgraduate resident, fellow), application windows, fee structures, certificate validations, and direct official URLs.

2. **`research/seed_data.json`**:
   - Schema-validated machine-readable dataset structured as a top-level JSON array with 12 mandatory fields:
     `{ id, category, name, organizer, website, eligibility, frequency, typical_month, fee_inr, prize_or_certificate, pulse_credits_suggested, notes }`.
   - Contains positive finite numeric values for `pulse_credits_suggested` (70 to 500 PC) aligned with career milestone value.

### The 5 Opportunity Categories

| Category | Count | Scope & Prominent Entries | Key Requirements & Highlights |
|---|:---:|---|---|
| **Category A: Medical College Fests** | 14 | AIIMS Pulse (New Delhi), AFMC Silhouettes (Pune), CMC Pegasus (Vellore), KMC Verve/Utsav (Manipal), JIPMER Spandan (Puducherry), MAMC Synapse (Delhi), St. John's Autumn Muse (Bangalore), Grant Medical Aesthetics (Mumbai), KGMU Rhapsody (Lucknow), KMC Mangalore Helicon, BJGMC Asclepius (Pune), IMS BHU Elixir (Varanasi), LHMC Splash (Delhi), MMC Revivals (Chennai). | High-acuity clinical simulation workshops, national surgical paper presentations, emergency medicine wet-labs, diagnostic hackathons, and inter-collegiate delegate registration. |
| **Category B: National Quizzes & Competitions** | 12 | IAP National UG Pediatric Quiz, NNF National Neonatal Quiz, Torrent TYSA Surgical/Medical Awards, CSI Young Investigator Award, RSSDI National Diabetes Quiz, FOGSI Inter-Collegiate Quiz, IMA National Mediquiz, SOCA Anatomy Olympiad, APPI Physiology Quiz, IADVL Dermatology Quiz, AIIMS Pulse Med-Q, CMC Brain Drain. | College, zonal, state, and national rounds sponsored by apex clinical societies. Cash awards up to ₹1,00,000, funded travel fellowships, and national conference presentation rights. |
| **Category C: Clinical Certifications & Licensing** | 22 | AHA/IRCF BLS & ACLS, PALS, ATLS India, NRP India, ALSO (Obstetric Life Support), FCCS Critical Care, MRCP (UK) Part 1, MRCS Part A, USMLE Steps 1, 2 CK, and 3, PLAB Parts 1 & 2 (UK GMC), AMC CAT MCQ (Australia), DHA GP (Dubai), HAAD/DoH (Abu Dhabi), NMC NExT Steps 1 & 2, DNB PDCET, FIAGES, CCEBDM (Diabetes), FICM (Intensive Care). | Procedural competencies, life-support accreditation, and international medical licensing. **USMLE entries detail specific eligibility for Indian MBBS students and graduates**, including WFME/ECFMG 2024 compliance, WDOMS sponsor notes, and Stage 2/3 requirements. |
| **Category D: Government Research Grants** | 10 | ICMR Short Term Studentship (ICMR-STS), ICMR Junior Research Fellowship (JRF), DBT BioCARE Women Scientists, DST INSPIRE Fellowship, SERB/ANRF National Postdoctoral Fellowship (NPDF), CSIR-UGC NET JRF, Lady Tata Memorial Trust Scholarship, ICMR MD/MS Thesis Grant, RGUHS UG Grants, MUHS Research Grants. | Statutory funding bodies. **ICMR-STS entry includes verified stipend details: INR 10,000 per month (total INR 20,000 for 2 months)** along with mentor and protocol submission guidelines. |
| **Category E: Observerships & Clinical Electives** | 10 | Tata Memorial Centre (TMC Mumbai Oncology), NIMHANS Bengaluru, SGPGIMS Lucknow, AIIMS New Delhi Academic Electives, Sankara Nethralaya Chennai, SCTIMST Thiruvananthapuram (Neuro/Cardiac), NITRD New Delhi (Pulmonology & TB), PGIMER Chandigarh, KMIO Bengaluru, CMC Ludhiana Rural Elective. | Super-specialty clinical shadowing, tumor board rotations, multidisciplinary trauma rounds, and institutional certificates of clinical experience across premier tertiary apex centers. |

---

## 🎨 Clinical Dark Design System

PulseUp implements an ergonomic clinical dark design system engineered for high visual contrast, low eye fatigue in dimly lit hospital wards, and rapid diagnostic scanning:

### Color Palette Tokens
- **Background Navy** (`#0B101B`): Base application canvas and primary viewport frame.
- **Surface Dark** (`#111827`): Modular containers, topbar background, and active card wells.
- **Card Background** (`#1A2235`): Elevated panels, workstation tiles, and modal dialogs.
- **Sidebar Indigo** (`#1C2541`): Fixed 220px primary navigation sidebar.
- **Emerald Accent** (`#10B981`): Primary interactive buttons, verified credentials, passing metrics, and active state highlights.
- **Indigo-A Accent** (`#3B82F6`): Secondary action items, informational tags, and hyperlinked references.
- **Amber Accent** (`#F59E0B`): Warning states, nearing deadlines, pending approvals, and triage flags.
- **Crimson Accent** (`#EF4444`): Urgent alerts, predatory journal warnings, and overdue compliance items.
- **Purple Accent** (`#8B5CF6`): Specialized AI Copilot interactions, fellowships, and honors.
- **Text Primary** (`#F1F5F9`): Main headings, high-priority clinical values, and primary body copy.
- **Text Secondary** (`#94A3B8`): Subtitles, helper text, and secondary metadata.
- **Text Muted** (`#475569`): Timestamps, inactive indicators, and footnote credits.
- **Border Subtle** (`rgba(255, 255, 255, 0.07)`): Subtle 1px dividers defining layout grid boundaries.

### Typography
- **UI Body**: `Inter`, sans-serif (fluid, highly legible at micro-copy sizes).
- **Headings & Display**: `Plus Jakarta Sans`, sans-serif (crisp geometric headers).
- **Clinical Data & Metrics**: `JetBrains Mono`, monospace (unambiguous tabular numbers, dosages, lab values, and registration IDs).

### Dimensions & Structure
- **Sidebar Width**: `220px` fixed, containing branding avatar, user chip, grouped nav list, and Pulse Credit meter.
- **Topbar Height**: `52px` sticky frosted-glass header with `backdrop-filter: blur(12px)`.
- **Card Styling**: `border-radius: 12px`, `border: 1px solid rgba(255, 255, 255, 0.07)`, `background: #1A2235`.

---

## 📁 Repository Structure

```
PulseUp/
├── webapp/                       # Modern React + Vite Data Web Application
│   ├── package.json              # React 18, Vite, Tailwind CSS, Lucide, Apache ECharts
│   ├── vite.config.js            # Bundler configuration
│   ├── tailwind.config.js        # Clinical design system & dark/light theme tokens
│   ├── index.html                # Webapp root template
│   └── src/                      # Modular React workstation components & charts
├── prototype/
│   └── index.html                # High-fidelity, self-contained 8-screen browser prototype
├── research/
│   ├── medical_events_database.md # Comprehensive clinical events & career intelligence database (68 entries)
│   └── seed_data.json            # Validated machine-readable JSON dataset (68 records across 5 categories)
├── tests/
│   ├── test_runner.js            # Automated E2E verification test harness (46 assertions, zero dependencies)
│   ├── test_report.json          # Machine-readable test execution report
│   └── TEST_RESULTS.md           # Markdown test run summary and suite breakdown
├── TEST_INFRA.md                 # E2E test suite architecture & verification methodology
├── TEST_READY.md                 # Test harness readiness declaration artifact
└── README.md                     # Project documentation, workstation guide & specifications
```

---

## 💻 Running the Modern React + Vite Web Application

In addition to the standalone single-file prototype, PulseUp features a full-featured **React + Vite** data application configured according to the `building-data-apps` specification.

### Launching Development Server:
```bash
cd webapp
npm install
npm run dev
```
The application opens at `http://localhost:3000`.

### Production Build:
```bash
cd webapp
npm run build
```
Build output is optimized and emitted to `webapp/dist/`.

---

## 🧪 Automated Testing & Verification

PulseUp includes a zero-dependency automated verification test runner built using standard Node.js libraries (`node:fs`, `node:path`, `node:assert`, `node:url`, `node:vm`).

### Running the Test Suite
From the `PulseUp` directory, execute:

```bash
node tests/test_runner.js
```

### Verification Scope (46 Assertions across 5 Suites)
1. **Suite 1: Project Layout, File Structure & Documentation (R3)**:
   - Validates existence of `prototype/index.html`, `research/medical_events_database.md`, `research/seed_data.json`, and `README.md`.
   - Confirms 2-sentence PulseUp career OS overview, browser opening steps, research breakdown, and design tokens.
2. **Suite 2: High-Fidelity Browser Prototype DOM & Style Engine (R1)**:
   - Verifies prototype size (>15KB), offline self-containment (zero external scripts, Google Fonts only), and font imports (`Inter`, `Plus Jakarta Sans`, `JetBrains Mono`).
   - Validates all 9 clinical dark design system hex tokens (`#0B101B`, `#111827`, `#1A2235`, `#1C2541`, `#10B981`, `#3B82F6`, `#F59E0B`, `#EF4444`, `#8B5CF6`).
   - Verifies layout dimensions (220px sidebar, 52px topbar, 12px card border radius).
   - Validates DOM elements across all 8 screens, Command Bar navigation targets, and toast notification engine.
   - Compiles inline JavaScript using `vm.Script` to ensure 0 syntax errors, 0 unsafe `eval()`, and 0 `document.write()`.
3. **Suite 3: Medical Events Research Database Verification (R2)**:
   - Verifies Categories A through E exist in markdown and JSON.
   - Validates JSON schema (12 mandatory fields per entry).
   - Enforces category quotas: >=12 fests, >=10 quizzes, >=20 certifications, >=8 grants, >=8 observerships (total >=58).
   - Verifies positive numeric `pulse_credits_suggested` across all records.
   - Verifies **ICMR-STS** stipend amount (INR 10,000/month or INR 20,000 total).
   - Verifies **USMLE** eligibility criteria for Indian MBBS students and graduates.
   - Verifies at least 5 valid official website URLs per category (total >= 25).
   - Confirms unique record IDs and valid non-negative fee representations.
4. **Suite 4: Boundary Values, Edge Cases & Combinatorial Invariants**:
   - Tests dual keyboard shortcut event handlers (`ctrlKey` and `metaKey`).
   - Validates countdown timer zero-boundary clamping and negative underflow prevention.
   - Validates quiz option click debounce and mutation freeze after answering.
   - Verifies toast timer cleanup to prevent notification stacking.
   - Ensures CSS font fallbacks (`sans-serif`, `monospace`) exist.
   - Confirms 1:1 alignment between navigation targets and screen containers.
   - Validates multi-career-stage representation (UG MBBS, Intern/CRMI, Resident/PG).
5. **Suite 5: Real-World Persona & End-to-End User Workload Journeys**:
   - Persona 1: Dr. Aarav Sharma (3rd Year MBBS Student @ MAMC Delhi) — Career Score, AETCOM nudge, Command search, Med-Q countdown, fest cards.
   - Persona 2: Dr. Priya Nair (Compulsory Rotating Medical Intern) — CRediT matrix, Anti-Predatory Journal Shield, Goal Spaces Copilot chat, Rural Bond tracker, TMC Observership.
   - Persona 3: Dr. Rohan Verma (Junior Resident MD Medicine) — CBME 22/27 logbook, SPIKES simulation card, voice memo waveform SVG, NMC & ABDM/HPR verification chips.
   - Persona 4: Forensic Auditor Integrity Pass — Dataset integrity, test count validity, DOCTYPE and HTML structural closure.

**Result**: 100% Pass Rate (46/46 assertions passed in ~15ms).

---

## ⚖️ Regulatory & Standards Alignment

PulseUp is architected to conform with contemporary Indian healthcare regulatory frameworks:
- **NMC CBME (Competency-Based Medical Education)**: Structured logbooks and competency indicators aligned with NMC curriculum guidelines.
- **NMC AETCOM (Attitude, Ethics and Communication)**: Case simulations, reflective journaling, and longitudinal professional development tracking.
- **ABDM (Ayushman Bharat Digital Mission)**: Health Professional Registry (HPR ID) credentialing and digital healthcare interoperability.
- **CRediT (Contributor Roles Taxonomy)**: 14 standardized contributor roles ensuring equitable academic credit in medical research publications.
- **ICMJE & COPE Guidelines**: Anti-Predatory Journal Shield alerting clinicians against predatory publishing practices.

---

*PulseUp v0.1 Prototype · India-first · Engineered for Clinical Leadership*
