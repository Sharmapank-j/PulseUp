# PulseUp E2E Testing & Verification Infrastructure (TEST_INFRA)

## 1. Executive Summary & Quality Principles

PulseUp is an AI-powered Career Operating System engineered specifically for Indian healthcare professionals (undergraduate MBBS students, interns, postgraduates, junior/senior residents, and practicing doctors). The dual-deliverable platform consists of:
1. **Interactive Client Application (`PulseUp/prototype/index.html`)**: High-fidelity, self-contained single-page browser prototype implementing 8 functional clinical workstations in a clinical dark design system with zero console errors.
2. **Indian Medical Events & Certifications Research Database (`PulseUp/research/`)**: Comprehensive markdown reference (`medical_events_database.md`) and strictly validated machine-readable dataset (`seed_data.json`) covering >=58 verified opportunities across 5 clinical categories.
3. **Project Packaging & Documentation (`PulseUp/README.md`)**: Concise onboarding guide, 2-sentence system overview, and research file index.

### Quality & Integrity Principles
- **Genuine Execution**: Zero synthetic facades, zero hardcoded test passes, zero mock verification strings. All assertions evaluate real DOM markup, real CSS token rules, real parsed JSON arrays, and RFC-compliant URL endpoints.
- **Zero-Dependency Portability**: Built entirely on standard Node.js runtime APIs (`node:fs`, `node:path`, `node:assert/strict`, `node:url`, `node:vm`). Operates seamlessly in offline, air-gapped, or continuous integration environments without requiring `npm install` or third-party packages.
- **Deterministic Exit Protocol**: Strict POSIX exit codes (`0` for complete pass, `1` for assertion failure, `2` for fatal environment error).
- **Multi-Channel Reporting**: Real-time ANSI colored terminal stream, structured machine-readable JSON artifact (`tests/test_report.json`), and comprehensive GitHub-flavored Markdown report (`tests/TEST_RESULTS.md`).

---

## 2. Dual-Track Opaque-Box 4-Tier Test Matrix

The verification harness enforces a 4-tier testing hierarchy rooted in formal software verification methodologies: Category-Partition Equivalence Partitioning (Tier 1), Boundary Value Analysis & Edge Cases (Tier 2), Combinatorial & Pairwise Analysis (Tier 3), and Real-World Persona Journeys (Tier 4).

```
+---------------------------------------------------------------------------------------------------+
|                                PULSEUP TEST HARNESS TOPOLOGY                                      |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|                       Master Test Runner: `PulseUp/tests/test_runner.js`                          |
|                       Runtime: Node.js (v18+) Pure Standard Library                               |
|                                                                                                   |
|         +-------------------+-------------------+-------------------+-------------------+         |
|         |                   |                   |                   |                   |         |
|         v                   v                   v                   v                   v         |
|   +-------------+     +-------------+     +-------------+     +-------------+     +-------------+ |
|   |   Tier 1    |     |   Tier 2    |     |   Tier 3    |     |   Tier 4    |     | Multi-Format| |
|   |  Feature &  |     | Boundary &  |     | Combinatorial|    | Real-World  |     | Reporting   | |
|   |  Invariant  |     |  Edge Case  |     | & Pairwise  |     | User Workload|    | Engine      | |
|   |  Coverage   |     |  Testing    |     | Transitions |     | Journeys    |     |             | |
|   +-------------+     +-------------+     +-------------+     +-------------+     +-------------+ |
|         |                   |                   |                   |                   |         |
|         |                   |                   |                   |                   |         |
|         +-------------------+-------------------+-------------------+-------------------+         |
|                                                 |                                                 |
|                                                 v                                                 |
|     [1] ANSI Terminal Stream        [2] JSON Report             [3] Markdown Report               |
|     Standard Out (Colorized)        `test_report.json`          `TEST_RESULTS.md`                 |
+---------------------------------------------------------------------------------------------------+
```

---

### Tier 1: Feature & Invariant Coverage (Category-Partition Method)

Tier 1 validates that every functional requirement, component invariant, schema definition, and structural layout rule specified in `ORIGINAL_REQUEST.md` is present and structurally compliant.

| Test ID | Module | Category / Partition | Invariant Rule & Assertion Criteria | Severity |
| :--- | :--- | :--- | :--- | :--- |
| `T1-PROTO-001` | Prototype | File Structure | File exists at `prototype/index.html`, size exceeds 15,000 bytes, valid UTF-8 encoding. | Critical |
| `T1-PROTO-002` | Prototype | Self-Containment | Offline isolation: only allowed external CDN is Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com`). Zero external CSS frameworks, zero `<script src="...">` tags. | Critical |
| `T1-PROTO-003` | Prototype | Typography Tokens | Font link imports `Inter`, `Plus Jakarta Sans`, and `JetBrains Mono`. CSS declares `font-family` rules utilizing all 3 font families. | Major |
| `T1-PROTO-004` | Prototype | Color Palette Tokens | Exact hex tokens present in styles: Navy `#0B101B`, Surface `#111827`, Card `#1A2235`, Sidebar `#1C2541`, Emerald `#10B981`, Indigo-A `#3B82F6`, Amber `#F59E0B`, Crimson `#EF4444`, Purple `#8B5CF6`, Text `#F1F5F9`, `#94A3B8`, `#475569`, Border `rgba(255,255,255,0.07)`. | Major |
| `T1-PROTO-005` | Prototype | Global Layout Specs | Sidebar width is 220px, Topbar height is 52px sticky frosted-glass with `backdrop-filter: blur(...)`, Cards have `border-radius: 12px` and `background: #1A2235`. | Major |
| `T1-PROTO-006` | Prototype | Screen 1: Daily Career Board | Presence of Welcome banner, Career Score meter (0–1000), research sprint progress bar, Bharat Opportunity Radar (4 items), Goal Spaces quick dock, AETCOM nudge card. | Critical |
| `T1-PROTO-007` | Prototype | Screen 2: Research Hub | Presence of active project header, CRediT Authorship Matrix with 4 contributor rows, roles, progress bars, rank, and status; >=2 Research Bounties; Anti-Predatory Journal Shield with 3 journals & IF scores. | Critical |
| `T1-PROTO-008` | Prototype | Screen 3: Goal Spaces | Presence of 6 Space cards, 3-column Kanban board with >=6 task cards, threaded Discussion Chat with AI Copilot message, Research File Vault tab. | Critical |
| `T1-PROTO-009` | Prototype | Screen 4: AETCOM Hub | Presence of NMC CBME module indicator (`22/27`), module logbook with done/active/pending states, AI Simulation cards for SPIKES and Casualty De-escalation, Reflective Journal with plagiarism score. | Critical |
| `T1-PROTO-010` | Prototype | Screen 5: Mentorship Triage | Presence of ticket list with unread state, animated waveform SVG audio visualization, mentor directory with ratings. | Critical |
| `T1-PROTO-011` | Prototype | Screen 6: Campus Pulse & Med-Q | Presence of live countdown timer container, interactive 4-option quiz with correct/wrong feedback & clinical explanation, 4 medical fest cards with gradient banners. | Critical |
| `T1-PROTO-012` | Prototype | Screen 7: Bharat Opportunities | Presence of clickable filter pills, 3 full opportunity cards (AIIMS JR, ICMR-STS, TMC Observership) with 1-Click Apply, Rural Bond progress tracker. | Critical |
| `T1-PROTO-013` | Prototype | Screen 8: Medical Passport | Presence of profile hero, NMC and ABDM verification chips, Career Timeline with >=3 nodes, Badge shelf, Procedure Logbook table. | Critical |
| `T1-PROTO-014` | Prototype | Global Search Overlay | Command bar modal (`Cmd+K`/`Ctrl+K`) containing 8 navigation links corresponding to all 8 application screens. | Major |
| `T1-PROTO-015` | Prototype | Toast System | Fixed toast notification container in DOM; slide-up animation CSS with transform and opacity transitions. | Major |
| `T1-DATA-001` | Research DB | File Presence | `research/medical_events_database.md` and `research/seed_data.json` exist and are non-empty. | Critical |
| `T1-DATA-002` | Research DB | JSON Syntax | `seed_data.json` parses successfully with `JSON.parse()`. Root element is a JSON Array. | Critical |
| `T1-DATA-003` | Research DB | Schema Conformance | Every record adheres strictly to schema: `{ id, category, name, organizer, website, eligibility, frequency, typical_month, fee_inr, prize_or_certificate, pulse_credits_suggested, notes }`. Zero missing keys. | Critical |
| `T1-DATA-004` | Research DB | Minimum Category Quotas | Category A (Fests) >= 12; Category B (Quizzes) >= 10; Category C (Certifications) >= 20; Category D (Grants) >= 8; Category E (Observerships) >= 8. Total entries >= 58. | Critical |
| `T1-DATA-005` | Research DB | Pulse Credits Invariant | `pulse_credits_suggested` is strictly of type `number`, finite, not NaN, and > 0 for every record. | Critical |
| `T1-DATA-006` | Research DB | ICMR-STS Stipend | ICMR-STS entry exists and records verified stipend: INR 10,000/month (or INR 20,000 for 2-month term). | Critical |
| `T1-DATA-007` | Research DB | USMLE Indian Eligibility | USMLE Step 1/2CK/3 entries specify eligibility details for Indian MBBS students/graduates (ECFMG, WFME accreditation status, Form 186). | Critical |
| `T1-DATA-008` | Research DB | Official Website URLs | At least 5 entries per category (>= 25 total) feature syntactically valid official HTTP/HTTPS URLs. | Critical |
| `T1-DOC-001` | Documentation | README Presence & Scope | `README.md` exists at project root, contains 2-sentence PulseUp overview, browser prototype launch instructions, and research database descriptions. | Major |

---

### Tier 2: Boundary Value Analysis & Edge Cases

Tier 2 exercises extreme input values, zero-value conditions, keyboard shortcut variations across operating systems, and network isolation limits.

| Test ID | Area | Boundary / Edge Scenario | Expected System Behavior & Assertion |
| :--- | :--- | :--- | :--- |
| `T2-EDGE-001` | Keyboard | Dual OS Shortcut (`Ctrl+K` & `Cmd+K`) | Shortcut handler listens to `e.ctrlKey || e.metaKey` to support Windows/Linux and macOS seamlessly. `Escape` key closes overlay. |
| `T2-EDGE-002` | Navigation | Idempotent & Rapid Screen Switching | Screen switching function cleanly deselects previously active screen and activates requested screen without DOM bloat. |
| `T2-EDGE-003` | Timer | Zero-Second Boundary & Underflow | Countdown timer handles reaching zero (`secs <= 0`) without negative underflow, NaN, or exceptions. |
| `T2-EDGE-004` | Quiz | Option Click Idempotency | Clicking quiz option disables pointer events or updates selection without throwing errors; reveals explanation container. |
| `T2-EDGE-005` | Toast | Multiple Trigger Debounce / Stack | Rapid button clicks trigger toast with timer reset (`clearTimeout`) preventing orphaned timeouts. |
| `T2-EDGE-006` | Opportunities | Filter Pills State Stability | Toggling filter pills updates visual `.on` class and triggers contextual toast. |
| `T2-EDGE-007` | Workbench | Tab Switching Panel Exclusivity | Switching between Kanban, Chat, and File Vault toggles `.on` class on active tab and content pane while hiding inactive panes. |
| `T2-EDGE-008` | Data Schema | Zero-Cost vs Paid Fees | `fee_inr` cleanly represents zero-fee opportunities (`0` or `Free`) and non-negative numbers. |
| `T2-EDGE-009` | Data Schema | Unique ID Constraint | All `id` fields in `seed_data.json` are unique strings; no collision across any category. |
| `T2-EDGE-010` | Typography | Font Fallback Safety | System font fallbacks (`sans-serif`, `monospace`) declared alongside Google Fonts to ensure offline readability if CDN is blocked. |

---

### Tier 3: Combinatorial & Pairwise Testing

Tier 3 explores multi-dimensional interaction matrices and cross-state dependencies to verify that composite state transitions do not cause UI conflicts or state desynchronization.

#### 1. Prototype UI State Transition Combinations
* **Screen State ($S_1 \dots S_8$) $\times$ Command Modal State ($M_0$: Closed, $M_1$: Open)**:
  * Opening the command overlay from any of the 8 screens places the modal above the viewport without displacing layout.
  * Clicking any destination from the command overlay simultaneously closes the modal and switches the active screen.
* **Workbench Panel State ($W_1$: Kanban, $W_2$: Chat, $W_3$: Files) $\times$ Tab Interaction**:
  * Switching tabs preserves DOM integrity across tasks, chat messages, and file lists.
* **Opportunities Filter State ($F_0$: All, $F_1$: Residency, $F_2$: Grants, $F_3$: Observerships) $\times$ 1-Click Apply**:
  * Filtering and clicking apply generates accurate contextual toast alerts for the target opportunity.

#### 2. Seed Data Pairwise Cross-Tabulation
To ensure comprehensive clinical career coverage, the test runner performs pairwise cross-tabulation of:
- **Category** (Fest, Quiz, Certification, Grant, Observership)
- **Target Audience** (Undergraduate MBBS, Intern, Postgraduate Resident, Specialist)
- **Frequency** (Annual, Rolling, Biennial, Multi-cycle)
- **Financial Profile** (Funded/Stipend, Free, Nominal, Premium)

---

### Tier 4: Real-World Workload & Persona Scenarios

Tier 4 tests simulate end-to-end user workflows reflecting the real-world clinical and academic journeys of Indian healthcare professionals.

1. **Persona 1: Dr. Aarav Sharma (3rd Year MBBS Student @ MAMC Delhi)**
   - *Flow*: Lands on Daily Career Board -> Views Career Score (740/1000) & AETCOM nudge -> Opens Command Bar via Ctrl+K -> Navigates to Campus Pulse & Med-Q -> Solves clinical question (Duodenal Atresia) -> Observes countdown timer -> Explores Medical Fests (MAMC Synapse).
   - *Assertion*: Validates that all relevant DOM selectors, score meters, quiz handlers, and countdown nodes exist and are wired correctly.
2. **Persona 2: Dr. Priya Nair (Compulsory Rotating Medical Intern - CRMI)**
   - *Flow*: Navigates to Research & Publishing Hub -> Reviews CRediT Authorship Matrix (4 contributors) -> Audits Anti-Predatory Journal Shield recommendations and Impact Factors -> Opens Goal Spaces Workbench -> Switches to Discussion Chat -> Navigates to Bharat Opportunities -> Inspects Rural Bond Tracker (10/12 months) -> Clicks 1-Click Apply on TMC Observership.
   - *Assertion*: Validates CRediT matrix table rows, Journal Shield items, Rural Bond meter, and opportunity cards.
3. **Persona 3: Dr. Rohan Verma (Junior Resident - MD General Medicine)**
   - *Flow*: Navigates to AETCOM Bioethics Hub -> Audits NMC CBME module completion (22/27) -> Inspects SPIKES protocol simulation card -> Opens Async Mentorship Triage -> Plays audio snippet (animated SVG waveform) -> Navigates to Verified Medical Passport -> Verifies NMC Registration and ABDM Health ID chips.
   - *Assertion*: Validates AETCOM 22/27 indicator, SPIKES card, waveform SVG keyframes, and ABDM/NMC badge chips.
4. **Persona 4: Accreditation & Forensic Auditor (Automated Quality Gate)**
   - *Flow*: Executes full zero-dependency test runner -> Verifies zero syntax errors, zero external runtime leaks, exact hex color codes, complete schema conformance across >=58 seed records, ICMR stipend, and USMLE Indian eligibility.
   - *Assertion*: Validates exit code `0`, JSON test report generation, and Markdown summary output.

---

## 3. Test Runner CLI & Invocation Guide

### Master Command
```bash
# Execute test suite from repository root
node tests/test_runner.js

# Or specify an explicit target directory path
node tests/test_runner.js "c:/Users/pr218/OneDrive/Documents/projects Antigravity/PulseUp"
```

### Generated Artifacts
- **Console**: Color-coded ANSI test results stream with duration and failure callouts.
- **Machine Report**: `PulseUp/tests/test_report.json`
- **Markdown Report**: `PulseUp/tests/TEST_RESULTS.md`

### Exit Codes
- `0`: All test suites passed successfully.
- `1`: One or more functional assertions failed.
- `2`: Fatal environment error (e.g. root directory missing).
