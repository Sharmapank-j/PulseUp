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
  Maximize2,
  ExternalLink,
} from 'lucide-react';

// ─── System prompt tuned for PulseUp medical career context ───────────────
const SYSTEM_INSTRUCTION = `You are medimind.ai, the embedded clinical AI copilot for PulseUp — a career operating system for Indian medical students, interns, and residents.

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

Personality: Sharp, knowledgeable, evidence-based, structured. Use concise bullet points. Cite Indian medical contexts specifically (NMC, MAMC, AIIMS, JIPMER, CMC Vellore).
Important: Never give actual patient-level clinical diagnosis or treatment advice. Educational & career purposes only.`;

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null;
    const bullet = line.match(/^(\s*[-*•])\s+(.+)/);
    if (bullet) return (
      <div key={i} className="flex gap-2 text-xs leading-relaxed my-0.5">
        <span className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0 drop-shadow-sm font-bold">•</span>
        <span className="text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: inlineFmt(bullet[2]) }} />
      </div>
    );
    const num = line.match(/^(\d+)\.\s+(.+)/);
    if (num) return (
      <div key={i} className="flex gap-2 text-xs leading-relaxed my-0.5">
        <span className="text-blue-600 dark:text-blue-400 font-mono font-bold flex-shrink-0 w-4">{num[1]}.</span>
        <span className="text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: inlineFmt(num[2]) }} />
      </div>
    );
    if (line.startsWith('### ')) return <p key={i} className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-2">{line.slice(4)}</p>;
    if (line.startsWith('## '))  return <p key={i} className="font-bold text-xs text-blue-700 dark:text-blue-300 mt-2 border-b border-zinc-200 dark:border-white/10 pb-0.5">{line.slice(3)}</p>;
    if (line.startsWith('# '))   return <p key={i} className="font-bold text-xs text-emerald-700 dark:text-emerald-400 mt-2">{line.slice(2)}</p>;
    if (line.trim() === '')      return <div key={i} className="h-1.5" />;
    return <p key={i} className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: inlineFmt(line) }} />;
  }).filter(Boolean);
}

function inlineFmt(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-900 dark:text-zinc-100 font-bold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-zinc-100 dark:bg-black/40 text-emerald-700 dark:text-emerald-300 px-1 rounded text-[10px] font-mono border border-zinc-300 dark:border-white/10">$1</code>');
}

const STARTERS = [
  'How should I start NEET PG prep in 6 months?',
  'What ICMR-STS projects suit a 2nd year MBBS student?',
  'Explain AETCOM Module 4.1 SPIKES protocol',
  'Best strategy for USMLE Step 1 from India?',
];

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
  return "I'm **medimind.ai** 🩺 — your clinical AI copilot.\n\nTry asking me about NEET PG, ICMR-STS grants, AETCOM ethical cases, or USMLE timelines.\n\n*Tap ⚙️ to connect Google Gemini or your own Custom LLM server!*";
}

const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export default function AiChatbot({ onToast, onOpenSpace, messages: propMessages, setMessages: propSetMessages }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCfg, setShowCfg] = useState(false);

  // Providers
  const [provider, setProvider] = useState(() => LS.get('pulseup_ai_provider', 'none'));
  const [geminiKey, setGeminiKey] = useState(() => LS.get('pulseup_gemini_key', ''));
  const [geminiDraft, setGeminiDraft] = useState('');
  const [customUrl, setCustomUrl] = useState(() => LS.get('pulseup_custom_url', ''));
  const [customKey, setCustomKey] = useState(() => LS.get('pulseup_custom_key', ''));
  const [customModel, setCustomModel] = useState(() => LS.get('pulseup_custom_model', 'llama3'));
  const [customUrlD, setCustomUrlD] = useState('');
  const [customKeyD, setCustomKeyD] = useState('');
  const [customModD, setCustomModD] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Shared Chat state with local fallback
  const [localMessages, setLocalMessages] = useState([{
    role: 'assistant',
    text: "Hi! I'm **medimind.ai** 👋 — your clinical career copilot.\n\nI can assist with NEET PG drills, AETCOM ethics cases, ICMR grants, and USMLE pathways.\n\n*Tap ⚙️ to configure Gemini / Custom LLM, or pick a starter below:*",
    id: 'welcome',
  }]);

  const messages = propMessages || localMessages;
  const setMessages = propSetMessages || setLocalMessages;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const saveGemini = () => {
    const k = geminiDraft.trim();
    if (!k.startsWith('AIza')) {
      onToast?.({ type: 'error', title: 'Invalid Key', message: 'Gemini keys start with "AIza". Obtain one free at aistudio.google.com' });
      return;
    }
    setGeminiKey(k); LS.set('pulseup_gemini_key', k);
    setProvider('gemini'); LS.set('pulseup_ai_provider', 'gemini');
    setShowCfg(false);
    onToast?.({ type: 'success', title: 'Gemini AI Active', message: 'medimind.ai now powered by Gemini 2.0 Flash ✨' });
  };

  const saveCustom = () => {
    const url = customUrlD.trim().replace(/\/$/, '');
    if (!url.startsWith('http')) {
      onToast?.({ type: 'error', title: 'Invalid URL', message: 'Base URL must start with http:// or https://' });
      return;
    }
    const model = customModD.trim() || 'llama3';
    setCustomUrl(url); LS.set('pulseup_custom_url', url);
    setCustomKey(customKeyD.trim()); LS.set('pulseup_custom_key', customKeyD.trim());
    setCustomModel(model); LS.set('pulseup_custom_model', model);
    setProvider('custom'); LS.set('pulseup_ai_provider', 'custom');
    setShowCfg(false);
    onToast?.({ type: 'success', title: 'Custom LLM Active', message: `Connected to ${url} · model: ${model}` });
  };

  const clearProviders = () => {
    setProvider('none'); LS.set('pulseup_ai_provider', 'none');
    setGeminiKey(''); LS.set('pulseup_gemini_key', '');
    setCustomUrl(''); setCustomKey(''); setCustomModel('llama3');
    onToast?.({ type: 'info', title: 'Providers Cleared', message: 'Switched back to scripted responses.' });
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', text: 'Chat cleared! How can I help you with your medical career today?', id: 'clr-' + Date.now() }]);
  };

  const copyMsg = (text, id) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 1800); });
  };

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = { role: 'user', text: userText, id: 'u-' + Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      let reply = '';

      if (provider === 'gemini' && geminiKey) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
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

      } else if (provider === 'custom' && customUrl) {
        const endpoint = `${customUrl}/v1/chat/completions`;
        const headers = { 'Content-Type': 'application/json' };
        if (customKey) headers['Authorization'] = `Bearer ${customKey}`;

        const history = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

        const body = {
          model: customModel || 'llama3',
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            ...history,
            { role: 'user', content: userText },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        };

        const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
        }
        const data = await res.json();
        reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '(Empty response from custom model)';

      } else {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 500));
        reply = scriptedResponse(userText);
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply, id: 'a-' + Date.now() }]);
    } catch (err) {
      console.error('medimind.ai error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `**Connection Error:** ${err?.message || 'Something went wrong.'}\n\nCheck your API key / custom endpoint configuration in ⚙️.`,
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

  const providerLabel = provider === 'gemini'
    ? '● Gemini AI'
    : provider === 'custom'
    ? `● ${customModel}`
    : '○ Scripted Mode';

  const providerColor = provider !== 'none' ? 'text-emerald-400' : 'text-zinc-400';

  return (
    <>
      {/* ── Glassmorphic Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open medimind.ai chat"
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl backdrop-blur-2xl transition-all duration-300 focus:outline-none shadow-[0_8px_32px_rgba(37,99,235,0.4)] flex items-center justify-center ${
          isOpen
            ? 'bg-zinc-900/90 border border-white/20 rotate-0'
            : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:scale-105 border border-white/30 shadow-[0_0_24px_rgba(59,130,246,0.5)]'
        }`}
      >
        {isOpen ? (
          <ChevronDown size={22} className="text-zinc-200" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles size={22} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
            <span className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-zinc-900 shadow-sm ${
              provider !== 'none' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse' : 'bg-amber-400'
            }`} />
          </div>
        )}
      </button>

      {/* ── Glassmorphic Chat Panel (Responsive Auto-Fit for Android & Desktop) ── */}
      <div
        className={`fixed inset-x-2.5 bottom-20 top-14 sm:inset-x-auto sm:top-auto sm:bottom-24 sm:right-6 sm:w-[410px] sm:h-[580px] sm:max-h-[calc(100dvh-120px)] z-50 flex flex-col rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/95 dark:bg-[#0E1526]/95 border border-zinc-200/90 dark:border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] text-zinc-900 dark:text-zinc-100 transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-5 pointer-events-none'
        }`}
      >
        {/* Subtle ambient lighting */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header - Sticky and Permanent */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-white/10 backdrop-blur-2xl bg-zinc-50/95 dark:bg-[#0E1526]/95 flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[1px] shadow-md shadow-blue-500/30 flex items-center justify-center">
              <Sparkles size={16} className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-zinc-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                medimind.ai
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-blue-500/25 text-blue-600 dark:text-blue-300 border border-blue-400/30">
                  AI
                </span>
              </h3>
              <p className={`text-[10px] font-mono ${providerColor}`}>{providerLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Open in Fullscreen Space Button */}
            {onOpenSpace && (
              <button
                onClick={() => {
                  onOpenSpace();
                  setIsOpen(false);
                }}
                title="Open in Fullscreen Space"
                className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 transition-colors flex items-center gap-0.5 text-xs font-semibold"
              >
                <Maximize2 size={13} />
                <span className="text-[10px] font-mono font-bold hidden sm:inline">Full</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowCfg(c => !c);
                setGeminiDraft(geminiKey);
                setCustomUrlD(customUrl);
                setCustomKeyD(customKey);
                setCustomModD(customModel);
              }}
              title="Provider Settings"
              className={`p-1.5 rounded-lg transition-colors ${showCfg ? 'bg-zinc-200 dark:bg-white/15 text-zinc-900 dark:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'}`}
            >
              <Settings size={14} />
            </button>

            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            >
              <Trash2 size={14} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Settings Panel (Collapsible Glass) ── */}
        {showCfg && (
          <div className="relative z-10 border-b border-zinc-200 dark:border-white/10 backdrop-blur-xl bg-zinc-50/95 dark:bg-black/50 flex-shrink-0 overflow-y-auto text-zinc-800 dark:text-zinc-200" style={{ maxHeight: '280px' }}>
            <div className="flex border-b border-zinc-200 dark:border-white/10">
              {[
                { id: 'gemini', label: 'Gemini', icon: <Zap size={11} /> },
                { id: 'custom', label: 'Custom LLM', icon: <Server size={11} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProvider(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold transition-colors ${
                    provider === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-500/10'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Gemini tab */}
            {provider === 'gemini' && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                  Get a free key from{' '}
                  <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium">aistudio.google.com</a>.
                </p>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={geminiDraft}
                    onChange={e => setGeminiDraft(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveGemini()}
                    placeholder="AIza..."
                    className="w-full bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button onClick={() => setShowSecret(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveGemini} className="flex-1 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                    Save Key
                  </button>
                  {geminiKey && (
                    <button onClick={clearProviders} className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Custom LLM tab */}
            {provider === 'custom' && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Cpu size={10} className="text-purple-500 dark:text-purple-400" />
                  OpenAI-compatible server (Ollama, vLLM, LM Studio, VPS)
                </p>
                <div>
                  <label className="text-[9.5px] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Base URL</label>
                  <input
                    type="text"
                    value={customUrlD}
                    onChange={e => setCustomUrlD(e.target.value)}
                    placeholder="https://your-server.com or http://localhost:11434"
                    className="w-full mt-0.5 bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Model Name</label>
                  <input
                    type="text"
                    value={customModD}
                    onChange={e => setCustomModD(e.target.value)}
                    placeholder="llama3, mistral, gpt-4o"
                    className="w-full mt-0.5 bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] text-zinc-600 dark:text-zinc-400 font-semibold uppercase">Bearer Token (optional)</label>
                  <div className="relative mt-0.5">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={customKeyD}
                      onChange={e => setCustomKeyD(e.target.value)}
                      placeholder="sk-... or leave blank"
                      className="w-full bg-white dark:bg-white/5 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                    <button onClick={() => setShowSecret(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                      {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveCustom} className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                    Save Custom Model
                  </button>
                  {customUrl && (
                    <button onClick={clearProviders} className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Messages stream (Constrained & Scrollable) ── */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 py-3.5 space-y-3 scroll-smooth">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Sparkles size={12} className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" />
                </div>
              )}
              <div className={`group relative max-w-[84%] rounded-2xl px-3.5 py-2.5 backdrop-blur-md border ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm border-blue-400/40 shadow-md shadow-blue-600/20'
                  : msg.isError
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-200 rounded-bl-sm'
                  : 'bg-zinc-100 dark:bg-[#141C2E]/90 border border-zinc-200/90 dark:border-white/[0.09] text-zinc-900 dark:text-zinc-100 rounded-bl-sm shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="space-y-0.5">{renderMarkdown(msg.text)}</div>
                )}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyMsg(msg.text, msg.id)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-white/20 rounded-lg p-1 shadow-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    {copiedId === msg.id ? <CheckCheck size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-white/15 border border-blue-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-blue-700 dark:text-zinc-300">
                  <User size={12} />
                </div>
              )}
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles size={12} className="text-white animate-spin" />
              </div>
              <div className="bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/15 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2 backdrop-blur-md">
                <Loader2 size={12} className="text-blue-500 animate-spin" />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {provider === 'gemini' ? 'Deliberating with Gemini…' : provider === 'custom' ? `Calling ${customModel}…` : 'Formulating guidance…'}
                </span>
              </div>
            </div>
          )}

          {/* Starter pills on initial load */}
          {messages.length === 1 && !loading && (
            <div className="space-y-1.5 pt-1">
              {STARTERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-[11px] text-zinc-700 dark:text-zinc-300 backdrop-blur-sm bg-zinc-100/80 hover:bg-zinc-200/90 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 hover:border-blue-400 rounded-xl px-3 py-2 transition-all shadow-xs"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Glassmorphic Input Bar (Sticky and Persistent) ── */}
        <div className="sticky bottom-0 z-30 px-3.5 py-3 border-t border-zinc-200 dark:border-white/10 backdrop-blur-2xl bg-zinc-50/95 dark:bg-[#0E1526]/95 flex-shrink-0 shadow-md">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask medimind.ai about NEET PG, grants, ethics…"
              className="flex-1 bg-white dark:bg-white/10 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed backdrop-blur-md"
              style={{ maxHeight: '90px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between text-[9px] text-zinc-500 dark:text-zinc-400 mt-1.5 px-1 font-mono">
            <span>
              {provider === 'gemini' ? 'Gemini 2.0 Flash' : provider === 'custom' ? `Custom: ${customModel}` : 'Scripted Mode'}
            </span>
            {onOpenSpace && (
              <button
                onClick={() => {
                  onOpenSpace();
                  setIsOpen(false);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                Expand to Fullscreen <Maximize2 size={9} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
