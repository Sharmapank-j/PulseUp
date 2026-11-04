/**
 * PulseUp Test Harness: AI Connections, Models & Gemini 3.8 Flash Protocol
 */
import {
  resolveChatEndpoint,
  buildCloudHeaders,
  buildGeminiContents,
  buildOpenAiMessages,
  diagnoseAiError,
  cleanApiKey,
  normalizeGeminiModel,
  GEMINI_MODELS,
  CLOUD_PRESETS,
} from '../webapp/src/services/aiService.js';
import assert from 'node:assert';

console.log('='.repeat(70));
console.log('   PULSEUP AI ENGINE & GEMINI 3.8 FLASH PROTOCOL TEST HARNESS');
console.log('='.repeat(70));

console.log('\n=== VECTOR 1: Gemini 3.8 Flash Series & Legacy Model Migration ===');
assert.ok(GEMINI_MODELS.some(m => m.id === 'gemini-3.8-flash'), 'Gemini 3.8 Flash must be active');
assert.ok(GEMINI_MODELS.some(m => m.id === 'gemini-3.8-flash-lite'), 'Gemini 3.8 Flash-Lite must be active');
assert.ok(GEMINI_MODELS.some(m => m.id === 'gemini-4-argon'), 'Gemini 4 Argon must be active');
assert.ok(!GEMINI_MODELS.some(m => m.id.startsWith('gemini-2.')), 'Legacy 2.x models must be deprecated');
assert.ok(!GEMINI_MODELS.some(m => m.id.startsWith('gemini-1.')), 'Legacy 1.x models must be deprecated');
console.log('  [PASS] T-AI-001: GEMINI_MODELS specifies 3.8 Flash series and excludes deprecated models');

assert.strictEqual(normalizeGeminiModel('gemini-2.0-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeGeminiModel('gemini-2.0-flash-lite'), 'gemini-3.8-flash');
assert.strictEqual(normalizeGeminiModel('gemini-1.5-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeGeminiModel('gemini-1.5-pro'), 'gemini-3.8-flash');
assert.strictEqual(normalizeGeminiModel('gemini-2.5-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeGeminiModel('models/gemini-3.8-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeGeminiModel('gemini-3.8-flash'), 'gemini-3.8-flash');
assert.strictEqual(normalizeGeminiModel(''), 'gemini-3.8-flash');
console.log('  [PASS] T-AI-002: normalizeGeminiModel automatically upgrades all legacy models to 3.8 Flash');

console.log('\n=== VECTOR 2: Credentials & Key Sanitization ===');
assert.strictEqual(cleanApiKey('  sk-test-123  '), 'sk-test-123');
assert.strictEqual(cleanApiKey('"AIzaSyTest"'), 'AIzaSyTest');
assert.strictEqual(cleanApiKey("'AIzaSyTest'"), 'AIzaSyTest');
assert.strictEqual(cleanApiKey('Bearer AIzaSy_valid_key'), 'AIzaSy_valid_key');
assert.strictEqual(cleanApiKey('api_key=AIzaSy_valid_key'), 'AIzaSy_valid_key');
assert.strictEqual(cleanApiKey('optional'), '');
assert.strictEqual(cleanApiKey('None'), '');
console.log('  [PASS] T-AI-003: cleanApiKey removes whitespace, quotes, Bearer prefixes, and placeholders');

console.log('\n=== VECTOR 3: Cloud Provider Presets & Endpoints ===');
assert.ok(CLOUD_PRESETS.some(p => p.id === 'gemini_openai'), 'Gemini OpenAI endpoint preset exists');
assert.ok(CLOUD_PRESETS.some(p => p.id === 'groq'), 'Groq preset exists');
assert.ok(CLOUD_PRESETS.some(p => p.id === 'openrouter'), 'OpenRouter preset exists');
assert.ok(CLOUD_PRESETS.some(p => p.id === 'deepseek'), 'DeepSeek preset exists');
const openRouterPreset = CLOUD_PRESETS.find(p => p.id === 'openrouter');
assert.strictEqual(openRouterPreset.defaultModel, 'google/gemini-3.8-flash');
console.log('  [PASS] T-AI-004: CLOUD_PRESETS properly includes Gemini OpenAI and OpenRouter 3.8 Flash presets');

console.log('\n=== VECTOR 4: RFC Endpoint Resolution & Strict CORS Whitelist ===');
assert.strictEqual(resolveChatEndpoint('localhost:11434'), 'http://localhost:11434/v1/chat/completions');
assert.strictEqual(resolveChatEndpoint('https://api.groq.com/openai/v1'), 'https://api.groq.com/openai/v1/chat/completions');
assert.strictEqual(resolveChatEndpoint('http://localhost:11434/api/chat'), 'http://localhost:11434/api/chat');

const groqH = buildCloudHeaders('https://api.groq.com/openai/v1/chat/completions', 'gsk_key');
assert.strictEqual(groqH['Authorization'], 'Bearer gsk_key');
assert.strictEqual(groqH['HTTP-Referer'], undefined, 'Must not send HTTP-Referer to Groq');

const orH = buildCloudHeaders('https://openrouter.ai/api/v1/chat/completions', 'sk-or-key');
assert.strictEqual(orH['Authorization'], 'Bearer sk-or-key');
assert.strictEqual(orH['X-Title'], 'PulseUp medimind.ai');
console.log('  [PASS] T-AI-005: Endpoint resolver and provider CORS headers adhere to strict whitelists');

console.log('\n=== VECTOR 5: Gemini Alternating Dialogue Contract ===');
const convo = [
  { role: 'assistant', text: 'Welcome to medimind.ai' },
  { role: 'user', text: 'Explain AETCOM Module 3.1' },
  { role: 'assistant', text: 'SPIKES protocol guidelines...' },
];
const contents = buildGeminiContents(convo, 'What is Step 4?');
assert.strictEqual(contents[0].role, 'user', 'First turn must be user');
assert.strictEqual(contents[1].role, 'model');
assert.strictEqual(contents[2].role, 'user');
assert.strictEqual(contents[2].parts[0].text, 'What is Step 4?');
console.log('  [PASS] T-AI-006: buildGeminiContents guarantees alternating user-model-user sequence');

console.log('\n=== VECTOR 6: Diagnostic Error Formatter ===');
const authErr = diagnoseAiError(new Error('API key not valid'), 400);
assert.strictEqual(authErr.code, 'ERR_AUTH_INVALID_KEY');

const quotaErr = diagnoseAiError(new Error('Quota exceeded'), 429);
assert.strictEqual(quotaErr.code, 'ERR_RATE_LIMIT');
console.log('  [PASS] T-AI-007: diagnoseAiError accurately categorizes 400 invalid keys and 429 quota exhaustion');

console.log('\n' + '='.repeat(70));
console.log('   ALL 7 PULSEUP AI HARNESS ASSERTIONS PASSED (100% SUCCESS)');
console.log('='.repeat(70));
