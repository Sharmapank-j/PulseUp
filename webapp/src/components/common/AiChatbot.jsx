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
  RefreshCw,
  Check,
  AlertCircle,
  Cloud,
  Plus,
  Pin,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import {
  CLOUD_PRESETS,
  GEMINI_MODELS,
  normalizeGeminiModel,
  testGeminiConnection,
  testCloudConnection,
  callGeminiApi,
  callCloudLlmApi,
  aiStorage,
  cleanApiKey,
  PULSEUP_AI_CONFIG_EVENT,
  chatSessionStorage,
  PULSEUP_CHAT_SESSION_EVENT,
  generatePrototypeResponse,
  simulateStreamResponse,
} from '../../services/aiService';

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

const LS = aiStorage;

export default function AiChatbot({
  onToast,
  onOpenSpace,
  messages: propMessages,
  setMessages: propSetMessages,
  chatSessions = [],
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCfg, setShowCfg] = useState(false);
  const [showSessionPicker, setShowSessionPicker] = useState(false);

  // Providers & Cloud Config
  const [provider, setProvider] = useState(() => aiStorage.get('pulseup_ai_provider', 'none'));
  const [geminiKey, setGeminiKey] = useState(() => aiStorage.get('pulseup_gemini_key', ''));
  const [geminiModel, setGeminiModel] = useState(() => normalizeGeminiModel(aiStorage.get('pulseup_gemini_model', 'gemini-3.8-flash')));
  const [geminiDraft, setGeminiDraft] = useState('');

  const [customUrl, setCustomUrl] = useState(() => aiStorage.get('pulseup_custom_url', ''));
  const [customKey, setCustomKey] = useState(() => aiStorage.get('pulseup_custom_key', ''));
  const [customModel, setCustomModel] = useState(() => aiStorage.get('pulseup_custom_model', 'llama-3.3-70b-versatile'));
  const [cloudPreset, setCloudPreset] = useState(() => aiStorage.get('pulseup_cloud_preset', 'groq'));

  const [customUrlD, setCustomUrlD] = useState('');
  const [customKeyD, setCustomKeyD] = useState('');
  const [customModD, setCustomModD] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Connection Test / Ping State
  const [testStatus, setTestStatus] = useState(null); // { loading, success, latency, error, title }

  // Sync draft states when panel opens or settings change
  useEffect(() => {
    setGeminiDraft(geminiKey);
    setCustomUrlD(customUrl || 'https://api.groq.com/openai/v1');
    setCustomKeyD(customKey);
    setCustomModD(customModel || 'llama-3.3-70b-versatile');
  }, [geminiKey, customUrl, customKey, customModel]);

  // Synchronize with external changes (e.g. from Fullscreen Workspace)
  useEffect(() => {
    const handleSync = () => {
      setProvider(aiStorage.get('pulseup_ai_provider', 'none'));
      setGeminiKey(aiStorage.get('pulseup_gemini_key', ''));
      setGeminiModel(normalizeGeminiModel(aiStorage.get('pulseup_gemini_model', 'gemini-3.8-flash')));
      setCustomUrl(aiStorage.get('pulseup_custom_url', ''));
      setCustomKey(aiStorage.get('pulseup_custom_key', ''));
      setCustomModel(aiStorage.get('pulseup_custom_model', 'llama-3.3-70b-versatile'));
      setCloudPreset(aiStorage.get('pulseup_cloud_preset', 'groq'));
    };
    window.addEventListener(PULSEUP_AI_CONFIG_EVENT, handleSync);
    return () => window.removeEventListener(PULSEUP_AI_CONFIG_EVENT, handleSync);
  }, []);

  // Shared Chat state with local fallback
  const [localMessages, setLocalMessages] = useState([{
    role: 'assistant',
    text: "Hi! I'm **medimind.ai** 👋 — your clinical career copilot.\n\nI can assist with NEET PG drills, AETCOM ethics cases, ICMR grants, and USMLE pathways.\n\n*Tap ⚙️ to configure Gemini / Cloud-Served LLM (Groq, OpenRouter, DeepSeek, OpenAI), or pick a starter below:*",
    id: 'welcome',
  }]);

  const messages = propMessages || localMessages;
  const setMessages = propSetMessages || setLocalMessages;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Dynamic Viewport Height & Auto-fit for Android & Mobile
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined' && window.visualViewport
      ? window.visualViewport.height
      : typeof window !== 'undefined'
      ? window.innerHeight
      : 800
  );
  const [viewportTop, setViewportTop] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const updateDimensions = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        setViewportTop(window.visualViewport.offsetTop || 0);
      } else {
        setViewportHeight(window.innerHeight);
        setViewportTop(0);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateDimensions);
      window.visualViewport.addEventListener('scroll', updateDimensions);
    }
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateDimensions);
        window.visualViewport.removeEventListener('scroll', updateDimensions);
      }
    };
  }, []);

  // Lock document scroll on mobile while chat is open to prevent page drift
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isMobile]);

  const messagesScrollRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Scroll strictly within message list container without triggering global window scroll
      if (messagesScrollRef.current) {
        messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
      }
      // Only auto-focus on desktop; on mobile, auto-focusing forces the Android keyboard to pop up immediately
      if (!isMobile) {
        setTimeout(() => inputRef.current?.focus(), 120);
      }
    }
  }, [isOpen, messages.length, isMobile]);

  const handleSelectCloudPreset = (presetId) => {
    setCloudPreset(presetId);
    const p = CLOUD_PRESETS.find(x => x.id === presetId);
    if (p && p.defaultUrl) {
      setCustomUrlD(p.defaultUrl);
      setCustomModD(p.defaultModel);
    }
    setTestStatus(null);
  };

  const handleTestGemini = async () => {
    const k = cleanApiKey(geminiDraft || geminiKey);
    if (!k) {
      onToast?.({ type: 'error', title: 'Missing Key', message: 'Enter a Gemini API key first.' });
      return;
    }
    setTestStatus({ loading: true });
    const targetModel = normalizeGeminiModel(geminiModel);
    const res = await testGeminiConnection(k, targetModel);
    setTestStatus({ loading: false, ...res });
    if (res.success) {
      onToast?.({ type: 'success', title: 'Gemini 3.8 Flash Verified', message: `Connected to ${res.model || targetModel} in ${res.latency}ms!` });
    } else {
      onToast?.({ type: 'error', title: res.title || 'Gemini Failed', message: res.error });
    }
  };

  const handleTestCloud = async () => {
    const u = customUrlD || customUrl;
    if (!u) {
      onToast?.({ type: 'error', title: 'Missing URL', message: 'Enter a Base URL first.' });
      return;
    }
    setTestStatus({ loading: true });
    const res = await testCloudConnection(u, customKeyD || customKey, customModD || customModel);
    setTestStatus({ loading: false, ...res });
    if (res.success) {
      onToast?.({ type: 'success', title: 'Cloud LLM Verified', message: `Connected to ${res.model} in ${res.latency}ms!` });
    } else {
      onToast?.({ type: 'error', title: res.title || 'Connection Failed', message: res.error });
    }
  };

  const saveGemini = () => {
    const k = cleanApiKey(geminiDraft);
    if (!k) {
      onToast?.({ type: 'error', title: 'Invalid Key', message: 'Please provide a valid Gemini API key.' });
      return;
    }
    const cleanModel = normalizeGeminiModel(geminiModel);
    setGeminiKey(k);
    setGeminiModel(cleanModel);
    aiStorage.set('pulseup_gemini_key', k);
    aiStorage.set('pulseup_gemini_model', cleanModel);
    setProvider('gemini');
    aiStorage.set('pulseup_ai_provider', 'gemini');
    aiStorage.notifyUpdate();
    setShowCfg(false);
    onToast?.({ type: 'success', title: 'Gemini AI Active', message: `medimind.ai powered by ${cleanModel} (3.8 Flash series) ✨` });
  };

  const saveCustom = () => {
    let raw = (customUrlD || '').trim();
    if (!raw) {
      onToast?.({ type: 'error', title: 'Missing URL', message: 'Enter a Base URL or choose a preset.' });
      return;
    }
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/.*)?$/i.test(raw)) {
        raw = `http://${raw}`;
      } else {
        raw = `https://${raw}`;
      }
      setCustomUrlD(raw);
    }
    const model = (customModD || '').trim() || 'llama-3.3-70b-versatile';
    const key = cleanApiKey(customKeyD);
    setCustomUrl(raw);
    aiStorage.set('pulseup_custom_url', raw);
    setCustomKey(key);
    aiStorage.set('pulseup_custom_key', key);
    setCustomModel(model);
    aiStorage.set('pulseup_custom_model', model);
    aiStorage.set('pulseup_cloud_preset', cloudPreset);
    setProvider('custom');
    aiStorage.set('pulseup_ai_provider', 'custom');
    aiStorage.notifyUpdate();
    setShowCfg(false);
    onToast?.({ type: 'success', title: 'Cloud LLM Active', message: `Connected to ${model} @ ${raw}` });
  };

  const clearProviders = () => {
    setProvider('none');
    aiStorage.set('pulseup_ai_provider', 'none');
    setGeminiKey('');
    aiStorage.set('pulseup_gemini_key', '');
    setCustomUrl('');
    aiStorage.set('pulseup_custom_url', '');
    setCustomKey('');
    aiStorage.set('pulseup_custom_key', '');
    aiStorage.notifyUpdate();
    setTestStatus(null);
    onToast?.({ type: 'info', title: 'Providers Cleared', message: 'Switched back to scripted high-yield mode.' });
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

    const userMsg = {
      role: 'user',
      text: userText,
      id: 'u-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      if (provider === 'gemini') {
        if (!geminiKey) {
          setShowCfg(true);
          throw new Error('Gemini API key is required. Paste your Google AI Studio key in Settings (⚙️), or switch to Prototype Engine.');
        }
        const targetModel = normalizeGeminiModel(geminiModel);
        const reply = await callGeminiApi({
          key: geminiKey,
          model: targetModel,
          messages,
          userText,
          systemPrompt: SYSTEM_INSTRUCTION,
        });
        const botMsg = {
          role: 'assistant',
          text: reply,
          id: 'a-' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalMsgs = [...nextMsgs, botMsg];
        setMessages(finalMsgs);
        if (activeSessionId) {
          chatSessionStorage.updateSessionMessages(activeSessionId, finalMsgs);
        }
        setLoading(false);
      } else if (provider === 'custom') {
        if (!customUrl) {
          setShowCfg(true);
          throw new Error('Endpoint Base URL is required for Cloud/Local LLMs. Please configure a preset (Groq, OpenRouter, Ollama) in Settings (⚙️).');
        }
        const reply = await callCloudLlmApi({
          url: customUrl,
          key: customKey,
          model: customModel,
          messages,
          userText,
          systemPrompt: SYSTEM_INSTRUCTION,
        });
        const botMsg = {
          role: 'assistant',
          text: reply,
          id: 'a-' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalMsgs = [...nextMsgs, botMsg];
        setMessages(finalMsgs);
        if (activeSessionId) {
          chatSessionStorage.updateSessionMessages(activeSessionId, finalMsgs);
        }
        setLoading(false);
      } else {
        // Prototype Clinical AI Engine with simulated stream typing
        const fullPrototypeReply = generatePrototypeResponse(userText, 'general');
        const botId = 'a-' + Date.now();
        const placeholderMsg = {
          role: 'assistant',
          text: '',
          id: botId,
          isStreaming: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...nextMsgs, placeholderMsg]);

        simulateStreamResponse(
          fullPrototypeReply,
          (chunk) => {
            setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: chunk } : m));
          },
          () => {
            setMessages(prev => {
              const completed = prev.map(m => m.id === botId ? { ...m, isStreaming: false } : m);
              if (activeSessionId) {
                chatSessionStorage.updateSessionMessages(activeSessionId, completed);
              }
              return completed;
            });
            setLoading(false);
          },
          12
        );
      }
    } catch (err) {
      console.error('medimind.ai error:', err);
      const errMsg = {
        role: 'assistant',
        text: `**⚠️ Connection / Inference Error:**\n\n${err?.message || 'Something went wrong.'}\n\n*Tap ⚙️ above to test connection, check API credentials, or switch cloud providers.*`,
        id: 'err-' + Date.now(),
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => {
        const withErr = [...prev, errMsg];
        if (activeSessionId) {
          chatSessionStorage.updateSessionMessages(activeSessionId, withErr);
        }
        return withErr;
      });
      onToast?.({
        type: 'error',
        title: 'AI Communication Error',
        message: (err?.message || 'Failed to communicate with provider').slice(0, 100),
      });
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (loading) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    const lastBotIdx = [...messages].map(m => m.role).lastIndexOf('assistant');
    if (lastBotIdx !== -1) {
      setMessages(prev => prev.slice(0, lastBotIdx));
    }
    sendMessage(lastUserMsg.text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const providerLabel = provider === 'gemini'
    ? `● ${geminiModel.replace('gemini-', 'Gemini ')}`
    : provider === 'custom'
    ? `● ${customModel.slice(0, 18)}`
    : '○ Scripted Mode';

  const providerColor = provider !== 'none' ? 'text-emerald-400' : 'text-zinc-400';

  return (
    <>
      {/* ── Glassmorphic Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open medimind.ai chat"
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl backdrop-blur-2xl transition-all duration-300 focus:outline-none shadow-[0_8px_32px_rgba(37,99,235,0.4)] ${
          isOpen ? 'hidden sm:flex' : 'flex'
        } items-center justify-center ${
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

      {/* ── Glassmorphic Chat Panel (True Screen-Adaptive Auto-Fit for Mobile & Desktop) ── */}
      <div
        style={isMobile ? {
          top: `${viewportTop}px`,
          height: `${viewportHeight}px`,
          maxHeight: `${viewportHeight}px`,
        } : undefined}
        className={`fixed inset-x-0 sm:inset-x-auto sm:top-auto sm:bottom-24 sm:right-6 sm:w-[430px] md:sm:w-[460px] sm:h-[620px] sm:max-h-[calc(100dvh-120px)] z-50 flex flex-col rounded-none sm:rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/95 dark:bg-[#0E1526]/95 border-0 sm:border border-zinc-200/90 dark:border-white/20 shadow-none sm:shadow-[0_16px_48px_rgba(0,0,0,0.15)] dark:sm:shadow-[0_16px_48px_rgba(0,0,0,0.5)] text-zinc-900 dark:text-zinc-100 transition-[opacity,transform] duration-200 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Subtle ambient lighting */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header - Sticky and Permanent */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-4 py-3 border-b border-zinc-200 dark:border-white/10 backdrop-blur-2xl bg-zinc-50/95 dark:bg-[#0E1526]/95 flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[1px] shadow-md shadow-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-black text-sm text-zinc-900 dark:text-white flex items-center gap-1 tracking-tight">
                  medimind.ai
                </h3>
                {activeSessionId && (
                  <button
                    onClick={() => setShowSessionPicker(p => !p)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-200/70 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/15 text-[9px] font-medium text-zinc-700 dark:text-zinc-300 max-w-[110px] truncate"
                    title="Switch Conversation Thread"
                  >
                    <span className="truncate">{(chatSessions || []).find(s => s.id === activeSessionId)?.title || 'Thread'}</span>
                    <ChevronDown size={10} className="opacity-60 flex-shrink-0" />
                  </button>
                )}
              </div>
              <p className={`text-[9.5px] font-mono ${providerColor}`}>{providerLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Quick New Chat Button */}
            <button
              onClick={() => {
                onCreateSession?.('general');
                setShowSessionPicker(false);
              }}
              title="New Consultation Thread"
              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-0.5 text-xs font-semibold"
            >
              <Plus size={14} />
            </button>

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

        {/* ── Preserved Chat Threads Dropdown ── */}
        {showSessionPicker && (
          <div className="relative z-20 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-[#0B101E] p-2.5 max-h-48 overflow-y-auto space-y-1 shadow-md">
            <div className="flex items-center justify-between px-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              <span>Preserved Consultations</span>
              <button
                onClick={() => {
                  onCreateSession?.('general');
                  setShowSessionPicker(false);
                }}
                className="text-blue-500 hover:underline flex items-center gap-0.5 text-[10px] font-bold"
              >
                <Plus size={10} /> New
              </button>
            </div>
            {(chatSessions || []).map(s => (
              <div
                key={s.id}
                className={`w-full px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  s.id === activeSessionId
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold'
                    : 'hover:bg-zinc-200/60 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <button
                  onClick={() => {
                    onSelectSession?.(s.id);
                    setShowSessionPicker(false);
                  }}
                  className="truncate flex-1 text-left"
                >
                  {s.title}
                </button>
                <span className="text-[9px] opacity-60 font-mono ml-2 flex-shrink-0">
                  {s.messages?.length || 0} msgs
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Settings Panel (Collapsible Glass) ── */}
        {showCfg && (
          <div className="relative z-10 border-b border-zinc-200 dark:border-white/10 backdrop-blur-xl bg-zinc-50/95 dark:bg-[#0E1524]/95 flex-shrink-0 overflow-y-auto text-zinc-800 dark:text-zinc-200" style={{ maxHeight: '340px' }}>
            <div className="flex border-b border-zinc-200 dark:border-white/10 bg-zinc-100/60 dark:bg-black/20">
              {[
                { id: 'gemini', label: 'Gemini Cloud', icon: <Zap size={11} className="text-amber-500" /> },
                { id: 'custom', label: 'Cloud LLMs', icon: <Cloud size={11} className="text-blue-500" /> },
                { id: 'none', label: 'Offline / Bank', icon: <Bot size={11} className="text-emerald-500" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setProvider(tab.id);
                    setTestStatus(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold transition-colors ${
                    provider === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-500/10 font-bold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Gemini tab */}
            {provider === 'gemini' && (
              <div className="p-3 space-y-2.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 dark:text-zinc-400">Google Gemini API</span>
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Get Free Key <ExternalLink size={9} />
                  </a>
                </div>

                <div>
                  <label className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                    Select Gemini Model
                  </label>
                  <select
                    value={geminiModel}
                    onChange={e => setGeminiModel(e.target.value)}
                    className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  >
                    {GEMINI_MODELS.map(m => (
                      <option key={m.id} value={m.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={geminiDraft}
                      onChange={e => setGeminiDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveGemini()}
                      placeholder="AIzaSy..."
                      className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(s => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>

                {/* Connection Ping Status Badge */}
                {testStatus && (
                  <div className={`p-2 rounded-xl text-[10px] font-mono border flex items-center justify-between ${
                    testStatus.success
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                  }`}>
                    <span className="truncate">
                      {testStatus.success ? `✓ Verified: ${testStatus.latency}ms latency` : `✕ ${testStatus.error}`}
                    </span>
                    {testStatus.success && <span className="text-[9px] font-bold uppercase ml-2 text-emerald-500">Live</span>}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveGemini}
                    className="flex-1 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Save & Activate
                  </button>
                  <button
                    onClick={handleTestGemini}
                    disabled={testStatus?.loading}
                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    {testStatus?.loading ? <RefreshCw size={11} className="animate-spin text-blue-500" /> : 'Test'}
                  </button>
                  {geminiKey && (
                    <button
                      onClick={clearProviders}
                      className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cloud-Served LLM tab */}
            {provider === 'custom' && (
              <div className="p-3 space-y-2.5">
                {/* 1-Click Cloud Provider Presets */}
                <div>
                  <label className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                    Cloud Presets
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CLOUD_PRESETS.map(cp => {
                      const isSel = cloudPreset === cp.id;
                      return (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => handleSelectCloudPreset(cp.id)}
                          className={`p-1 rounded-lg border text-left transition-all ${
                            isSel
                              ? `${cp.bg} ${cp.border} font-bold text-zinc-900 dark:text-white shadow-xs`
                              : 'bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10'
                          }`}
                        >
                          <p className="text-[10px] truncate leading-tight font-semibold">{cp.name}</p>
                          <p className="text-[8px] truncate opacity-75">{cp.badge.split('/')[0]}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      Base Endpoint URL
                    </label>
                    {CLOUD_PRESETS.find(p => p.id === cloudPreset)?.keyUrl && (
                      <a
                        href={CLOUD_PRESETS.find(p => p.id === cloudPreset).keyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9.5px] text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                      >
                        Get Key <ExternalLink size={8} />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={customUrlD}
                    onChange={e => setCustomUrlD(e.target.value)}
                    placeholder="https://api.groq.com/openai/v1 or https://openrouter.ai/api/v1"
                    className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <p className="text-[8.5px] text-zinc-400 mt-0.5 font-mono">
                    Auto-normalizes /v1 and /chat/completions paths
                  </p>
                </div>

                <div>
                  <label className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                    Model Identifier
                  </label>
                  {CLOUD_PRESETS.find(p => p.id === cloudPreset)?.models?.length > 0 && (
                    <div className="mb-1.5 flex flex-wrap gap-1">
                      {CLOUD_PRESETS.find(p => p.id === cloudPreset).models.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setCustomModD(m.id)}
                          className={`text-[9px] px-2 py-0.5 rounded-lg border font-mono transition-all ${
                            customModD === m.id
                              ? 'bg-purple-600 text-white border-purple-500 shadow-xs font-semibold'
                              : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {m.label.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={customModD}
                    onChange={e => setCustomModD(e.target.value)}
                    placeholder="llama-3.3-70b-versatile, deepseek-chat, gpt-4o-mini"
                    className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                    API Key / Bearer Token
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={customKeyD}
                      onChange={e => setCustomKeyD(e.target.value)}
                      placeholder={CLOUD_PRESETS.find(p => p.id === cloudPreset)?.keyPlaceholder || 'sk-...'}
                      className="w-full bg-white dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-2.5 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(s => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>

                {(cloudPreset === 'ollama' || (customUrlD && (customUrlD.includes('localhost') || customUrlD.includes('127.0.0.1')))) && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-[10px] text-zinc-700 dark:text-zinc-300 space-y-2 leading-relaxed">
                    <div className="font-bold flex items-center justify-between text-purple-700 dark:text-purple-300">
                      <span className="flex items-center gap-1.5"><Terminal size={12} /> HTTP vs HTTPS Browser Gateway</span>
                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-purple-500/20 font-mono font-bold">Infrastructure</span>
                    </div>
                    <p className="text-[9.5px]">
                      When using PulseUp over HTTPS (<code className="bg-purple-500/20 px-1 py-0.5 rounded font-mono text-[9px]">pulseupdemo.netlify.app</code>), browsers block insecure HTTP requests to <code className="bg-purple-500/20 px-1 py-0.5 rounded font-mono text-[9px]">http://localhost</code>. Connect using:
                    </p>
                    <div className="space-y-1.5 text-[9.5px]">
                      <div className="p-1.5 rounded-lg bg-white/70 dark:bg-black/30 border border-purple-500/20">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Option 1: Instant HTTPS Tunnel (Recommended)</span>
                        <div className="mt-0.5 font-mono text-[9px] text-purple-600 dark:text-purple-300 select-all font-semibold">
                          npx untun tunnel http://localhost:11434
                        </div>
                        <span className="text-[8px] text-zinc-500 dark:text-zinc-400 block mt-0.5">Paste generated https:// address into Base Endpoint URL.</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/70 dark:bg-black/30 border border-purple-500/20">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Option 2: Run PulseUp Locally via HTTP</span>
                        <div className="mt-0.5 font-mono text-[9px] text-purple-600 dark:text-purple-300 select-all font-semibold">
                          npm run dev
                        </div>
                        <span className="text-[8px] text-zinc-500 dark:text-zinc-400 block mt-0.5">Runs on http://localhost:3000 with 0 mixed-content restrictions.</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/70 dark:bg-black/30 border border-purple-500/20">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Option 3: Browser Site Permission</span>
                        <span className="text-[8.5px] text-zinc-600 dark:text-zinc-300 block mt-0.5">
                          Click padlock/tune icon in address bar → <em>Site settings</em> → set <em>Insecure content</em> to <strong>Allow</strong>.
                        </span>
                      </div>
                    </div>
                    <div className="text-[8.5px] text-zinc-400 dark:text-zinc-500 pt-0.5 border-t border-purple-500/15">
                      <em>Remote HTTP endpoints are automatically routed through PulseUp's secure Netlify AI Proxy Gateway.</em>
                    </div>
                  </div>
                )}

                {/* Ping Result Badge */}
                {testStatus && (
                  <div className={`p-2 rounded-xl text-[10px] font-mono border flex items-center justify-between ${
                    testStatus.success
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                  }`}>
                    <span className="truncate">
                      {testStatus.success ? `✓ Responded in ${testStatus.latency}ms` : `✕ ${testStatus.error}`}
                    </span>
                    {testStatus.success && <span className="text-[9px] font-bold uppercase ml-2 text-emerald-500">Live</span>}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveCustom}
                    className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Save & Activate
                  </button>
                  <button
                    onClick={handleTestCloud}
                    disabled={testStatus?.loading}
                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    {testStatus?.loading ? <RefreshCw size={11} className="animate-spin text-purple-500" /> : 'Ping'}
                  </button>
                  {customUrl && (
                    <button
                      onClick={clearProviders}
                      className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Offline Scripted Mode tab */}
            {provider === 'none' && (
              <div className="p-3 space-y-2">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Currently running in <strong>Offline Scripted Mode</strong> with built-in high-yield medical question banks (NEET PG, ICMR-STS, AETCOM SPIKES, USMLE Step 1/2).
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Switch to <strong>Gemini Cloud</strong> or <strong>Cloud LLMs</strong> (Groq, OpenRouter, DeepSeek, OpenAI) above to unlock live generative inference.
                </p>
                <button
                  onClick={clearProviders}
                  className="w-full py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors"
                >
                  Confirm Scripted Mode
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Messages stream (Constrained & Scrollable) ── */}
        <div
          ref={messagesScrollRef}
          className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 py-3.5 space-y-3 scroll-smooth"
        >
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
                  <div className="space-y-0.5">
                    {renderMarkdown(msg.text)}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-blue-500 animate-pulse ml-0.5 align-middle rounded-xs" />
                    )}
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-white/20 rounded-lg p-0.5 shadow-sm">
                    <button
                      onClick={handleRegenerate}
                      disabled={loading}
                      className="p-1 rounded text-zinc-500 hover:text-blue-500 transition-colors"
                      title="Regenerate deliberation"
                    >
                      <RotateCcw size={10} />
                    </button>
                    <button
                      onClick={() => copyMsg(msg.text, msg.id)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <CheckCheck size={11} className="text-emerald-500" /> : <Copy size={11} />}
                    </button>
                  </div>
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
              className="flex-1 bg-white dark:bg-white/10 border border-zinc-300 dark:border-white/15 text-[16px] sm:text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed backdrop-blur-md"
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
              {input.length > 0
                ? `${input.length} chars (~${Math.round(input.length / 4)} tokens)`
                : provider === 'gemini'
                ? 'Gemini 2.0 Flash'
                : provider === 'custom'
                ? `Custom: ${customModel}`
                : 'Prototype Engine'}
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
