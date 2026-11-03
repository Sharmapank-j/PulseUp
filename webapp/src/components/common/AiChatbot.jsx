import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Key,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  Sparkles,
  Trash2,
  Copy,
  CheckCheck,
  Settings,
  Server,
  Cpu,
  Zap,
} from 'lucide-react';

// ─── System prompt tuned for PulseUp medical career context ───────────────
const SYSTEM_INSTRUCTION = `You are PulseAI, the embedded AI assistant for PulseUp — a career operating system for Indian medical students, interns, and residents.

Your expertise covers:
- NEET PG / NEXT exam strategy, high-yield topics, and subject prioritisation
- NMC CBME curriculum, AETCOM competencies, and reflective practice
- ICMR-STS, DBT-JRF, and research grants for medical undergraduates
- MD/MS/DNB selection, residency application strategy, and college counselling
- USMLE Step 1/2 CK for Indian MBBS graduates pursuing global careers
- Medical college fests, quiz circuits, and Pulse Credits earning strategies
- Clinical skill development, procedure logbooks, and competency milestones
- Research methodology, publication strategy, impact factor vs open-access debates
- ABDM Health ID, NMC registration, and medical passport credential building
- Bioethics case discussions relevant to AETCOM modules

Personality: Warm, knowledgeable, evidence-based. Use concise bullet points when listing steps. Cite Indian medical contexts specifically (NMC, MAMC, AIIMS, JIPMER, CMC Vellore). Keep responses crisp — this is a sidebar chatbot, not a long essay generator.

Important: Never give actual patient-level clinical diagnosis or treatment advice. For clinical scenarios, give educational explanations for learning purposes only.`;

// ─── Markdown-lite renderer ────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null;
    const bullet = line.match(/^(\s*[-*•])\s+(.+)/);
    if (bullet) return (
      <div key={i} className="flex gap-2 text-xs leading-relaxed">
        <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
        <span dangerouslySetInnerHTML={{ __html: inlineFmt(bullet[2]) }} />
      </div>
    );
    const num = line.match(/^(\d+)\.\s+(.+)/);
    if (num) return (
      <div key={i} className="flex gap-2 text-xs leading-relaxed">
        <span className="text-blue-400 font-mono flex-shrink-0 w-4">{num[1]}.</span>
        <span dangerouslySetInnerHTML={{ __html: inlineFmt(num[2]) }} />
      </div>
    );
    if (line.startsWith('## ')) return <p key={i} className="font-bold text-xs text-zinc-100 mt-2">{line.slice(3)}</p>;
    if (line.startsWith('# '))  return <p key={i} className="font-bold text-xs text-blue-300 mt-2">{line.slice(2)}</p>;
    if (line.trim() === '')     return <div key={i} className="h-1.5" />;
    return <p key={i} className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFmt(line) }} />;
  }).filter(Boolean);
}
function inlineFmt(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-zinc-700 text-emerald-300 px-1 rounded text-[10px] font-mono">$1</code>');
}

// ─── Starter prompts ───────────────────────────────────────────────────────
const STARTERS = [
  'How should I start NEET PG prep in 6 months?',
  'What ICMR-STS projects suit a 2nd year MBBS student?',
  'Explain AETCOM Module 4.1 SPIKES protocol',
  'Best strategy for USMLE Step 1 from India?',
];

// ─── Fallback scripted responses (no API key) ──────────────────────────────
function scriptedResponse(userMsg) {
  const q = userMsg.toLowerCase();
  if (q.includes('neet') || q.includes('next exam'))
    return "**NEET PG / NEXT Preparation Strategy:**\n\n- Start with **Medicine, Surgery, Obs & Gynae** — highest weightage\n- Use **Marrow** or **DAMS** for structured video learning\n- Attempt 50+ MCQs daily from Day 1\n- Grand test analysis matters more than raw score\n- Target **2200+ correct** in Marrow full-length tests for a competitive rank\n- NEXT has 2 papers: `Paper 1` (pre-clinical) + `Paper 2` (clinical reasoning focus)";
  if (q.includes('icmr') || q.includes('sts'))
    return "**ICMR-STS (Short-Term Studentship):**\n\n- Open to **1st–final year MBBS students**\n- Stipend: **₹10,000/month** for 2 months (May–July)\n- Apply via `sts.icmr.gov.in` by **February** each year\n- Choose **epidemiology or clinical audit** — feasible in 2 months\n- Adds 50 PC on PulseUp and looks great on your Medical Passport!";
  if (q.includes('aetcom') || q.includes('spikes'))
    return "**AETCOM SPIKES Protocol (Module 4.1):**\n\n- **S**etting — private space, support persons present\n- **P**erception — assess existing patient knowledge\n- **I**nvitation — ask how much detail they want\n- **K**nowledge — plain language, no jargon\n- **E**motions — acknowledge grief with empathy\n- **S**trategy — outline next steps clearly\n\nYour PulseUp Reflective Journal entries count toward CBME Phase IV certification.";
  if (q.includes('usmle') || q.includes('step 1'))
    return "**USMLE for Indian MBBS Graduates:**\n\n- **Step 1** is now Pass/Fail — focus score on **Step 2 CK ≥ 245**\n- Non-negotiable resources: `UWorld` + `Amboss`\n- ECFMG certification is required before applying for residency\n- Timeline: 12–18 months from internship for both steps\n- Many MAMC/AIIMS graduates are now PGY-1 in the US — very achievable!";
  return "I'm **PulseAI** 🩺 — try asking me about NEET PG, ICMR-STS, AETCOM modules, or USMLE prep.\n\nFor real AI (full context & reasoning), configure an **AI provider** using the ⚙️ settings icon above.";
}

// ─── Provider config stored in localStorage ────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ═══════════════════════════════════════════════════════════════════════════
export default function AiChatbot({ onToast }) {
  const [isOpen,   setIsOpen]   = useState(false);
  const [showCfg,  setShowCfg]  = useState(false);

  // ── Provider: 'gemini' | 'custom' | 'none' ──────────────────────────────
  const [provider,   setProvider]   = useState(() => LS.get('pulseup_ai_provider', 'none'));
  // Gemini
  const [geminiKey,  setGeminiKey]  = useState(() => LS.get('pulseup_gemini_key', ''));
  const [geminiDraft,setGeminiDraft]= useState('');
  // Custom / OpenAI-compatible
  const [customUrl,  setCustomUrl]  = useState(() => LS.get('pulseup_custom_url', ''));
  const [customKey,  setCustomKey]  = useState(() => LS.get('pulseup_custom_key', ''));
  const [customModel,setCustomModel]= useState(() => LS.get('pulseup_custom_model', 'gpt-4o'));
  const [customUrlD, setCustomUrlD] = useState('');
  const [customKeyD, setCustomKeyD] = useState('');
  const [customModD, setCustomModD] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages,  setMessages]  = useState([{
    role: 'assistant',
    text: "Hi! I'm **PulseAI** 👋 — your medical career assistant.\n\nI help with NEET PG strategy, AETCOM modules, research grants, USMLE prep, and more.\n\nConfigure an AI provider via ⚙️ above, or pick a starter question below:",
    id: 'welcome',
  }]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [copiedId,  setCopiedId]  = useState(null);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // ── Save Gemini config ────────────────────────────────────────────────────
  const saveGemini = () => {
    const k = geminiDraft.trim();
    if (!k.startsWith('AIza')) {
      onToast({ type: 'error', title: 'Invalid Key', message: 'Gemini keys start with "AIza". Get one free at aistudio.google.com' });
      return;
    }
    setGeminiKey(k); LS.set('pulseup_gemini_key', k);
    setProvider('gemini'); LS.set('pulseup_ai_provider', 'gemini');
    setShowCfg(false);
    onToast({ type: 'success', title: 'Gemini AI Active', message: 'PulseAI now powered by gemini-3.8-flash ✨' });
  };

  // ── Save Custom LLM config ────────────────────────────────────────────────
  const saveCustom = () => {
    const url = customUrlD.trim().replace(/\/$/, '');
    if (!url.startsWith('http')) {
      onToast({ type: 'error', title: 'Invalid URL', message: 'Base URL must start with http:// or https://' });
      return;
    }
    const model = customModD.trim() || 'gpt-4o';
    setCustomUrl(url);  LS.set('pulseup_custom_url', url);
    setCustomKey(customKeyD.trim()); LS.set('pulseup_custom_key', customKeyD.trim());
    setCustomModel(model); LS.set('pulseup_custom_model', model);
    setProvider('custom'); LS.set('pulseup_ai_provider', 'custom');
    setShowCfg(false);
    onToast({ type: 'success', title: 'Custom LLM Active', message: `Connected to ${url} · model: ${model}` });
  };

  const clearProviders = () => {
    setProvider('none'); LS.set('pulseup_ai_provider', 'none');
    setGeminiKey(''); LS.set('pulseup_gemini_key', '');
    setCustomUrl(''); setCustomKey(''); setCustomModel('gpt-4o');
    onToast({ type: 'info', title: 'Providers Cleared', message: 'Switched back to scripted responses.' });
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', text: 'Chat cleared! How can I help you with your medical career today?', id: 'clr-' + Date.now() }]);
  };

  const copyMsg = (text, id) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1800); });
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = { role: 'user', text: userText, id: 'u-' + Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      let reply = '';

      // ── GEMINI provider ────────────────────────────────────────────────
      if (provider === 'gemini' && geminiKey) {
        // Direct REST call — no SDK needed, zero extra bundle weight
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;

        // Build message history for multi-turn
        const historyContents = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }],
          }));

        const body = {
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [
            ...historyContents,
            { role: 'user', parts: [{ text: userText }] },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(No response)';

      // ── CUSTOM / OpenAI-compatible provider ───────────────────────────
      } else if (provider === 'custom' && customUrl) {
        const endpoint = `${customUrl}/v1/chat/completions`;
        const headers = { 'Content-Type': 'application/json' };
        if (customKey) headers['Authorization'] = `Bearer ${customKey}`;

        // Build conversation history from messages state
        const history = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

        const body = {
          model: customModel,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            ...history,
            { role: 'user', content: userText },
          ],
          temperature: 0.7,
          max_tokens: 1024,
          stream: false,
        };

        const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
        }
        const data = await res.json();
        reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '(Empty response from model)';

      // ── Scripted fallback ──────────────────────────────────────────────
      } else {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 500));
        reply = scriptedResponse(userText);
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply, id: 'a-' + Date.now() }]);
    } catch (err) {
      console.error('PulseAI error:', err);
      const isAuthErr = err?.message?.includes('401') || err?.message?.includes('API_KEY') || err?.status === 401;
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: isAuthErr
          ? '**Auth Error:** Your API key appears invalid or expired. Tap ⚙️ to update your credentials.'
          : `**Connection Error:** ${err?.message || 'Something went wrong.'}\n\nCheck that your model server is running and the endpoint URL is correct.`,
        id: 'err-' + Date.now(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Provider label helpers ────────────────────────────────────────────────
  const providerLabel = provider === 'gemini'
    ? '● Gemini AI'
    : provider === 'custom'
    ? `● ${customModel}`
    : '○ Scripted Mode';

  const providerColor = provider !== 'none' ? 'text-emerald-400' : 'text-zinc-500';

  // ════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open PulseAI chat"
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${
          isOpen
            ? 'bg-zinc-800 border border-zinc-700 rotate-0'
            : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:scale-105 hover:shadow-blue-500/30'
        }`}
      >
        {isOpen
          ? <ChevronDown size={22} className="text-zinc-300" />
          : (
            <div className="relative">
              <Bot size={24} className="text-white" />
              <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${provider !== 'none' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            </div>
          )
        }
      </button>

      {/* ── Chat Panel ── */}
      <div
        className={`fixed bottom-24 right-5 z-50 w-[380px] max-w-[calc(100vw-20px)] flex flex-col rounded-2xl shadow-2xl border border-zinc-700/60 bg-zinc-900 overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '540px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                PulseAI <Sparkles size={11} className="text-amber-400" />
              </h3>
              <p className={`text-[10px] font-mono ${providerColor}`}>{providerLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setShowCfg(c => !c); setGeminiDraft(geminiKey); setCustomUrlD(customUrl); setCustomKeyD(customKey); setCustomModD(customModel); }}
              title="AI Provider Settings"
              className={`p-1.5 rounded-lg transition-colors ${showCfg ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-700'}`}>
              <Settings size={14} />
            </button>
            <button onClick={clearChat} title="Clear chat" className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-700 transition-colors">
              <Trash2 size={14} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-700 transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Settings Panel (collapsible) ── */}
        {showCfg && (
          <div className="border-b border-zinc-700/60 bg-zinc-800/70 flex-shrink-0 overflow-y-auto" style={{ maxHeight: '260px' }}>
            {/* Provider tabs */}
            <div className="flex border-b border-zinc-700/60">
              {[
                { id: 'gemini', label: 'Gemini', icon: <Zap size={11} /> },
                { id: 'custom', label: 'Custom LLM', icon: <Server size={11} /> },
              ].map(tab => (
                <button key={tab.id}
                  onClick={() => setProvider(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-colors ${
                    provider === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-500 bg-zinc-800'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Gemini config */}
            {provider === 'gemini' && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-zinc-400">
                  Get a free key at{' '}
                  <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline">aistudio.google.com</a>.
                  Stored only in your browser.
                </p>
                <div className="relative">
                  <input type={showSecret ? 'text' : 'password'} value={geminiDraft} onChange={e => setGeminiDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveGemini()}
                    placeholder="AIza..." className="w-full bg-zinc-700 border border-zinc-600 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono" />
                  <button onClick={() => setShowSecret(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
                    {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveGemini} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">Save & Activate</button>
                  {geminiKey && <button onClick={clearProviders} className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-bold rounded-lg transition-colors">Remove</button>}
                </div>
              </div>
            )}

            {/* Custom LLM config */}
            {provider === 'custom' && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Cpu size={10} className="text-purple-400" />
                  OpenAI-compatible endpoint (Ollama, vLLM, LM Studio, your own server…)
                </p>
                <div>
                  <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Base URL</label>
                  <input type="text" value={customUrlD} onChange={e => setCustomUrlD(e.target.value)}
                    placeholder="https://your-server.com or http://localhost:11434"
                    className="w-full mt-0.5 bg-zinc-700 border border-zinc-600 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Model Name</label>
                  <input type="text" value={customModD} onChange={e => setCustomModD(e.target.value)}
                    placeholder="e.g. llama3, mistral, gpt-4o, my-model"
                    className="w-full mt-0.5 bg-zinc-700 border border-zinc-600 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">API Key <span className="font-normal normal-case">(optional)</span></label>
                  <div className="relative mt-0.5">
                    <input type={showSecret ? 'text' : 'password'} value={customKeyD} onChange={e => setCustomKeyD(e.target.value)}
                      placeholder="Bearer token or leave blank for open endpoints"
                      className="w-full bg-zinc-700 border border-zinc-600 text-xs text-zinc-100 placeholder-zinc-500 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono" />
                    <button onClick={() => setShowSecret(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
                      {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveCustom} className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">Save & Activate</button>
                  {customUrl && <button onClick={clearProviders} className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-bold rounded-lg transition-colors">Remove</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Messages area ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div className={`group relative max-w-[82%] rounded-2xl px-3 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : msg.isError
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-bl-sm'
                  : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
              }`}>
                {msg.role === 'user'
                  ? <p className="text-xs leading-relaxed">{msg.text}</p>
                  : <div className="space-y-0.5">{renderMarkdown(msg.text)}</div>
                }
                {msg.role === 'assistant' && (
                  <button onClick={() => copyMsg(msg.text, msg.id)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-700 border border-zinc-600 rounded-lg p-1">
                    {copiedId === msg.id ? <CheckCheck size={11} className="text-emerald-400" /> : <Copy size={11} className="text-zinc-400" />}
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={12} className="text-zinc-300" />
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                <Bot size={12} className="text-white" />
              </div>
              <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-3 py-2.5 flex items-center gap-2">
                <Loader2 size={12} className="text-blue-400 animate-spin" />
                <span className="text-[11px] text-zinc-400">
                  {provider === 'gemini' ? 'Thinking with Gemini…' : provider === 'custom' ? `Calling ${customModel}…` : 'Composing response…'}
                </span>
              </div>
            </div>
          )}

          {/* Starter prompts */}
          {messages.length === 1 && !loading && (
            <div className="space-y-1.5 pt-1">
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="w-full text-left text-[11px] text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl px-3 py-2 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ── */}
        <div className="px-3 py-3 border-t border-zinc-700/60 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea ref={inputRef} rows={1} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask PulseAI about your medical career…"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
              style={{ maxHeight: '90px' }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors">
              <Send size={15} className="text-white" />
            </button>
          </div>
          <p className="text-[9px] text-zinc-600 mt-1.5 text-center font-mono">
            {provider === 'gemini' ? 'Gemini 2.0 Flash · Multi-turn context'
              : provider === 'custom' ? `Custom · ${customModel} · ${customUrl.replace(/https?:\/\//, '').slice(0, 30)}`
              : 'No provider · Scripted fallback'} · PulseAI
          </p>
        </div>
      </div>
    </>
  );
}
