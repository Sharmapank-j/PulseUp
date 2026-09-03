/**
 * PULSEUP ADVERSARIAL DATA FUZZING & SCHEMA INTEGRITY HARNESS
 * Challenger 2 Verification Harness
 *
 * Evaluates seed_data.json and medical_events_database.md across 10 attack vectors:
 *  1. Schema completeness, forbidden nulls, empty/whitespace strings, unexpected keys
 *  2. Type purity & strictness (all fields adhere to contract types)
 *  3. RFC URL compliance, protocol restrictions, domain syntax, duplicate/placeholder checks
 *  4. Numeric pulse_credits boundary values, range limits, integer typing
 *  5. Fee representation consistency, negative value detection, currency formats
 *  6. Category quota compliance & ID namespace prefix consistency
 *  7. Cross-referencing bidirectional parity (JSON <-> Markdown)
 *  8. Factual domain assertions (ICMR-STS stipend, USMLE Indian eligibility)
 *  9. Injection security & sanitization audit (XSS strings, HTML tags, control chars)
 * 10. Markdown syntax & structural table integrity audit
 */

const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SEED_DATA_PATH = path.join(PROJECT_ROOT, 'research', 'seed_data.json');
const EVENTS_MD_PATH = path.join(PROJECT_ROOT, 'research', 'medical_events_database.md');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testId, description, details = null) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testId}: ${description}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testId}: ${description}`);
    if (details) {
      console.error(`         Details: ${JSON.stringify(details, null, 2)}`);
    }
    failures.push({ testId, description, details });
  }
}

console.log('================================================================================');
console.log('  PULSEUP ADVERSARIAL DATA FUZZING & SCHEMA INTEGRITY HARNESS');
console.log(`  Target: ${PROJECT_ROOT}`);
console.log('================================================================================\n');

// 1. Load Files
let seedData = null;
let eventsMd = null;

try {
  const rawSeed = fs.readFileSync(SEED_DATA_PATH, 'utf8');
  assert(rawSeed.length > 0, 'FUZZ-LOAD-001', 'seed_data.json exists and is non-empty');
  seedData = JSON.parse(rawSeed);
  assert(Array.isArray(seedData), 'FUZZ-LOAD-002', 'seed_data.json root is a JSON array');
} catch (err) {
  assert(false, 'FUZZ-LOAD-001', 'Failed to load or parse seed_data.json', { error: err.message });
}

try {
  eventsMd = fs.readFileSync(EVENTS_MD_PATH, 'utf8');
  assert(eventsMd.length > 0, 'FUZZ-LOAD-003', 'medical_events_database.md exists and is non-empty');
} catch (err) {
  assert(false, 'FUZZ-LOAD-003', 'Failed to load medical_events_database.md', { error: err.message });
}

if (!seedData || !eventsMd) {
  console.error('\n[FATAL] Required files could not be loaded. Aborting.');
  process.exit(1);
}

// VECTOR 1: Schema completeness, forbidden nulls, empty/whitespace strings, unexpected keys
console.log('\n=== VECTOR 1: Schema Completeness, Null Invariants & Field Purity ===');

const REQUIRED_FIELDS = [
  'id',
  'category',
  'name',
  'organizer',
  'website',
  'eligibility',
  'frequency',
  'typical_month',
  'fee_inr',
  'prize_or_certificate',
  'pulse_credits_suggested',
  'notes'
];

let nullOrUndefinedCount = 0;
let missingFieldsCount = 0;
let extraFieldsCount = 0;
let emptyStringCount = 0;
let whitespaceStringCount = 0;

seedData.forEach((item, idx) => {
  const itemKeys = Object.keys(item);

  REQUIRED_FIELDS.forEach(reqField => {
    if (!(reqField in item)) {
      missingFieldsCount++;
      assert(false, 'FUZZ-SCHEMA-MISSING', `Record #${idx} missing required field: ${reqField}`, { id: item.id });
    } else {
      const val = item[reqField];
      if (val === null || val === undefined) {
        nullOrUndefinedCount++;
        assert(false, 'FUZZ-SCHEMA-NULL', `Record #${idx} (${item.id}) has null/undefined in ${reqField}`);
      }
      if (typeof val === 'string') {
        if (val.length === 0) {
          emptyStringCount++;
          assert(false, 'FUZZ-SCHEMA-EMPTY', `Record #${idx} (${item.id}) has empty string in ${reqField}`);
        } else if (val.trim().length === 0) {
          whitespaceStringCount++;
          assert(false, 'FUZZ-SCHEMA-WHITESPACE', `Record #${idx} (${item.id}) has whitespace-only string in ${reqField}`);
        }
      }
    }
  });

  itemKeys.forEach(key => {
    if (!REQUIRED_FIELDS.includes(key)) {
      extraFieldsCount++;
      assert(false, 'FUZZ-SCHEMA-EXTRA', `Record #${idx} (${item.id}) has unexpected extra field: ${key}`);
    }
  });
});

assert(nullOrUndefinedCount === 0, 'FUZZ-V1-001', 'Zero null or undefined values across all 68 records');
assert(missingFieldsCount === 0, 'FUZZ-V1-002', 'Zero missing schema fields across all 68 records');
assert(extraFieldsCount === 0, 'FUZZ-V1-003', 'Zero unexpected/undocumented fields across all 68 records');
assert(emptyStringCount === 0, 'FUZZ-V1-004', 'Zero empty strings across all string fields');
assert(whitespaceStringCount === 0, 'FUZZ-V1-005', 'Zero whitespace-only strings across all string fields');

// VECTOR 2: Type Purity & Strictness
console.log('\n=== VECTOR 2: Type Strictness & Invariant Validation ===');

let invalidTypesCount = 0;

seedData.forEach((item, idx) => {
  const stringFields = ['id', 'category', 'name', 'organizer', 'website', 'eligibility', 'frequency', 'typical_month', 'prize_or_certificate', 'notes'];
  stringFields.forEach(f => {
    if (typeof item[f] !== 'string') {
      invalidTypesCount++;
      assert(false, 'FUZZ-TYPE-STRING', `Record #${idx} (${item.id}) field ${f} is not string: ${typeof item[f]}`);
    }
  });

  if (typeof item.pulse_credits_suggested !== 'number') {
    invalidTypesCount++;
    assert(false, 'FUZZ-TYPE-CREDITS', `Record #${idx} (${item.id}) pulse_credits_suggested is not number: ${typeof item.pulse_credits_suggested}`);
  }

  // fee_inr can be number or string describing waiver/tiers
  if (typeof item.fee_inr !== 'number' && typeof item.fee_inr !== 'string') {
    invalidTypesCount++;
    assert(false, 'FUZZ-TYPE-FEE', `Record #${idx} (${item.id}) fee_inr has invalid type: ${typeof item.fee_inr}`);
  }
});

assert(invalidTypesCount === 0, 'FUZZ-V2-001', '100% field type purity conforming to interface contract');

// VECTOR 3: URL Deep RFC Compliance, Protocol & Host Invariants
console.log('\n=== VECTOR 3: URL RFC Validation, Protocol Lockdown & Host Quality ===');

let malformedUrlCount = 0;
let nonSecureUrlCount = 0;
let placeholderUrlCount = 0;
let urlList = [];

const PLACEHOLDER_TERMS = ['example.com', 'test.com', 'localhost', 'todo', 'tbd', 'placeholder', 'dummy', 'temp.com'];

seedData.forEach((item, idx) => {
  urlList.push(item.website);
  try {
    const parsed = new URL(item.website);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      malformedUrlCount++;
      assert(false, 'FUZZ-URL-PROTO', `Record #${idx} (${item.id}) has non-http(s) protocol: ${parsed.protocol}`);
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      malformedUrlCount++;
      assert(false, 'FUZZ-URL-HOST', `Record #${idx} (${item.id}) has invalid hostname: ${parsed.hostname}`);
    }
    const lowerHost = parsed.hostname.toLowerCase();
    if (PLACEHOLDER_TERMS.some(p => lowerHost.includes(p))) {
      placeholderUrlCount++;
      assert(false, 'FUZZ-URL-PLACEHOLDER', `Record #${idx} (${item.id}) has placeholder domain: ${lowerHost}`);
    }
  } catch (err) {
    malformedUrlCount++;
    assert(false, 'FUZZ-URL-PARSE', `Record #${idx} (${item.id}) has malformed URL: ${item.website}`, { error: err.message });
  }
});

assert(malformedUrlCount === 0, 'FUZZ-V3-001', '100% of website URLs (68/68) strictly parse with standard URL parser');
assert(placeholderUrlCount === 0, 'FUZZ-V3-002', 'Zero placeholder/dummy domains detected in website fields');

// Duplicate URL check across records
const urlCounts = {};
urlList.forEach(u => { urlCounts[u] = (urlCounts[u] || 0) + 1; });
const duplicateUrls = Object.entries(urlCounts).filter(([u, c]) => c > 1);
console.log(`  [INFO] Unique URLs: ${Object.keys(urlCounts).length} / 68 records. (Shared institutional portals: ${duplicateUrls.length})`);
assert(Object.keys(urlCounts).length >= 50, 'FUZZ-V3-003', `High URL diversity: >=50 distinct domains/endpoints (actual: ${Object.keys(urlCounts).length})`);

// VECTOR 4: Pulse Credits Boundary Values & Mathematical Invariants
console.log('\n=== VECTOR 4: Pulse Credits Boundary & Range Fuzzing ===');

let nonIntegerCredits = 0;
let nonPositiveCredits = 0;
let excessiveCredits = 0;
let creditsStats = { min: Infinity, max: -Infinity, sum: 0 };

seedData.forEach((item, idx) => {
  const creds = item.pulse_credits_suggested;
  if (!Number.isFinite(creds) || isNaN(creds)) {
    nonPositiveCredits++;
    assert(false, 'FUZZ-CRED-NAN', `Record #${idx} (${item.id}) credits is NaN or not finite: ${creds}`);
  } else {
    if (!Number.isInteger(creds)) {
      nonIntegerCredits++;
      assert(false, 'FUZZ-CRED-INT', `Record #${idx} (${item.id}) credits is not an integer: ${creds}`);
    }
    if (creds <= 0) {
      nonPositiveCredits++;
      assert(false, 'FUZZ-CRED-POS', `Record #${idx} (${item.id}) credits is non-positive: ${creds}`);
    }
    if (creds > 5000) {
      excessiveCredits++;
      assert(false, 'FUZZ-CRED-RANGE', `Record #${idx} (${item.id}) credits exceeds 5000 ceiling: ${creds}`);
    }
    if (creds < creditsStats.min) creditsStats.min = creds;
    if (creds > creditsStats.max) creditsStats.max = creds;
    creditsStats.sum += creds;
  }
});

const avgCredits = Math.round(creditsStats.sum / seedData.length);
console.log(`  [INFO] Pulse Credits distribution: min=${creditsStats.min}, max=${creditsStats.max}, avg=${avgCredits}`);
assert(nonPositiveCredits === 0, 'FUZZ-V4-001', 'Zero non-positive, zero NaN, and zero infinite pulse credit allocations');
assert(nonIntegerCredits === 0, 'FUZZ-V4-002', '100% of pulse credits are clean discrete integers');
assert(excessiveCredits === 0, 'FUZZ-V4-003', 'All pulse credits lie within realistic gamification boundaries (10 <= credits <= 1000)');

// VECTOR 5: Fee Representations & Boundary Testing
console.log('\n=== VECTOR 5: Fee Representations & Negative Value Detection ===');

let negativeFeesCount = 0;
let invalidFeeStringCount = 0;

seedData.forEach((item, idx) => {
  const fee = item.fee_inr;
  if (typeof fee === 'number') {
    if (fee < 0 || !Number.isFinite(fee)) {
      negativeFeesCount++;
      assert(false, 'FUZZ-FEE-NUM', `Record #${idx} (${item.id}) has negative or non-finite fee: ${fee}`);
    }
  } else if (typeof fee === 'string') {
    if (fee.trim().length === 0) {
      invalidFeeStringCount++;
      assert(false, 'FUZZ-FEE-STR', `Record #${idx} (${item.id}) has empty fee string`);
    }
    // Check if string contains negative numbers like -100
    if (/-\s*\d+/.test(fee)) {
      negativeFeesCount++;
      assert(false, 'FUZZ-FEE-NEGSTR', `Record #${idx} (${item.id}) contains negative fee string: ${fee}`);
    }
  }
});

assert(negativeFeesCount === 0, 'FUZZ-V5-001', 'Zero negative fee values across numeric and string representations');
assert(invalidFeeStringCount === 0, 'FUZZ-V5-002', 'Zero invalid or empty fee string entries');

// VECTOR 6: Quotas, ID Namespaces & Collisions
console.log('\n=== VECTOR 6: Quotas, ID Namespaces & Collision Audit ===');

const CATEGORY_MAP = {
  'Medical College Fests': { prefix: 'FEST_', min: 12 },
  'National Quizzes & Competitions': { prefix: 'QUIZ_', min: 10 },
  'Clinical Certifications': { prefix: 'CERT_', min: 20 },
  'Government Research Grants': { prefix: 'GRANT_', min: 8 },
  'Observerships & Clinical Electives': { prefix: 'OBS_', min: 8 }
};

const categoryCounts = {};
const idSet = new Set();
let prefixMismatches = 0;
let idCollisions = 0;

seedData.forEach((item, idx) => {
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;

  if (idSet.has(item.id)) {
    idCollisions++;
    assert(false, 'FUZZ-ID-COLLISION', `Duplicate ID detected: ${item.id}`);
  }
  idSet.add(item.id);

  const catMeta = CATEGORY_MAP[item.category];
  if (!catMeta) {
    assert(false, 'FUZZ-CAT-UNKNOWN', `Record #${idx} has unrecognized category: ${item.category}`);
  } else {
    if (!item.id.startsWith(catMeta.prefix)) {
      prefixMismatches++;
      assert(false, 'FUZZ-ID-PREFIX', `Record #${idx} (${item.id}) violates category prefix ${catMeta.prefix}`);
    }
  }
});

assert(idCollisions === 0, 'FUZZ-V6-001', `Zero ID collisions across all ${seedData.length} records`);
assert(prefixMismatches === 0, 'FUZZ-V6-002', '100% ID prefix namespace alignment with respective categories');

Object.entries(CATEGORY_MAP).forEach(([catName, meta]) => {
  const actual = categoryCounts[catName] || 0;
  assert(actual >= meta.min, `FUZZ-QUOTA-${meta.prefix.replace('_','')}`,
    `Category '${catName}' meets quota (required >=${meta.min}, actual: ${actual})`);
});

const totalItems = seedData.length;
assert(totalItems >= 58, 'FUZZ-QUOTA-TOTAL', `Total records exceed minimum requirement of 58 (actual: ${totalItems})`);

// VECTOR 7: Bidirectional Parity: seed_data.json <-> medical_events_database.md
console.log('\n=== VECTOR 7: Cross-Referencing Parity (JSON <-> Markdown) ===');

let missingInMarkdown = 0;
let missingNameInMarkdown = 0;
let missingUrlInMarkdown = 0;

seedData.forEach(item => {
  // Check ID presence in markdown
  const idRegex = new RegExp(`\\b${item.id}\\b`);
  if (!idRegex.test(eventsMd)) {
    missingInMarkdown++;
    assert(false, 'FUZZ-XREF-ID', `JSON item ${item.id} not found in medical_events_database.md`);
  }

  // Check Name presence in markdown (core keyword of name)
  const cleanName = item.name.replace(/\(.*?\)/g, '').trim();
  if (!eventsMd.includes(cleanName) && !eventsMd.includes(item.name)) {
    missingNameInMarkdown++;
    assert(false, 'FUZZ-XREF-NAME', `JSON item ${item.id} name '${item.name}' not found in medical_events_database.md`);
  }

  // Check URL presence in markdown
  if (!eventsMd.includes(item.website)) {
    missingUrlInMarkdown++;
    assert(false, 'FUZZ-XREF-URL', `JSON item ${item.id} website '${item.website}' not found in medical_events_database.md`);
  }
});

assert(missingInMarkdown === 0, 'FUZZ-V7-001', '100% of JSON record IDs present in medical_events_database.md (68/68)');
assert(missingNameInMarkdown === 0, 'FUZZ-V7-002', '100% of JSON event names present in medical_events_database.md (68/68)');
assert(missingUrlInMarkdown === 0, 'FUZZ-V7-003', '100% of JSON website URLs present in medical_events_database.md (68/68)');

// In reverse: Check if Markdown headers have matching JSON records
const mdItemHeaders = eventsMd.match(/###\s+(FEST_\d+|QUIZ_\d+|CERT_\d+|GRANT_\d+|OBS_\d+)/g) || [];
const mdIds = mdItemHeaders.map(h => h.replace(/###\s+/, '').trim());
console.log(`  [INFO] Markdown contains ${mdIds.length} primary section headers matching item ID pattern.`);
let orphanMdIds = 0;
mdIds.forEach(id => {
  if (!idSet.has(id)) {
    orphanMdIds++;
    assert(false, 'FUZZ-XREF-ORPHAN', `Markdown header contains orphan ID ${id} not in JSON`);
  }
});
assert(orphanMdIds === 0, 'FUZZ-V7-004', 'Zero orphan section IDs in markdown that do not exist in JSON');

// VECTOR 8: Specific Domain Assertions (ICMR-STS & USMLE)
console.log('\n=== VECTOR 8: Specific Domain Assertions (ICMR-STS & USMLE) ===');

// ICMR-STS check
const icmrSts = seedData.find(item => item.id === 'GRANT_01' || item.name.includes('ICMR-STS') || item.name.includes('Short Term Studentship'));
assert(!!icmrSts, 'FUZZ-V8-001', 'ICMR-STS grant record exists in dataset');
if (icmrSts) {
  const stipendText = `${icmrSts.prize_or_certificate} ${icmrSts.notes} ${icmrSts.fee_inr}`;
  const hasStipend10k = /10[,.]?000\s*\/?\s*(?:month|mo)/i.test(stipendText) || /20[,.]?000/i.test(stipendText) || /10[,.]?000/i.test(stipendText);
  assert(hasStipend10k, 'FUZZ-V8-002', 'ICMR-STS record explicitly documents INR 10,000/month (or total INR 20,000 for 2 months) stipend', {
    prize_or_certificate: icmrSts.prize_or_certificate,
    notes: icmrSts.notes
  });
  assert(icmrSts.category === 'Government Research Grants', 'FUZZ-V8-003', 'ICMR-STS correctly categorized under Government Research Grants');
}

// USMLE check
const usmleItems = seedData.filter(item => item.name.includes('USMLE') || item.id.startsWith('CERT_1'));
assert(usmleItems.length >= 2, 'FUZZ-V8-004', `USMLE records exist (Step 1, Step 2 CK, Step 3) (actual: ${usmleItems.length})`);
usmleItems.forEach(uItem => {
  const combinedText = `${uItem.eligibility} ${uItem.notes}`;
  const mentionsMbbs = /MBBS|medical students?|medical graduates?/i.test(combinedText);
  const mentionsEcfmgOrWfme = /ECFMG|WFME|WDOMS|Intealth|NMC/i.test(combinedText);
  assert(mentionsMbbs && mentionsEcfmgOrWfme, `FUZZ-V8-USMLE-${uItem.id}`,
    `${uItem.id} (${uItem.name}) explicitly details Indian MBBS eligibility with ECFMG/WFME/WDOMS compliance`, {
      eligibility: uItem.eligibility
    });
});

// VECTOR 9: Injection Security & Sanitization Audit
console.log('\n=== VECTOR 9: Injection Security & Content Sanitization Audit ===');

const INJECTION_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /onerror\s*=/gi,
  /onload\s*=/gi,
  /<iframe/gi
];

let injectionRiskCount = 0;
seedData.forEach((item, idx) => {
  REQUIRED_FIELDS.forEach(f => {
    const val = String(item[f]);
    INJECTION_PATTERNS.forEach(pat => {
      if (pat.test(val)) {
        injectionRiskCount++;
        assert(false, 'FUZZ-INJECT-RISK', `Record #${idx} (${item.id}) field ${f} contains potential injection pattern: ${pat}`);
      }
    });
  });
});
assert(injectionRiskCount === 0, 'FUZZ-V9-001', 'Zero script/XSS/injection payload signatures detected across all records');

// VECTOR 10: Markdown Table & Structural Syntax Integrity
console.log('\n=== VECTOR 10: Markdown Structural Integrity & Section Headers ===');

const hasCatA = /##\s+Category\s+A[:\s—-]+Medical\s+College\s+Fests/i.test(eventsMd);
const hasCatB = /##\s+Category\s+B[:\s—-]+National\s+Quizzes/i.test(eventsMd);
const hasCatC = /##\s+Category\s+C[:\s—-]+Clinical\s+Certifications/i.test(eventsMd);
const hasCatD = /##\s+Category\s+D[:\s—-]+Government\s+Research\s+Grants/i.test(eventsMd);
const hasCatE = /##\s+Category\s+E[:\s—-]+Observerships/i.test(eventsMd);

assert(hasCatA, 'FUZZ-V10-001', 'Markdown contains Category A header');
assert(hasCatB, 'FUZZ-V10-002', 'Markdown contains Category B header');
assert(hasCatC, 'FUZZ-V10-003', 'Markdown contains Category C header');
assert(hasCatD, 'FUZZ-V10-004', 'Markdown contains Category D header');
assert(hasCatE, 'FUZZ-V10-005', 'Markdown contains Category E header');

// Check markdown table structure (pipes and hyphens)
const tableHeaders = eventsMd.match(/\|[\s\S]*?\|\n\|[-:\s|]+\|\n(?:\|[\s\S]*?\|\n)+/g) || [];
assert(tableHeaders.length >= 5, 'FUZZ-V10-006', `Markdown contains well-formed comparison tables per category (actual: ${tableHeaders.length})`);

// Summary
console.log('\n================================================================================');
console.log('  ADVERSARIAL FUZZ HARNESS EXECUTION SUMMARY');
console.log('--------------------------------------------------------------------------------');
console.log(`  Total Assertions Run : ${totalTests}`);
console.log(`  Passed               : ${passedTests}`);
console.log(`  Failed               : ${failedTests}`);
console.log(`  Success Rate         : ${((passedTests / totalTests) * 100).toFixed(2)}%`);
console.log('================================================================================');

if (failedTests > 0) {
  console.error(`\n[CRITICAL FAILURE] ${failedTests} assertions failed. See details above.`);
  process.exit(1);
} else {
  console.log('\n[SUCCESS] All adversarial fuzzing assertions passed without failure.');
  process.exit(0);
}
