/**
 * aiService.js
 * Comprehensive AI Bot Connection & Cloud-Served Provider Engine for PulseUp (medimind.ai)
 * Supports Google Gemini Cloud, Groq Cloud, OpenRouter, DeepSeek, OpenAI, Ollama, and Custom Cloud Endpoints.
 */

export const PULSEUP_AI_CONFIG_EVENT = 'pulseup_ai_config_updated';

// ── Cloud Provider Presets ──────────────────────────────────────────────────
export const CLOUD_PRESETS = [
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Ultra Fast / Free Tier',
    accent: 'text-amber-500 dark:text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    defaultUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Recommended)' },
      { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B 32k' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B IT' },
    ],
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    keyDoc: 'console.groq.com',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter Cloud',
    badge: 'Multi-Model Aggregator',
    accent: 'text-indigo-500 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    defaultUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-3.8-flash',
    models: [
      { id: 'google/gemini-3.8-flash', label: 'Gemini 3.8 Flash (OpenRouter)' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (Chat)' },
      { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Clinical Reasoning)' },
      { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku' },
    ],
    keyPlaceholder: 'sk-or-v1-...',
    keyUrl: 'https://openrouter.ai/keys',
    keyDoc: 'openrouter.ai',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Cloud',
    badge: 'Deep Clinical Reasoning',
    accent: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    defaultUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek V3 (deepseek-chat)' },
      { id: 'deepseek-reasoner', label: 'DeepSeek R1 (deepseek-reasoner)' },
    ],
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.deepseek.com',
    keyDoc: 'platform.deepseek.com',
  },
  {
    id: 'openai',
    name: 'OpenAI Cloud',
    badge: 'ChatGPT Enterprise API',
    accent: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    defaultUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Affordable)' },
      { id: 'gpt-4o', label: 'GPT-4o (Full Flagship)' },
    ],
    keyPlaceholder: 'sk-proj-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyDoc: 'platform.openai.com',
  },
  {
    id: 'together',
    name: 'Together AI',
    badge: 'Open Weights Cloud',
    accent: 'text-cyan-500 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    defaultUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    models: [
      { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', label: 'Llama 3.1 70B Turbo' },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7B Instruct' },
    ],
    keyPlaceholder: 'together_key_...',
    keyUrl: 'https://api.together.xyz/settings/api-keys',
    keyDoc: 'together.xyz',
  },
  {
    id: 'ollama',
    name: 'Self-Hosted / Local',
    badge: 'Ollama / vLLM / VPS',
    accent: 'text-purple-500 dark:text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    defaultUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    models: [
      { id: 'llama3', label: 'Llama 3' },
      { id: 'mistral', label: 'Mistral 7B' },
      { id: 'qwen2.5', label: 'Qwen 2.5' },
    ],
    keyPlaceholder: 'Optional (e.g. bearer token)',
    keyUrl: 'https://ollama.com',
    keyDoc: 'Requires OLLAMA_ORIGINS="*"',
  },
  {
    id: 'tunnel',
    name: 'HTTPS Tunnel / Bridge',
    badge: 'Cloudflared / untun / bridge',
    accent: 'text-cyan-500 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    defaultUrl: 'https://localhost:11435/v1',
    defaultModel: 'llama3',
    models: [
      { id: 'llama3', label: 'Llama 3' },
      { id: 'mistral', label: 'Mistral 7B' },
      { id: 'qwen2.5', label: 'Qwen 2.5' },
    ],
    keyPlaceholder: 'Bearer token or blank',
    keyUrl: '',
    keyDoc: 'Bypasses browser mixed content on HTTPS',
  },
  {
    id: 'gemini_openai',
    name: 'Gemini (OpenAI Endpoint)',
    badge: 'Official Google OpenAI API',
    accent: 'text-blue-500 dark:text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    defaultUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-3.8-flash',
    models: [
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Recommended · 1M Context)' },
      { id: 'gemini-3.8-flash-lite', label: 'Gemini 3.8 Flash-Lite (Fast & Cheap)' },
      { id: 'gemini-4-argon', label: 'Gemini 4 Argon (Advanced Clinical Reasoning)' },
    ],
    keyPlaceholder: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyDoc: 'aistudio.google.com',
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    badge: 'Custom OpenAI-Compatible',
    accent: 'text-zinc-500 dark:text-zinc-400',
    border: 'border-zinc-500/30',
    bg: 'bg-zinc-500/10',
    defaultUrl: '',
    defaultModel: 'llama3',
    models: [],
    keyPlaceholder: 'Bearer token or API key',
    keyUrl: '',
    keyDoc: 'Any /v1/chat/completions host',
  },
];

// ── Google Gemini Models (Gemini 3.8 Flash Series) ──────────────────────────
export const GEMINI_MODELS = [
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Recommended · Fastest & Most Accurate)', tier: '3.8-Flash-Series' },
  { id: 'gemini-3.8-flash-lite', label: 'Gemini 3.8 Flash-Lite (Ultra Low Latency)', tier: '3.8-Flash-Series' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (High Throughput)', tier: 'Flash-Lite' },
  { id: 'gemini-4-argon', label: 'Gemini 4 Argon (Deep Clinical Reasoning & Coding)', tier: 'Flagship-Reasoning' },
];

/**
 * Normalizes Gemini model identifiers and automatically migrates legacy or deprecated
 * models (gemini-1.5-*, gemini-2.0-*, gemini-2.5-*) to the Gemini 3.8 Flash series.
 */
export function normalizeGeminiModel(model) {
  if (!model) return 'gemini-3.8-flash';
  let m = model.trim().replace(/^models\//, '');
  // Auto-upgrade legacy and deprecated models (1.5, 2.0, 2.5) to the Gemini 3.8 Flash series
  if (/^gemini-(1\.5|2\.0|2\.5)/i.test(m)) {
    return 'gemini-3.8-flash';
  }
  return m;
}

// ── Smart URL Resolver ──────────────────────────────────────────────────────
/**
 * Normalizes any user-entered base URL or full endpoint to prevent doubling path segments.
 * Handles cases like:
 * - localhost:11434 -> http://localhost:11434/v1/chat/completions
 * - http://localhost:11434 -> http://localhost:11434/v1/chat/completions
 * - http://localhost:11434/api/chat -> http://localhost:11434/api/chat (Ollama native)
 * - api.groq.com/openai/v1 -> https://api.groq.com/openai/v1/chat/completions
 * - https://openrouter.ai/api/v1 -> https://openrouter.ai/api/v1/chat/completions
 */
export function resolveChatEndpoint(rawUrl) {
  if (!rawUrl) return '';
  let u = rawUrl.trim().replace(/\/+$/, '');

  // Auto-prepend protocol if omitted by user
  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(u)) {
      u = `http://${u}`;
    } else {
      u = `https://${u}`;
    }
  }

  // Preserve native Ollama endpoints if user explicitly targeted them
  if (u.endsWith('/api/chat') || u.endsWith('/api/generate')) {
    return u;
  }

  // Preserve existing /chat/completions
  if (u.endsWith('/chat/completions')) {
    return u;
  }

  // Normalize /v1
  if (u.endsWith('/v1')) {
    return `${u}/chat/completions`;
  }

  return `${u}/v1/chat/completions`;
}

// ── Clean Key / Secret Helper ───────────────────────────────────────────────
export function cleanApiKey(key) {
  if (!key) return '';
  let k = key.trim().replace(/^['"]|['"]$/g, '');
  if (k.toLowerCase().startsWith('bearer ')) {
    k = k.slice(7).trim();
  }
  if (k.toLowerCase().startsWith('api_key=')) {
    k = k.slice(8).trim();
  }
  if (k.toLowerCase() === 'optional' || k.toLowerCase() === 'none' || k.toLowerCase() === 'null') {
    return '';
  }
  return k;
}

// ── Strict CORS-Compliant Header Builder ────────────────────────────────────
/**
 * Generates headers for Cloud & Local LLM requests.
 * CRITICAL CORS SAFEGUARD:
 * Only OpenRouter supports and requests HTTP-Referer and X-Title.
 * Sending custom headers to local servers (Ollama, LM Studio) or Groq/DeepSeek
 * triggers preflight OPTIONS failure if they are not in Access-Control-Allow-Headers!
 */
export function buildCloudHeaders(url, cleanedKey) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (cleanedKey) {
    headers['Authorization'] = `Bearer ${cleanedKey}`;
  }

  // Only attach OpenRouter metadata headers when communicating with openrouter.ai
  if (url && url.includes('openrouter.ai')) {
    try {
      if (typeof window !== 'undefined' && window.location?.origin) {
        headers['HTTP-Referer'] = window.location.origin;
      }
    } catch {}
    headers['X-Title'] = 'PulseUp medimind.ai';
  }

  return headers;
}

// ── Diagnostic Error Formatter ──────────────────────────────────────────────
export function diagnoseAiError(err, status = 0, targetUrl = '') {
  const rawMsg = err?.message || String(err || 'Unknown error');
  let serverDetail = '';

  // Attempt to parse structured JSON error payloads returned by providers
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      serverDetail = parsed?.error?.message || parsed?.error || parsed?.message || parsed?.detail || '';
    }
  } catch {}

  const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
  const isHttpTarget = targetUrl && targetUrl.startsWith('http://');
  const isNetworkFailure = status === 0 && (rawMsg.includes('Failed to fetch') || err?.name === 'TypeError' || rawMsg.includes('NetworkError'));

  // Case 1: Browser Mixed Content Block (HTTPS page fetching HTTP local/remote server)
  if (isNetworkFailure && isHttps && isHttpTarget) {
    const isLocalhost = targetUrl && (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1'));
    if (isLocalhost) {
      return {
        title: 'Mixed Content Blocked by Browser (HTTPS → HTTP Localhost)',
        message: 'Your browser blocks unencrypted HTTP requests to localhost from HTTPS pages.\n\nQuick Solutions:\n1) Run PulseUp locally: `npm run dev` (opens http://localhost:3000, zero mixed-content restrictions)\n2) Free HTTPS Tunnel: Run `npx untun tunnel http://localhost:11434` or `npm run bridge:tunnel`\n3) Browser Permission: Click padlock/tune icon in address bar → Site settings → set Insecure content to "Allow".',
        code: 'ERR_MIXED_CONTENT_LOCAL',
        isMixedContent: true,
        isLocal: true,
        serverDetail,
      };
    }
    return {
      title: 'Insecure HTTP Blocked by Browser (HTTPS → HTTP)',
      message: 'Direct unencrypted HTTP requests from HTTPS sites are restricted by browser security policies. To connect directly from your browser to your custom endpoint, use an HTTPS URL (e.g. https://your-server.com) or an SSL/TLS tunnel.',
      code: 'ERR_MIXED_CONTENT_REMOTE',
      isMixedContent: true,
      serverDetail,
    };
  }

  // Case 2: CORS or Connection Refused (Failed to fetch)
  if (rawMsg.includes('Failed to fetch') || err?.name === 'TypeError') {
    const isLocalhost = targetUrl && (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1'));
    if (isLocalhost) {
      return {
        title: 'Local Server Connection Refused or CORS Blocked',
        message: 'Could not reach local server. 1) Ensure your local engine is running (e.g. `ollama serve` or LM Studio). 2) Ensure CORS is enabled (for Ollama: launch with `OLLAMA_ORIGINS="*"`, for LM Studio: check "Enable CORS" in Local Server settings).',
        code: 'ERR_LOCAL_CORS',
        isLocal: true,
        serverDetail,
      };
    }
    return {
      title: 'Network / CORS Error',
      message: serverDetail || 'Failed to fetch from endpoint. Verify your Base URL, internet connection, and provider CORS permissions.',
      code: 'ERR_CORS_OR_NETWORK',
      serverDetail,
    };
  }

  // Case 3: 401 Unauthorized
  if (status === 401 || rawMsg.includes('401') || rawMsg.toLowerCase().includes('unauthorized') || rawMsg.toLowerCase().includes('api key not valid')) {
    return {
      title: 'Authentication Failed (401)',
      message: serverDetail || 'Invalid API key or Bearer token. Please verify your credentials in Setup (⚙️).',
      code: 'ERR_AUTH_INVALID_KEY',
      serverDetail,
    };
  }

  // Case 4: 403 Forbidden
  if (status === 403 || rawMsg.includes('403') || rawMsg.toLowerCase().includes('forbidden')) {
    return {
      title: 'Access Forbidden (403)',
      message: serverDetail || 'Your account or API key lacks permissions or quota for this model. Check billing/credits on the provider portal.',
      code: 'ERR_FORBIDDEN',
      serverDetail,
    };
  }

  // Case 5: 404 Not Found / Model Not Found
  if (status === 404 || rawMsg.includes('404')) {
    const detailOrMsg = (serverDetail || rawMsg).toLowerCase();
    if (detailOrMsg.includes('model')) {
      return {
        title: 'Model Not Found (404)',
        message: serverDetail || rawMsg,
        code: 'ERR_MODEL_NOT_FOUND',
        serverDetail,
      };
    }
    return {
      title: 'Endpoint or Model Not Found (404)',
      message: serverDetail || 'The server did not recognize this model or endpoint. Check your Model Identifier and Base URL.',
      code: 'ERR_NOT_FOUND',
      serverDetail,
    };
  }

  // Case 6: 429 Rate Limit / Quota Exceeded
  if (status === 429 || rawMsg.includes('429') || rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('rate limit')) {
    return {
      title: 'Rate Limit / Quota Exceeded (429)',
      message: serverDetail || 'The provider returned a rate limit or quota exhausted error. Try switching models or check your usage limit.',
      code: 'ERR_RATE_LIMIT',
      serverDetail,
    };
  }

  // Case 7: 500+ Server Errors
  if (status >= 500) {
    return {
      title: `Server Error (${status})`,
      message: serverDetail || 'The AI server is experiencing capacity or internal execution issues. Try again shortly.',
      code: 'ERR_SERVER_5XX',
      serverDetail,
    };
  }

  return {
    title: 'Inference Error',
    message: serverDetail || rawMsg.slice(0, 240),
    code: 'ERR_GENERAL',
    serverDetail,
  };
}

// ── Sanitized Multiturn History Builders ────────────────────────────────────

/**
 * Builds Gemini-compliant contents array.
 * CRITICAL RULE: Must start with role: 'user', and alternate strictly between 'user' and 'model'.
 */
export function buildGeminiContents(messages, userText) {
  const firstUserIdx = (messages || []).findIndex(m => m.role === 'user');
  const rawHistory = firstUserIdx === -1 ? [] : messages.slice(firstUserIdx);

  const alternating = [];
  for (const m of rawHistory) {
    if (m.isError || !m.text?.trim()) continue;
    const role = m.role === 'assistant' ? 'model' : 'user';

    if (alternating.length === 0) {
      if (role === 'user') {
        alternating.push({ role: 'user', parts: [{ text: m.text.trim() }] });
      }
    } else {
      const prev = alternating[alternating.length - 1];
      if (prev.role === role) {
        prev.parts[0].text += `\n\n${m.text.trim()}`;
      } else {
        alternating.push({ role, parts: [{ text: m.text.trim() }] });
      }
    }
  }

  const trimmedUserText = (userText || '').trim();
  if (trimmedUserText) {
    if (alternating.length === 0) {
      alternating.push({ role: 'user', parts: [{ text: trimmedUserText }] });
    } else {
      const last = alternating[alternating.length - 1];
      if (last.role === 'user') {
        if (last.parts[0].text === trimmedUserText) {
          // already present
        } else if (last.parts[0].text.endsWith(trimmedUserText)) {
          // already appended
        } else {
          last.parts[0].text += `\n\n${trimmedUserText}`;
        }
      } else {
        alternating.push({ role: 'user', parts: [{ text: trimmedUserText }] });
      }
    }
  }

  return alternating;
}

/**
 * Builds OpenAI / Groq / Cloud-compliant messages array.
 * Includes system instructions at index 0, followed by alternating dialogue starting with user.
 */
export function buildOpenAiMessages(messages, userText, systemPrompt) {
  const msgs = [];
  if (systemPrompt && systemPrompt.trim()) {
    msgs.push({ role: 'system', content: systemPrompt.trim() });
  }

  const firstUserIdx = (messages || []).findIndex(m => m.role === 'user');
  const rawHistory = firstUserIdx === -1 ? [] : messages.slice(firstUserIdx);

  for (const m of rawHistory) {
    if (m.isError || !m.text?.trim()) continue;
    msgs.push({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text.trim(),
    });
  }

  const trimmed = (userText || '').trim();
  if (trimmed) {
    const last = msgs[msgs.length - 1];
    if (last && last.role === 'user' && last.content === trimmed) {
      // already present
    } else {
      msgs.push({ role: 'user', content: trimmed });
    }
  }

  return msgs;
}

// ── Direct Client-to-Provider AI Request Dispatcher ─────────────────────────
/**
 * Direct Client-to-Provider AI Request Dispatcher
 * Directly executes requests from the user's browser to the AI provider endpoint
 * using the credentials and configuration supplied by the user.
 * Operates purely client-side without relying on or borrowing third-party hosting serverless proxies.
 */
export async function dispatchAiRequest({ endpoint, headers, body, signal }) {
  return await fetch(endpoint, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
    signal,
  });
}

// ── Connection Verification / Ping Tests ────────────────────────────────────
/**
 * Test Google Gemini connection with a 1-token prompt (defaults to Gemini 3.8 Flash series)
 */
export async function testGeminiConnection(key, model = 'gemini-3.8-flash') {
  const cleanedKey = cleanApiKey(key);
  if (!cleanedKey) {
    throw new Error('Please enter a Gemini API Key before testing.');
  }

  const cleanModel = normalizeGeminiModel(model);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${cleanedKey}`;
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await dispatchAiRequest({
      endpoint,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': cleanedKey,
      },
      body: {
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 2 },
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const diag = diagnoseAiError(new Error(errData?.error?.message || `HTTP ${res.status}`), res.status, endpoint);
      return { success: false, latency, error: diag.message, title: diag.title };
    }

    return { success: true, latency, model: cleanModel };
  } catch (err) {
    clearTimeout(timeoutId);
    const diag = diagnoseAiError(err, 0, endpoint);
    return { success: false, latency: Date.now() - startTime, error: diag.message, title: diag.title };
  }
}

/**
 * Test Cloud / OpenAI-compatible endpoint with a test prompt
 */
export async function testCloudConnection(rawUrl, key, model = 'llama-3.3-70b-versatile') {
  const endpoint = resolveChatEndpoint(rawUrl);
  if (!endpoint) {
    throw new Error('Please provide a valid Base URL.');
  }

  const cleanedKey = cleanApiKey(key);
  const startTime = Date.now();
  const headers = buildCloudHeaders(endpoint, cleanedKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  // Detect Ollama native vs OpenAI endpoint format
  const isOllamaNative = endpoint.endsWith('/api/chat');
  const requestBody = isOllamaNative
    ? {
        model: model || 'llama3',
        messages: [{ role: 'user', content: 'ping' }],
        stream: false,
      }
    : {
        model: model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 10,
      };

  try {
    const res = await dispatchAiRequest({
      endpoint,
      headers,
      body: requestBody,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const diag = diagnoseAiError(new Error(errText || `HTTP ${res.status}`), res.status, endpoint);
      return { success: false, latency, error: diag.message, title: diag.title };
    }

    return { success: true, latency, model };
  } catch (err) {
    clearTimeout(timeoutId);
    const diag = diagnoseAiError(err, 0, endpoint);
    return { success: false, latency: Date.now() - startTime, error: diag.message, title: diag.title };
  }
}

// ── Full Chat Generation ────────────────────────────────────────────────────
/**
 * Call Gemini API with chat history & system instructions (defaults to Gemini 3.8 Flash series)
 */
export async function callGeminiApi({ key, model = 'gemini-3.8-flash', messages, userText, systemPrompt }) {
  const cleanedKey = cleanApiKey(key);
  if (!cleanedKey) throw new Error('Missing Gemini API Key.');

  const cleanModel = normalizeGeminiModel(model);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${cleanedKey}`;
  const contents = buildGeminiContents(messages, userText);

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await dispatchAiRequest({
      endpoint,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': cleanedKey,
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const diag = diagnoseAiError(new Error(errData?.error?.message || `HTTP ${res.status}`), res.status, endpoint);
      throw new Error(`${diag.title}: ${diag.message}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const text = parts.map(p => p.text || '').filter(Boolean).join('\n');
    if (text) {
      return text;
    }
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Gemini generated no response text (Finish Reason: ${candidate.finishReason}). Check safety filters.`);
    }
    return '(No response returned from Gemini)';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Gemini request timed out after 35 seconds. Please try again.');
    }
    throw err;
  }
}

/**
 * Call Cloud / OpenAI-compatible API or Ollama Native API with chat history & system prompt
 */
export async function callCloudLlmApi({ url, key, model, messages, userText, systemPrompt }) {
  const endpoint = resolveChatEndpoint(url);
  if (!endpoint) throw new Error('Invalid or missing Base URL for Cloud LLM.');

  const cleanedKey = cleanApiKey(key);
  const headers = buildCloudHeaders(endpoint, cleanedKey);
  const formattedMessages = buildOpenAiMessages(messages, userText, systemPrompt);

  const isOllamaNative = endpoint.endsWith('/api/chat');
  const requestBody = isOllamaNative
    ? {
        model: model || 'llama3',
        messages: formattedMessages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
      }
    : {
        model: model || 'llama-3.3-70b-versatile',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
      };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await dispatchAiRequest({
      endpoint,
      headers,
      body: requestBody,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const diag = diagnoseAiError(new Error(errText || `HTTP ${res.status}`), res.status, endpoint);
      throw new Error(`${diag.title}: ${diag.message}`);
    }

    const data = await res.json();

    // Check Ollama native format first
    if (isOllamaNative && data?.message?.content) {
      return data.message.content;
    }

    // Check OpenAI format with reasoning_content fallback
    const firstChoice = data?.choices?.[0];
    const content = firstChoice?.message?.content || firstChoice?.message?.reasoning_content || firstChoice?.text;
    if (content) {
      return content;
    }

    return '(No content returned from Cloud LLM)';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Cloud LLM request timed out after 45 seconds. Check endpoint speed or connectivity.');
    }
    const diag = diagnoseAiError(err, 0, endpoint);
    throw new Error(`${diag.title}: ${diag.message}`);
  }
}

// ── Persistent Storage Helper ───────────────────────────────────────────────
export const aiStorage = {
  get: (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },
  notifyUpdate: () => {
    try {
      window.dispatchEvent(new CustomEvent(PULSEUP_AI_CONFIG_EVENT));
    } catch {}
  },
};

// ── Multi-Session Chat Thread Management (Preserved History) ───────────────
export const PULSEUP_CHAT_SESSION_EVENT = 'pulseup_chat_sessions_updated';
const SESSIONS_STORAGE_KEY = 'pulseup_chat_sessions';
const ACTIVE_SESSION_STORAGE_KEY = 'pulseup_active_session_id';

export const DEFAULT_WELCOME_MESSAGE = {
  role: 'assistant',
  text: `### Welcome to medimind.ai 🩺✨\n\nI am your dedicated **Clinical & Medical Career Copilot** for PulseUp.\n\n**Capabilities & Preserved Workspaces:**\n- **NEET PG & NEXT Strategy**: High-yield subject prioritization and clinical recall drills.\n- **ICMR-STS & Research Grants**: Protocol design, ethics clearance (IEC), and study methodology.\n- **NMC CBME & AETCOM**: SPIKES protocol and reflective logbook entries.\n- **USMLE & Global Track**: Step 1/2 CK study calendars and ECFMG match guidance.\n- **Preserved History**: Multi-threaded chat sessions stored locally with search, rename, and export.\n- **Multi-Cloud Engine**: Connect to Google Gemini, Groq, OpenRouter, DeepSeek, or local Ollama.\n\nSelect a clinical mode or prompt template, or ask any inquiry below!`,
  id: 'welcome_init',
  timestamp: 'Just now'
};

export const INITIAL_DEFAULT_SESSIONS = [
  {
    id: 'session_welcome',
    title: 'Clinical & Career Orientation',
    mode: 'general',
    messages: [DEFAULT_WELCOME_MESSAGE],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: true,
    model: 'medimind-core',
  },
  {
    id: 'session_neet_prep',
    title: 'NEET PG High-Yield Strategy',
    mode: 'neet',
    messages: [
      {
        role: 'user',
        text: 'What is the optimal subject revision sequence for NEET PG in 6 months?',
        id: 'msg_neet_1',
        timestamp: 'Yesterday'
      },
      {
        role: 'assistant',
        text: `### NEET PG 6-Month Structured Revision Roadmap 📚\n\n**Phase 1: High-Yield Clinical Core (Months 1–3)**\n- **Medicine & Surgery**: 40% of total exam weightage. Focus on cardiology, neurology, acute abdomen, and surgical oncology.\n- **Obstetrics & Gynaecology**: High scoring. Master labor curves, PPH management, and gynecologic malignancies.\n- **Pediatrics**: Neonatal emergencies, developmental milestones, and congenital anomalies.\n\n**Phase 2: High-Scoring Pre- & Para-Clinicals (Month 4)**\n- **Pharmacology**: Autonomic nervous system, antimicrobial stewardship, and cardiac regimens.\n- **Pathology & Microbiology**: General pathology Robbins tables, tumor markers, and parasitic lifecycles.\n\n**Phase 3: Short Subjects & Grand Test Sprints (Months 5–6)**\n- Radiology, Dermatology, Psychiatry, Orthopedics, Ophthalmology, and ENT.\n- Solve 80–100 MCQs daily with mandatory mistake log review. Target 2,200+ correct on full-length mocks.`,
        id: 'msg_neet_2',
        timestamp: 'Yesterday'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    pinned: false,
    model: 'medimind-core',
  },
  {
    id: 'session_spikes_aetcom',
    title: 'SPIKES Counseling Case Review',
    mode: 'aetcom',
    messages: [
      {
        role: 'user',
        text: 'Explain AETCOM Module 3.1 SPIKES protocol for breaking bad news to relatives.',
        id: 'msg_aetcom_1',
        timestamp: '2 days ago'
      },
      {
        role: 'assistant',
        text: `### SPIKES Protocol Breakdown (NMC AETCOM Module 3.1) 🩺\n\n1. **Setting (S)**:\n   - Private consultation room with adequate seating for key family members.\n   - Turn off pagers/phones; arrange tissues and water in advance.\n\n2. **Perception (P)**:\n   - Inquire what the patient/relatives understand: *"What has the team told you so far regarding the scan?"*\n\n3. **Invitation (I)**:\n   - Ask how much detail they wish to hear: *"Would you like me to walk through the complete test findings or provide a broad summary?"*\n\n4. **Knowledge (K)**:\n   - Deliver news in plain, jargon-free language with a prior warning shot: *"Unfortunately, the MRI findings are not what we hoped for..."*\n\n5. **Empathy (E) - NURSE Framework**:\n   - **Name**: *"I see how overwhelming this is."*\n   - **Understand**: *"It is completely natural to feel shock."*\n   - **Respect & Support**: *"We are here with you at every step."*\n\n6. **Strategy & Summary (S)**:\n   - Formulate clear, realistic next steps and agree on follow-up timing.`,
        id: 'msg_aetcom_2',
        timestamp: '2 days ago'
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    pinned: false,
    model: 'medimind-core',
  }
];

export const chatSessionStorage = {
  getAllSessions: () => {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading chat sessions:', e);
    }
    // Seed with realistic initial sessions
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_SESSIONS));
    } catch {}
    return INITIAL_DEFAULT_SESSIONS;
  },

  saveAllSessions: (sessions) => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      chatSessionStorage.notify();
    } catch (e) {
      console.warn('Error saving chat sessions:', e);
    }
  },

  getActiveSessionId: () => {
    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return 'session_welcome';
  },

  setActiveSessionId: (id) => {
    try {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(id));
      chatSessionStorage.notify();
    } catch {}
  },

  createSession: ({ mode = 'general', title = 'New Conversation', initialPrompt = null } = {}) => {
    const sessions = chatSessionStorage.getAllSessions();
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionTitle = title || (initialPrompt ? initialPrompt.slice(0, 38) + (initialPrompt.length > 38 ? '...' : '') : 'Clinical Case Consultation');

    const newSession = {
      id,
      title: sessionTitle,
      mode,
      messages: [
        {
          role: 'assistant',
          text: `### medimind.ai — Active Thread: ${sessionTitle} 🩺\n\nHow can I assist your clinical preparation, bioethics inquiry, or grant research in this session?`,
          id: `msg_welcome_${Date.now()}`,
          timestamp: 'Just now'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      model: 'medimind-core',
    };

    const updated = [newSession, ...sessions];
    chatSessionStorage.saveAllSessions(updated);
    chatSessionStorage.setActiveSessionId(id);
    return newSession;
  },

  updateSessionMessages: (sessionId, messages) => {
    const sessions = chatSessionStorage.getAllSessions();
    const target = sessions.find(s => s.id === sessionId);
    if (!target) return;

    // Auto-update title if it was "New Conversation" or "Clinical Case Consultation" and first user message exists
    let title = target.title;
    if (title === 'New Conversation' || title === 'Clinical Case Consultation') {
      const firstUser = messages.find(m => m.role === 'user');
      if (firstUser && firstUser.text) {
        title = firstUser.text.slice(0, 42).trim() + (firstUser.text.length > 42 ? '...' : '');
      }
    }

    const updated = sessions.map(s => s.id === sessionId ? {
      ...s,
      title,
      messages,
      updatedAt: new Date().toISOString()
    } : s);

    chatSessionStorage.saveAllSessions(updated);
  },

  renameSession: (sessionId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    const sessions = chatSessionStorage.getAllSessions();
    const updated = sessions.map(s => s.id === sessionId ? { ...s, title: newTitle.trim(), updatedAt: new Date().toISOString() } : s);
    chatSessionStorage.saveAllSessions(updated);
  },

  togglePinSession: (sessionId) => {
    const sessions = chatSessionStorage.getAllSessions();
    const updated = sessions.map(s => s.id === sessionId ? { ...s, pinned: !s.pinned } : s);
    // Sort pinned to top
    updated.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    chatSessionStorage.saveAllSessions(updated);
  },

  deleteSession: (sessionId) => {
    const sessions = chatSessionStorage.getAllSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    const finalSessions = filtered.length > 0 ? filtered : INITIAL_DEFAULT_SESSIONS;
    chatSessionStorage.saveAllSessions(finalSessions);
    const active = chatSessionStorage.getActiveSessionId();
    if (active === sessionId) {
      chatSessionStorage.setActiveSessionId(finalSessions[0].id);
    }
  },

  clearAllSessions: () => {
    chatSessionStorage.saveAllSessions(INITIAL_DEFAULT_SESSIONS);
    chatSessionStorage.setActiveSessionId(INITIAL_DEFAULT_SESSIONS[0].id);
  },

  exportSessionAsMarkdown: (sessionOrId) => {
    if (!sessionOrId) return '';
    const session = typeof sessionOrId === 'string'
      ? chatSessionStorage.getAllSessions().find(s => s.id === sessionOrId)
      : sessionOrId;
    if (!session) return '';

    let md = `# medimind.ai Consultation Log\n\n`;
    md += `**Topic:** ${session.title || 'Untitled Consultation'}\n`;
    md += `**Date:** ${new Date(session.createdAt || Date.now()).toLocaleDateString()} ${new Date(session.createdAt || Date.now()).toLocaleTimeString()}\n`;
    md += `**Clinical Domain:** ${(session.mode || 'general').toUpperCase()}\n`;
    md += `**Session ID:** \`${session.id || 'N/A'}\`\n\n---\n\n`;

    (session.messages || []).forEach((m, idx) => {
      const sender = m.role === 'assistant' ? 'medimind.ai (Clinical Copilot)' : 'Resident / Physician';
      md += `### ${idx + 1}. ${sender} (${m.timestamp || 'Recorded'})\n\n`;
      md += `${m.text}\n\n---\n\n`;
    });

    return md;
  },

  notify: () => {
    try {
      window.dispatchEvent(new CustomEvent(PULSEUP_CHAT_SESSION_EVENT));
    } catch {}
  }
};

// ── Clinical Prompt Templates for Prototype Workflows ──────────────────────
export const CLINICAL_PROMPT_TEMPLATES = [
  {
    category: 'NEET PG / NEXT',
    title: 'High-Yield Clinical Recall Drill',
    prompt: 'Give me 3 high-yield clinical vignette MCQs on Acid-Base and Electrolyte disorders with tricky distractors, Harrison citations, and diagnostic traps.'
  },
  {
    category: 'AETCOM Bioethics',
    title: 'SPIKES Protocol Counseling Script',
    prompt: 'Draft an empathetic, non-jargonized communication script following the SPIKES protocol for counseling a family regarding newly diagnosed high-grade glioma.'
  },
  {
    category: 'ICMR-STS Research',
    title: 'Observational Protocol & Sample Size',
    prompt: 'Formulate an ICMR-STS protocol draft on "Prevalence of Physician Burnout among Emergency Residents": primary objective, sample size formula, and IEC clearance checklist.'
  },
  {
    category: 'Emergency Medicine',
    title: 'SBAR Acute STEMI Triage Handover',
    prompt: 'Structure a complete SBAR handover from Emergency Triage to Cath Lab for an acute inferior wall STEMI with right ventricular extension.'
  },
  {
    category: 'Pharmacology',
    title: 'Drug Interaction & Organophosphate Protocol',
    prompt: 'Explain the definitive clinical endpoints for Atropine administration in acute Organophosphate poisoning versus Pralidoxime (PAM) therapy.'
  },
  {
    category: 'Career & Residency',
    title: 'Central JR vs Dedicated NEET PG Repeat',
    prompt: 'Analyze the career trade-offs between joining a Central JR post (7th CPC Level 10, ₹89,420/mo at AIIMS/MAMC) versus full-time NEET PG preparation.'
  }
];

// ── Prototype Clinical Intelligence Engine (Offline / Standalone) ───────────
/**
 * Realistic clinical domain knowledge synthesizer for prototype demonstration
 * Handles NEET PG, AETCOM, ICMR, USMLE, Emergency, Pharmacology, and Central Residency queries.
 */
export function generatePrototypeResponse(userText, mode = 'general') {
  const q = (userText || '').toLowerCase().trim();

  // 0. Acid-Base, Anion Gap & Electrolyte Disorders
  if (q.includes('acid') || q.includes('base') || q.includes('anion gap') || q.includes('electrolyte') || q.includes('potassium') || q.includes('sodium')) {
    return `### High-Yield Acid-Base & Electrolyte Diagnostic Algorithm 🧪\n\n**1. High Anion Gap Metabolic Acidosis (HAGMA):**\n- **Formula**: $\\text{Anion Gap} = [\\text{Na}^+] - ([\\text{Cl}^-] + [\\text{HCO}_3^-])$. Normal range: **8–12 mEq/L** (adjust for albumin: +2.5 for every 1 g/dL drop below 4 g/dL).\n- **High-Yield Etiology Mnemonic (MUDPILES / GOLD MARK)**:\n  - **M**: Methanol intoxication\n  - **U**: Uremia (severe renal failure)\n  - **D**: Diabetic Ketoacidosis (DKA) / Alcoholic ketoacidosis\n  - **P**: Paracetamol / Propylene glycol toxicity\n  - **I**: Infection / Isoniazid\n  - **L**: Lactic Acidosis (Type A tissue hypoperfusion vs. Type B mitochondrial toxin)\n  - **E**: Ethylene glycol (calcium oxalate monohydrate envelope crystals)\n  - **S**: Salicylates (classic mixed primary respiratory alkalosis + metabolic acidosis)\n\n**2. Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloremic):**\n- **Differential**: Diarrhea (GI bicarbonate loss) vs Renal Tubular Acidosis (RTA Type 1, 2, 4).\n- Check Urine Anion Gap: $[\\text{Na}^+] + [\\text{K}^+] - [\\text{Cl}^-]$. Negative in diarrhea; positive in RTA Type 1.\n\n**3. Winter's Formula for Respiratory Compensation:**\n- Expected $\\text{PaCO}_2 = (1.5 \\times [\\text{HCO}_3^-]) + 8 \\pm 2$. If measured $\\text{PaCO}_2 > \\text{expected}$, concurrent respiratory acidosis exists.`;
  }

  // 1. NEET PG / NEXT Questions
  if (q.includes('neet') || q.includes('next') || q.includes('mcq') || q.includes('prep') || q.includes('revision') || q.includes('marrow')) {
    return `### NEET PG / NEXT Strategic High-Yield Review 🎯\n\n**1. Subject Weightage Hierarchy:**\n- **Tier 1 (High Yield Core)**: Internal Medicine, Surgery, Obstetrics & Gynaecology, Pediatrics, Pathology, Pharmacology (~65% of exam).\n- **Tier 2 (High ROI Short Subjects)**: Radiology, Dermatology, Psychiatry, Orthopedics, Ophthalmology, ENT (High scoring, concise syllabus).\n\n**2. Clinical Recall Traps to Avoid:**\n- Always identify the **age, gender, hemodynamic stability (BP/HR)**, and **time course** in clinical vignettes before looking at answer options.\n- Beware of contraindications in emergencies (e.g. Nitrates in RV Infarct; Metformin before contrast imaging).\n\n**3. Daily Action Plan:**\n- Solve **75–100 MCQs daily** with active review of bookmarked incorrect questions.\n- Attempt 1 full-length Grand Test every 10–14 days. Track percentile progression toward the 95th percentile target.`;
  }

  // 2. AETCOM & Bioethics (SPIKES, Consent, DNR, Conflict)
  if (q.includes('aetcom') || q.includes('spikes') || q.includes('bad news') || q.includes('consent') || q.includes('dnr') || q.includes('ethics') || q.includes('mob')) {
    return `### NMC AETCOM Bioethics & Communication Protocol 🩺\n\n**1. SPIKES Framework for Serious Diagnosis:**\n- **Setting**: Private consultation space, eye level seating, pagers muted.\n- **Perception**: Assess family baseline understanding (*"What have the doctors shared with you so far?"*).\n- **Invitation**: Calibrate level of technical detail preferred by the patient/kin.\n- **Knowledge**: Fire a warning shot (*"Unfortunately, the biopsy showed an aggressive growth"*); avoid complex medical jargon.\n- **Empathy (NURSE)**: Name emotion, Understand perspective, Respect coping, Support care.\n- **Strategy & Summary**: Delineate an immediate 3-step management trajectory.\n\n**2. Medico-Legal Emergency Consent (*Supreme Court of India*):**\n- Under *Samira Kohli vs. Dr. Prabha Manchanda (2008)*, life-saving emergency surgical interventions in unconscious or unrepresented patients are protected under the **Doctrine of Necessity** without civil or criminal liability. Two senior consultants must co-sign the emergency clinical chart.`;
  }

  // 3. ICMR-STS & Clinical Research Methodology
  if (q.includes('icmr') || q.includes('sts') || q.includes('sample size') || q.includes('iec') || q.includes('protocol') || q.includes('grant') || q.includes('registry')) {
    return `### ICMR-STS & Clinical Research Protocol Formulation 🔬\n\n**1. Essential ICMR-STS Proposal Structure:**\n- **Title**: Specific, measurable, and geographically bounded (e.g., *"Efficacy of Telemetry-Guided Thrombolysis in Acute Ischemic Stroke: A Prospective Study at MAMC"*).\n- **Introduction & Novelty**: 300 words establishing the Indian burden of disease and clinical knowledge gap.\n- **Methodology**: Defined study design (Cross-Sectional / Prospective Cohort), inclusion/exclusion criteria, and standardized outcome scales (e.g. modified Rankin Scale).\n\n**2. Sample Size Calculation Formula:**\n- For prevalence studies:\n  $$n = \\frac{Z_{1-\\alpha/2}^2 \\cdot p(1-p)}{d^2}$$\n  Where $Z = 1.96$ (95% CI), $p$ is expected prevalence, and $d$ is absolute precision (typically 5%).\n\n**3. Institutional Ethics Committee (IEC) Mandatory Checklist:**\n- Patient Information Sheet (PIS) & Informed Consent Form (ICF) in English + Regional Language (Hindi/Vernacular).\n- Principal Investigator declaration, CTRI registration timeline, and participant confidentiality protocol.`;
  }

  // 4. USMLE Step 1/2 CK & ECFMG Pathway
  if (q.includes('usmle') || q.includes('step 1') || q.includes('step 2') || q.includes('ecfmg') || q.includes('uworld') || q.includes('match')) {
    return `### USMLE & Global Residency Strategy for Indian MBBS Graduates 🌐\n\n**1. Chronological Timeline:**\n- **Step 1 (Pass/Fail)**: Target completion by end of Final Year MBBS or early Internship. Core resources: *First Aid*, *Pathoma (Chapters 1–3 mandatory)*, and *UWorld* (1 comprehensive pass with 65%+ average).\n- **Step 2 CK (Scored)**: The primary screening metric for residency programs. Aim for **250+**. Complete 2 full passes of UWorld Step 2 CK + NBME practice forms 9–14.\n\n**2. US Clinical Experience (USCE):**\n- Secure 3–4 months of hands-on sub-internships or university externships before ERAS submission in September.\n- Aim for 3 strong letters of recommendation (LoRs) from US academic physicians on university letterheads.`;
  }

  // 5. Emergency Medicine, ECG & Clinical Spotters
  if (q.includes('stemi') || q.includes('ecg') || q.includes('infarct') || q.includes('troponin') || q.includes('chest pain') || q.includes('shock') || q.includes('pneumothorax')) {
    return `### Emergency Medicine & ECG Diagnostic Algorithm 🚨\n\n**1. Inferior STEMI with Right Ventricular (RV) Extension:**\n- **Diagnostic Hallmark**: ST elevation in II, III, aVF accompanied by >= 1mm ST elevation in right-sided lead **V4R**.\n- **Crucial Clinical Trap**: **NITRATES & DIURETICS ARE STRICTLY CONTRAINDICATED**! RV infarction is profoundly preload-dependent. Nitrates precipitate sudden catastrophic hypotension.\n- **Emergency Management**: Rapid IV Normal Saline bolus (1,000 mL) to restore right ventricular preload + urgent Primary PCI within 90 minutes.\n\n**2. Tension Pneumothorax Immediate Action:**\n- Immediate needle thoracostomy at **4th/5th Intercostal Space, Anterior Axillary Line** (or 2nd ICS Mid-Clavicular Line) with wide-bore cannula prior to obtaining chest radiography. Follow immediately with formal chest tube thoracostomy.`;
  }

  // 6. Pharmacology & Poisoning
  if (q.includes('atropine') || q.includes('poison') || q.includes('organophosphate') || q.includes('pralidoxime') || q.includes('drug') || q.includes('dosage')) {
    return `### Clinical Pharmacology & Acute Poisoning Protocol 💊\n\n**1. Organophosphate Poisoning (Muscarinic & Nicotinic Crisis):**\n- **Emergency Atropine Protocol**: Initial bolus 2–4 mg IV every 5–10 minutes, doubling dose until full atropinization is reached.\n- **Definitive Atropinization Endpoints**: Clearing of pulmonary bronchoconstriction/crackles and drying of tracheobronchial secretions! (*Pupil size and heart rate alone are NOT reliable indicators of respiratory recovery*).\n- **Pralidoxime (PAM)**: 1–2 g IV infusion for regenerating phosphorylated acetylcholinesterase before irreversible enzyme "aging" occurs (within 24–48 hours).\n\n**2. Essential Precaution**: Watch for delayed intermediate syndrome (muscle weakness and respiratory paralysis) on days 2–4.`;
  }

  // 7. Central Residency & Pay Scales (7th CPC)
  if (q.includes('aiims') || q.includes('salary') || q.includes('jr') || q.includes('residency') || q.includes('stipend') || q.includes('cpc') || q.includes('mamc')) {
    return `### Central Medical Residency & Compensation Landscape 🇮🇳\n\n**1. 7th Central Pay Commission (CPC) Pay Scale:**\n- **Junior Resident (Level 10)**: Basic Pay ₹56,100 + Dearness Allowance (DA ~50%) + HRA (27% in Delhi) + Non-Practicing Allowance (NPA 20%) = **₹89,420 to ₹94,500/month**.\n- **Institutes**: AIIMS New Delhi, Safdarjung Hospital, Dr. RML Hospital, LHMC, and MAMC.\n\n**2. Non-Academic JR vs Academic PG Dilemma:**\n- A 6-to-12 month Non-Academic JR post provides intense procedural exposure (100+ lines, intubations, lumbar punctures) and financial independence while permitting evening MCQ revision. Ideal for candidates within 5,000–15,000 ranks seeking top clinical specialties in subsequent rounds.`;
  }

  // Default Structured Evidence-Based Response
  return `### Clinical & Professional Guidance Overview 🩺\n\nRegarding your query on **"${userText.slice(0, 50)}"**:\n\n**1. Clinical Core & Evidence-Based Synthesis:**\n- In accordance with standard textbook literature (*Harrison's 21st Ed.* / *Nelson Pediatrics 21st Ed.*) and NMC guidelines, approach this with structured diagnostic prioritization.\n- Always correlate objective clinical parameters (vital signs, GCS, arterial blood gas, organ function markers) with patient history.\n\n**2. NMC Competency & Career Relevance:**\n- Document related procedural or clinical encounters in your verified e-Logbook under State Medical Council supervision.\n- Engage with senior department faculty using the **SBAR format** (*Situation, Background, Assessment, Recommendation*) for case discussions.\n\n**3. Actionable Next Steps:**\n- You can explore related catalog opportunities in the **Bharat Opportunities Engine** or initiate a dedicated sprint workbench in **Goal Spaces**.\n\n*Feel free to ask for a specific differential diagnosis, drug protocol, or study schedule drill!*`;
}

/**
 * Simulate fluid progressive token streaming for realistic prototype experience
 */
export function simulateStreamResponse(fullText, onChunk, onComplete, speedMs = 12) {
  const words = fullText.split(' ');
  let currentIdx = 0;
  let accumulated = '';

  const interval = setInterval(() => {
    if (currentIdx < words.length) {
      accumulated += (currentIdx > 0 ? ' ' : '') + words[currentIdx];
      currentIdx++;
      onChunk(accumulated);
    } else {
      clearInterval(interval);
      if (onComplete) onComplete(accumulated);
    }
  }, speedMs);

  return () => clearInterval(interval);
}
