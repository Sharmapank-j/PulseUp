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
    defaultModel: 'google/gemini-2.0-flash-001',
    models: [
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (OpenRouter)' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (Chat)' },
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

export const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recommended · Fastest)', tier: 'Standard' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Next-Gen Reasoning)', tier: 'Experimental' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Ultra-High Speed)', tier: 'Production' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Deep Clinical Cases)', tier: 'High-Intelligence' },
];

// ── Smart URL Resolver ──────────────────────────────────────────────────────
/**
 * Normalizes any user-entered base URL or full endpoint to prevent doubling path segments.
 * Handles cases like:
 * - https://api.groq.com/openai/v1 -> https://api.groq.com/openai/v1/chat/completions
 * - https://openrouter.ai/api/v1/ -> https://openrouter.ai/api/v1/chat/completions
 * - https://my-server.com/v1/chat/completions -> https://my-server.com/v1/chat/completions
 * - http://localhost:11434 -> http://localhost:11434/v1/chat/completions
 */
export function resolveChatEndpoint(rawUrl) {
  if (!rawUrl) return '';
  let u = rawUrl.trim().replace(/\/+$/, '');
  if (u.endsWith('/chat/completions')) {
    return u;
  }
  if (u.endsWith('/v1')) {
    return `${u}/chat/completions`;
  }
  return `${u}/v1/chat/completions`;
}

// ── Clean Key / Secret Helper ───────────────────────────────────────────────
export function cleanApiKey(key) {
  if (!key) return '';
  return key.trim().replace(/^['"]|['"]$/g, '');
}

// ── Diagnostic Error Formatter ──────────────────────────────────────────────
export function diagnoseAiError(err, status = 0) {
  const msg = err?.message || String(err || 'Unknown error');

  if (msg.includes('Failed to fetch') || err?.name === 'TypeError') {
    return {
      title: 'Connection or CORS Blocked',
      message: 'Failed to fetch from endpoint. If using a local server (Ollama), launch it with OLLAMA_ORIGINS="*" to permit browser requests. If using a remote server, check HTTPS and internet connectivity.',
      code: 'ERR_CORS_OR_NETWORK',
    };
  }

  if (status === 401 || msg.includes('401') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('api key not valid')) {
    return {
      title: 'Authentication Failed (401)',
      message: 'Invalid API key or Bearer token. Please verify your credentials in AI Settings.',
      code: 'ERR_AUTH_INVALID_KEY',
    };
  }

  if (status === 403 || msg.includes('403') || msg.toLowerCase().includes('forbidden')) {
    return {
      title: 'Access Forbidden (403)',
      message: 'Your account or API key lacks permissions or quota for this model. Check billing/credits on the provider portal.',
      code: 'ERR_FORBIDDEN',
    };
  }

  if (status === 404 || msg.includes('404')) {
    return {
      title: 'Endpoint Not Found (404)',
      message: 'The server did not find /chat/completions. Check your Base URL (e.g. ensure correct /v1 prefix).',
      code: 'ERR_NOT_FOUND',
    };
  }

  if (status === 429 || msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit')) {
    return {
      title: 'Rate Limit / Quota Exceeded (429)',
      message: 'The AI provider returned a rate limit or quota exhausted error. Try switching models or check your usage limit.',
      code: 'ERR_RATE_LIMIT',
    };
  }

  if (status >= 500) {
    return {
      title: `Server Error (${status})`,
      message: 'The AI cloud provider is experiencing downtime or internal capacity issues. Try again shortly.',
      code: 'ERR_SERVER_5XX',
    };
  }

  return {
    title: 'Inference Error',
    message: msg.slice(0, 220),
    code: 'ERR_GENERAL',
  };
}

// ── Connection Verification / Ping Tests ────────────────────────────────────
/**
 * Test Google Gemini connection with a 1-token prompt
 */
export async function testGeminiConnection(key, model = 'gemini-2.0-flash') {
  const cleanedKey = cleanApiKey(key);
  if (!cleanedKey) {
    throw new Error('Please enter a Gemini API Key before testing.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanedKey}`;
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 2 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const diag = diagnoseAiError(new Error(errData?.error?.message || `HTTP ${res.status}`), res.status);
      return { success: false, latency, error: diag.message, title: diag.title };
    }

    return { success: true, latency, model };
  } catch (err) {
    clearTimeout(timeoutId);
    const diag = diagnoseAiError(err);
    return { success: false, latency: Date.now() - startTime, error: diag.message, title: diag.title };
  }
}

/**
 * Test Cloud / OpenAI-compatible endpoint with a 1-token prompt
 */
export async function testCloudConnection(rawUrl, key, model = 'llama-3.3-70b-versatile') {
  const endpoint = resolveChatEndpoint(rawUrl);
  if (!endpoint) {
    throw new Error('Please provide a valid Base URL.');
  }

  const cleanedKey = cleanApiKey(key);
  const startTime = Date.now();

  const headers = {
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://pulseupdemo.netlify.app',
    'X-Title': 'PulseUp medimind.ai',
  };
  if (cleanedKey) {
    headers['Authorization'] = `Bearer ${cleanedKey}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 2,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const diag = diagnoseAiError(new Error(errText || `HTTP ${res.status}`), res.status);
      return { success: false, latency, error: diag.message, title: diag.title };
    }

    return { success: true, latency, model };
  } catch (err) {
    clearTimeout(timeoutId);
    const diag = diagnoseAiError(err);
    return { success: false, latency: Date.now() - startTime, error: diag.message, title: diag.title };
  }
}

// ── Full Chat Generation ────────────────────────────────────────────────────
/**
 * Call Gemini API with chat history & system instructions
 */
export async function callGeminiApi({ key, model = 'gemini-2.0-flash', messages, userText, systemPrompt }) {
  const cleanedKey = cleanApiKey(key);
  if (!cleanedKey) throw new Error('Missing Gemini API Key.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanedKey}`;

  const historyContents = (messages || [])
    .filter(m => (m.role === 'user' || m.role === 'assistant') && !m.isError)
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [
      ...historyContents,
      { role: 'user', parts: [{ text: userText }] },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const diag = diagnoseAiError(new Error(errData?.error?.message || `HTTP ${res.status}`), res.status);
      throw new Error(`${diag.title}: ${diag.message}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '(No response returned from Gemini)';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Gemini request timed out after 35 seconds. Please try again.');
    }
    throw err;
  }
}

/**
 * Call Cloud / OpenAI-compatible API with chat history & system prompt
 */
export async function callCloudLlmApi({ url, key, model, messages, userText, systemPrompt }) {
  const endpoint = resolveChatEndpoint(url);
  if (!endpoint) throw new Error('Invalid or missing Base URL for Cloud LLM.');

  const cleanedKey = cleanApiKey(key);
  const headers = {
    'Content-Type': 'application/json',
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://pulseupdemo.netlify.app',
    'X-Title': 'PulseUp medimind.ai',
  };
  if (cleanedKey) {
    headers['Authorization'] = `Bearer ${cleanedKey}`;
  }

  const history = (messages || [])
    .filter(m => (m.role === 'user' || m.role === 'assistant') && !m.isError)
    .map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text,
    }));

  const body = {
    model: model || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userText },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const diag = diagnoseAiError(new Error(errText || `HTTP ${res.status}`), res.status);
      throw new Error(`${diag.title}: ${diag.message}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '(No content returned from Cloud LLM)';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Cloud LLM request timed out after 35 seconds. Check endpoint speed or connectivity.');
    }
    throw err;
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
