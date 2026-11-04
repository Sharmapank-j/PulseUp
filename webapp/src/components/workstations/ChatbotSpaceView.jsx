import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Zap,
  Server,
  Settings,
  RefreshCw,
  Trash2,
  Copy,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Key,
  Eye,
  EyeOff,
  Stethoscope,
  Award,
  Globe,
  Activity,
  ArrowRight,
  Sliders,
  ExternalLink,
  ChevronRight,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  Maximize2,
  X,
  Menu,
  Sun,
  Moon,
  PanelLeft,
  Cloud,
  Plus,
  Search,
  Pin,
  Edit3,
  Download,
  RotateCcw,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import {
  CLOUD_PRESETS,
  GEMINI_MODELS,
  testGeminiConnection,
  testCloudConnection,
  callGeminiApi,
  callCloudLlmApi,
  aiStorage,
  cleanApiKey,
  PULSEUP_AI_CONFIG_EVENT,
  chatSessionStorage,
  PULSEUP_CHAT_SESSION_EVENT,
  CLINICAL_PROMPT_TEMPLATES,
  generatePrototypeResponse,
  simulateStreamResponse,
  INITIAL_DEFAULT_SESSIONS,
} from '../../services/aiService';

const SYSTEM_INSTRUCTION_BASE = `You are medimind.ai, the embedded AI clinical copilot for PulseUp — a career operating system for Indian medical students, interns, and residents.
Your clinical scope encompasses:
- NEET PG / NEXT exam strategy, subject-wise weightage, high-yield clinical recalls
- NMC CBME curriculum competencies, AETCOM modules (SPIKES, conflict de-escalation, DNR, informed consent)
- ICMR-STS undergraduate research grant proposal writing, study design, and sample size rationale
- USMLE Step 1 / Step 2 CK pathways for Indian medical graduates (ECFMG, clinical electives, eras match)
- SBAR clinical case handovers, discharge summaries, and ward procedural logbook guidance
- Medical college quiz circuits (AIIMS Pulse, AFMC Silhouettes, CMC Pegasus, JIPMER Spandan)
- Pulse Credits (PC) gamification and career milestone tracking

Personality: Sharp, highly knowledgeable, clinically sound, empathetic, structured with bullet points.
Important: You provide educational, career, and research guidance only. Never offer direct patient diagnostic or prescriptive medical advice.`;

const CLINICAL_MODES = [
  {
    id: 'neet',
    label: 'NEET PG / NEXT',
    icon: Award,
    badge: 'High Yield',
    accentColor: 'text-amber-400',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderGlow: 'border-amber-500/40 shadow-amber-500/10',
    prompt: 'Act as a senior NEET PG mentor. Give high-yield clinical pearls, MCQ traps, and active recall drills.',
    starters: [
      'Create a 30-day revision strategy for high-yield Medicine & Surgery for NEET PG',
      'Give me 5 clinical vignette questions on acid-base disorders with explanations',
      'What are the most tested radiology signs in recent NEET PG recalls?'
    ]
  },
  {
    id: 'icmr',
    label: 'ICMR-STS Research',
    icon: FileText,
    badge: 'Grants',
    accentColor: 'text-emerald-400',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderGlow: 'border-emerald-500/40 shadow-emerald-500/10',
    prompt: 'Act as an ICMR-STS research mentor. Help formulate research questions, methodology, and ethical clearance protocols.',
    starters: [
      'Help me draft an ICMR-STS protocol title and objective for a 2nd year MBBS student',
      'What are the essential elements of an Institutional Ethics Committee (IEC) submission?',
      'How do I calculate sample size for a hospital-based cross-sectional study?'
    ]
  },
  {
    id: 'aetcom',
    label: 'AETCOM Bioethics',
    icon: Stethoscope,
    badge: 'NMC CBME',
    accentColor: 'text-purple-400',
    bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    borderGlow: 'border-purple-500/40 shadow-purple-500/10',
    prompt: 'Act as an NMC CBME AETCOM faculty mentor. Guide ethical case deliberation, reflective practice, and communication skills.',
    starters: [
      'Walk me through the SPIKES protocol step-by-step for breaking news of brain death',
      'How to manage an agitated relative demanding immediate ICU admission when no beds are available?',
      'What are the legal and ethical requirements for valid informed consent in an emergency surgery?'
    ]
  },
  {
    id: 'usmle',
    label: 'USMLE & Global Track',
    icon: Globe,
    badge: 'IMG Match',
    accentColor: 'text-cyan-400',
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    borderGlow: 'border-cyan-500/40 shadow-cyan-500/10',
    prompt: 'Act as a US residency advisor for Indian medical graduates. Guide Step 1, Step 2 CK, USCE, and ECFMG certification.',
    starters: [
      'What is the realistic timeline for an Indian MBBS intern aiming for the US match?',
      'How to approach UWorld for Step 2 CK to score above 250?',
      'What is the difference between US observership, externship, and hands-on sub-internship?'
    ]
  },
  {
    id: 'general',
    label: 'Clinical Copilot',
    icon: Bot,
    badge: 'PulseUp OS',
    accentColor: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    borderGlow: 'border-blue-500/40 shadow-blue-500/10',
    prompt: 'Act as the general PulseAI clinical copilot. Assist with all aspects of medical career navigation.',
    starters: [
      'How do I optimize my Verified Medical Passport score to reach 800+ Tier 1 status?',
      'What are the highest-paying non-academic junior resident posts in Delhi NCR?',
      'Explain how the CRediT authorship taxonomy works for collaborative research'
    ]
  }
];

function inlineFmt(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-900 dark:text-zinc-100 font-bold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-zinc-100 dark:bg-black/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-zinc-200 dark:border-white/10">$1</code>');
}

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null;
    const bullet = line.match(/^(\s*[-*•])\s+(.+)/);
    if (bullet) {
      return (
        <div key={i} className="flex gap-2 text-xs md:text-sm leading-relaxed my-1">
          <span className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0 drop-shadow-sm font-bold">•</span>
          <span className="text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: inlineFmt(bullet[2]) }} />
        </div>
      );
    }
    const num = line.match(/^(\d+)\.\s+(.+)/);
    if (num) {
      return (
        <div key={i} className="flex gap-2 text-xs md:text-sm leading-relaxed my-1">
          <span className="text-blue-600 dark:text-blue-400 font-mono font-bold flex-shrink-0 w-5">{num[1]}.</span>
          <span className="text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: inlineFmt(num[2]) }} />
        </div>
      );
    }
    if (line.startsWith('### ')) {
      return <h4 key={i} className="font-bold text-xs md:text-sm text-zinc-900 dark:text-zinc-100 mt-3 mb-1 tracking-tight">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="font-bold text-sm md:text-base text-blue-700 dark:text-blue-300 mt-3.5 mb-1.5 border-b border-zinc-200 dark:border-white/10 pb-1">{line.slice(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="font-bold text-base md:text-lg text-emerald-700 dark:text-emerald-400 mt-4 mb-2">{line.slice(2)}</h2>;
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-xs md:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: inlineFmt(line) }} />;
  }).filter(Boolean);
}

const LS = aiStorage;

export default function ChatbotSpaceView({
  messages: propMessages,
  setMessages: propSetMessages,
  chatSessions = [],
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onToast,
  onAddCredits,
  onReturnToEcosystem,
  ecosystemScreenName,
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileMenu
}) {
  // Provider Settings State
  const [provider, setProvider] = useState(() => aiStorage.get('pulseup_ai_provider', 'none'));
  const [geminiKey, setGeminiKey] = useState(() => aiStorage.get('pulseup_gemini_key', ''));
  const [geminiModel, setGeminiModel] = useState(() => aiStorage.get('pulseup_gemini_model', 'gemini-2.0-flash'));
  const [geminiDraft, setGeminiDraft] = useState('');

  const [customUrl, setCustomUrl] = useState(() => aiStorage.get('pulseup_custom_url', ''));
  const [customKey, setCustomKey] = useState(() => aiStorage.get('pulseup_custom_key', ''));
  const [customModel, setCustomModel] = useState(() => aiStorage.get('pulseup_custom_model', 'llama-3.3-70b-versatile'));
  const [cloudPreset, setCloudPreset] = useState(() => aiStorage.get('pulseup_cloud_preset', 'groq'));

  const [customUrlDraft, setCustomUrlDraft] = useState('');
  const [customKeyDraft, setCustomKeyDraft] = useState('');
  const [customModelDraft, setCustomModelDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Rail & Tab Mode: 'sessions' | 'modes' | 'templates'
  const [railTab, setRailTab] = useState('sessions');
  const [sessionSearch, setSessionSearch] = useState('');
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitleDraft, setEditTitleDraft] = useState('');

  // Ping Test State: { loading, success, latency, error, title }
  const [pingStatus, setPingStatus] = useState(null);

  // Active Clinical Mode & Rail Toggle
  const [activeMode, setActiveMode] = useState('general');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRailOpen, setIsRailOpen] = useState(true);

  // Sync draft states when settings change
  useEffect(() => {
    setGeminiDraft(geminiKey);
    setCustomUrlDraft(customUrl || 'https://api.groq.com/openai/v1');
    setCustomKeyDraft(customKey);
    setCustomModelDraft(customModel || 'llama-3.3-70b-versatile');
  }, [geminiKey, customUrl, customKey, customModel]);

  // Synchronize across components when AI config changes
  useEffect(() => {
    const handleSync = () => {
      setProvider(aiStorage.get('pulseup_ai_provider', 'none'));
      setGeminiKey(aiStorage.get('pulseup_gemini_key', ''));
      setGeminiModel(aiStorage.get('pulseup_gemini_model', 'gemini-2.0-flash'));
      setCustomUrl(aiStorage.get('pulseup_custom_url', ''));
      setCustomKey(aiStorage.get('pulseup_custom_key', ''));
      setCustomModel(aiStorage.get('pulseup_custom_model', 'llama-3.3-70b-versatile'));
      setCloudPreset(aiStorage.get('pulseup_cloud_preset', 'groq'));
    };
    window.addEventListener(PULSEUP_AI_CONFIG_EVENT, handleSync);
    return () => window.removeEventListener(PULSEUP_AI_CONFIG_EVENT, handleSync);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Shared Messages with Fallback State
  const [localMessages, setLocalMessages] = useState(() => [
    {
      role: 'assistant',
      text: `### Welcome to medimind.ai Fullscreen Space 🩺✨\n\nI am your dedicated **Clinical & Medical Career Copilot**, tailored specifically for Indian MBBS students, interns, and postgrad residents.\n\n**Capabilities & Modes:**\n- **NEET PG & NEXT Strategy**: High-yield subject prioritization, clinical recall analysis, and grand test drills.\n- **ICMR-STS & Research Grants**: Protocol design, ethics clearance (IEC), sample size calculation, and CRediT authorship.\n- **NMC CBME & AETCOM**: SPIKES protocol, informed consent, difficult patient encounters, and reflective logbook entries.\n- **USMLE & Global Fellowships**: Step 1/2 CK study calendars, ECFMG certification, and elective matching.\n- **Multi-LLM Engine**: Works with **Google Gemini**, **Cloud-Served LLMs** (Groq, OpenRouter, DeepSeek, OpenAI), or offline high-yield clinical drills.\n\nSelect a clinical mode or tap any prompt starter below to begin!`,
      id: 'welcome',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messages = propMessages || localMessages;
  const setMessages = propSetMessages || setLocalMessages;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesScrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Scroll strictly within the messages container to avoid moving the Android viewport
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSelectCloudPreset = (presetId) => {
    setCloudPreset(presetId);
    const p = CLOUD_PRESETS.find(x => x.id === presetId);
    if (p && p.defaultUrl) {
      setCustomUrlDraft(p.defaultUrl);
      setCustomModelDraft(p.defaultModel);
    }
    setPingStatus(null);
  };

  const handleSaveGemini = () => {
    const k = cleanApiKey(geminiDraft);
    if (!k) {
      onToast?.({
        type: 'error',
        title: 'Missing Key',
        message: 'Please provide a valid Gemini API key.'
      });
      return;
    }
    setGeminiKey(k);
    aiStorage.set('pulseup_gemini_key', k);
    aiStorage.set('pulseup_gemini_model', geminiModel);
    setProvider('gemini');
    aiStorage.set('pulseup_ai_provider', 'gemini');
    aiStorage.notifyUpdate();
    setIsConfigOpen(false);
    onToast?.({
      type: 'success',
      title: 'Gemini Cloud Activated',
      message: `medimind.ai powered by ${geminiModel} ✨`
    });
  };

  const handleSaveCustom = () => {
    const url = (customUrlDraft || '').trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      onToast?.({
        type: 'error',
        title: 'Invalid Server URL',
        message: 'Endpoint must start with http:// or https://'
      });
      return;
    }
    const model = (customModelDraft || '').trim() || 'llama-3.3-70b-versatile';
    const key = cleanApiKey(customKeyDraft);
    setCustomUrl(url);
    aiStorage.set('pulseup_custom_url', url);
    setCustomKey(key);
    aiStorage.set('pulseup_custom_key', key);
    setCustomModel(model);
    aiStorage.set('pulseup_custom_model', model);
    aiStorage.set('pulseup_cloud_preset', cloudPreset);
    setProvider('custom');
    aiStorage.set('pulseup_ai_provider', 'custom');
    aiStorage.notifyUpdate();
    setIsConfigOpen(false);
    onToast?.({
      type: 'success',
      title: 'Cloud LLM Connected',
      message: `Active provider: ${model} @ ${url}`
    });
  };

  const handleTestGemini = async () => {
    const k = cleanApiKey(geminiDraft || geminiKey);
    if (!k) {
      onToast?.({ type: 'error', title: 'Missing Key', message: 'Enter a Gemini API key first' });
      return;
    }
    setPingStatus({ loading: true });
    const res = await testGeminiConnection(k, geminiModel);
    setPingStatus({ loading: false, ...res });
    if (res.success) {
      onToast?.({
        type: 'success',
        title: 'Gemini Cloud Verified',
        message: `Endpoint responded in ${res.latency}ms!`
      });
    } else {
      onToast?.({
        type: 'error',
        title: res.title || 'Gemini Test Failed',
        message: res.error
      });
    }
  };

  const handleTestCloudConnection = async () => {
    const url = (customUrlDraft || customUrl).trim();
    if (!url) {
      onToast?.({ type: 'error', title: 'Missing URL', message: 'Enter a Base URL first' });
      return;
    }
    setPingStatus({ loading: true });
    const res = await testCloudConnection(
      url,
      customKeyDraft || customKey,
      customModelDraft || customModel
    );
    setPingStatus({ loading: false, ...res });
    if (res.success) {
      onToast?.({
        type: 'success',
        title: 'Cloud LLM Verified',
        message: `Connected to ${res.model} in ${res.latency}ms!`
      });
    } else {
      onToast?.({
        type: 'error',
        title: res.title || 'Connection Failed',
        message: res.error
      });
    }
  };

  const handleResetProvider = () => {
    setProvider('none');
    aiStorage.set('pulseup_ai_provider', 'none');
    aiStorage.set('pulseup_gemini_key', '');
    aiStorage.set('pulseup_custom_url', '');
    aiStorage.set('pulseup_custom_key', '');
    aiStorage.notifyUpdate();
    setPingStatus(null);
    onToast?.({
      type: 'info',
      title: 'Scripted Mode Active',
      message: 'Switched to built-in high-yield medical career response bank.'
    });
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Chat history cleared. Select a clinical mode or type any medical career inquiry below.',
        id: 'cleared-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      onToast?.({ type: 'info', title: 'Copied', message: 'Message copied to clipboard.' });
    });
  };

  const handleExportMarkdown = () => {
    const exportText = messages
      .map(m => `### ${m.role === 'user' ? 'User' : 'PulseAI'} (${m.timestamp || ''})\n\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medimind-ai-session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onToast?.({ type: 'success', title: 'Exported', message: 'Chat transcript downloaded as Markdown.' });
  };

  const handleSendMessage = async (textToSend) => {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;

    setInput('');
    const userMsg = {
      role: 'user',
      text: userText,
      id: 'usr-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    // Auto-update active session title if it's currently a default or empty thread
    const activeSession = chatSessions?.find(s => s.id === activeSessionId);
    if (activeSession && (activeSession.title.startsWith('New ') || (activeSession.messages && activeSession.messages.length <= 1))) {
      const generatedTitle = userText.length > 32 ? userText.slice(0, 32) + '…' : userText;
      onRenameSession?.(activeSession.id, generatedTitle);
    }

    const modeConfig = CLINICAL_MODES.find(m => m.id === activeMode) || CLINICAL_MODES[4];
    const systemPromptWithMode = `${SYSTEM_INSTRUCTION_BASE}\n\nCURRENT SPECIALTY FOCUS: ${modeConfig.label}\n${modeConfig.prompt}`;

    try {
      if (provider === 'gemini' && geminiKey) {
        const replyText = await callGeminiApi({
          key: geminiKey,
          model: geminiModel,
          messages,
          userText,
          systemPrompt: systemPromptWithMode,
        });
        const botMsg = {
          role: 'assistant',
          text: replyText,
          id: 'bot-' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalMsgs = [...nextMessages, botMsg];
        setMessages(finalMsgs);
        if (activeSessionId) {
          chatSessionStorage.updateSessionMessages(activeSessionId, finalMsgs);
        }
        setLoading(false);
      } else if (provider === 'custom' && customUrl) {
        const replyText = await callCloudLlmApi({
          url: customUrl,
          key: customKey,
          model: customModel,
          messages,
          userText,
          systemPrompt: systemPromptWithMode,
        });
        const botMsg = {
          role: 'assistant',
          text: replyText,
          id: 'bot-' + Date.now(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalMsgs = [...nextMessages, botMsg];
        setMessages(finalMsgs);
        if (activeSessionId) {
          chatSessionStorage.updateSessionMessages(activeSessionId, finalMsgs);
        }
        setLoading(false);
      } else {
        // Prototype Clinical Intelligence Engine with Realistic Token Streaming
        const fullPrototypeResponse = generatePrototypeResponse(userText, activeMode);
        const botId = 'bot-' + Date.now();
        const placeholderMsg = {
          role: 'assistant',
          text: '',
          id: botId,
          isStreaming: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...nextMessages, placeholderMsg]);

        // Start progressive token streaming simulation (12ms per chunk)
        simulateStreamResponse(
          fullPrototypeResponse,
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

      if (onAddCredits && Math.random() > 0.6) {
        onAddCredits(5);
        onToast?.({
          type: 'info',
          title: 'Learning Credit Earned',
          message: '+5 Pulse Credits awarded for active clinical deliberation.'
        });
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      const errMsg = {
        role: 'assistant',
        text: `**⚠️ Error Communicating with AI Provider:**\n\n${err?.message || 'Something went wrong.'}\n\n*Tap Setup (⚙️) above to test connection, check API credentials, or switch cloud providers.*`,
        id: 'err-' + Date.now(),
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => {
        const msgsWithError = [...prev, errMsg];
        if (activeSessionId) {
          chatSessionStorage.updateSessionMessages(activeSessionId, msgsWithError);
        }
        return msgsWithError;
      });
      onToast?.({
        type: 'error',
        title: 'AI Communication Error',
        message: (err?.message || 'Failed to communicate with provider').slice(0, 120),
      });
      setLoading(false);
    }
  };

  const handleRegenerateLast = () => {
    if (loading) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) {
      onToast?.({ type: 'info', title: 'Nothing to Regenerate', message: 'Send a prompt first to re-deliberate.' });
      return;
    }
    // Remove last assistant message
    const lastBotIdx = [...messages].map(m => m.role).lastIndexOf('assistant');
    if (lastBotIdx !== -1) {
      setMessages(prev => prev.slice(0, lastBotIdx));
    }
    handleSendMessage(lastUserMsg.text);
  };

  const handleApplyTemplate = (tpl) => {
    setInput(tpl.prompt);
    if (tpl.category && CLINICAL_MODES.some(m => m.id === tpl.category)) {
      setActiveMode(tpl.category);
    }
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    onToast?.({
      type: 'info',
      title: 'Prompt Template Loaded',
      message: `"${tpl.title}" ready in composer. Press Send ↵ to deliberate.`
    });
  };

  const handleSaveRename = (sessionId) => {
    const trimmed = (editTitleDraft || '').trim();
    if (trimmed && onRenameSession) {
      onRenameSession(sessionId, trimmed);
      onToast?.({ type: 'success', title: 'Renamed', message: `Thread renamed to "${trimmed}"` });
    }
    setEditingSessionId(null);
    setEditTitleDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentModeObj = CLINICAL_MODES.find(m => m.id === activeMode) || CLINICAL_MODES[4];

  // Drawer content component for reuse in desktop column & mobile overlay drawer
  const renderSidebarContent = () => {
    const activeSession = (chatSessions || []).find(s => s.id === activeSessionId) || null;
    const filteredSessions = (chatSessions || []).filter(s =>
      (s.title || '').toLowerCase().includes(sessionSearch.toLowerCase()) ||
      (s.mode || '').toLowerCase().includes(sessionSearch.toLowerCase())
    );
    const sortedSessions = [...filteredSessions].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    return (
      <div className="flex flex-col gap-3.5 h-full min-h-0">
        {/* Mobile Drawer Header with Close Button */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/10 lg:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />
            <span className="font-display font-bold text-sm text-zinc-900 dark:text-white">medimind.ai Setup</span>
          </div>
          <button
            onClick={() => setIsConfigOpen(false)}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* 3-Way Rail Tab Selector */}
        <div className="flex p-1 rounded-xl bg-zinc-200/70 dark:bg-black/40 border border-zinc-300/50 dark:border-white/10 gap-1 flex-shrink-0">
          <button
            onClick={() => setRailTab('sessions')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              railTab === 'sessions'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare size={13} />
            <span>Chats ({chatSessions?.length || 0})</span>
          </button>
          <button
            onClick={() => setRailTab('modes')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              railTab === 'modes'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Stethoscope size={13} />
            <span>Modes</span>
          </button>
          <button
            onClick={() => setRailTab('templates')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              railTab === 'templates'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Drills</span>
          </button>
        </div>

        {/* TAB 1: SESSIONS / PRESERVED CHAT HISTORY */}
        {railTab === 'sessions' && (
          <div className="flex-1 flex flex-col min-h-0 gap-2.5 overflow-hidden">
            {/* New Consultation Action & Search */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  onCreateSession?.(activeMode);
                  setIsConfigOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>New Consultation</span>
              </button>

              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={e => setSessionSearch(e.target.value)}
                  placeholder="Filter chat threads..."
                  className="w-full bg-white dark:bg-black/30 border border-zinc-200 dark:border-white/10 text-xs rounded-xl pl-8 pr-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Scrollable Thread List */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
              {sortedSessions.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
                  <p>No matching consultations.</p>
                </div>
              ) : (
                sortedSessions.map(sess => {
                  const isCur = sess.id === activeSessionId;
                  const isEditing = editingSessionId === sess.id;
                  const modeObj = CLINICAL_MODES.find(m => m.id === sess.mode) || CLINICAL_MODES[4];

                  return (
                    <div
                      key={sess.id}
                      className={`group relative p-2.5 rounded-xl border text-left transition-all ${
                        isCur
                          ? 'bg-blue-50/80 dark:bg-blue-500/15 border-blue-400/40 shadow-xs'
                          : 'bg-white/80 dark:bg-white/[0.03] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'
                      }`}
                    >
                      {/* Session Title or Inline Rename */}
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={editTitleDraft}
                            onChange={e => setEditTitleDraft(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveRename(sess.id);
                              if (e.key === 'Escape') setEditingSessionId(null);
                            }}
                            className="flex-1 bg-white dark:bg-black/60 border border-blue-500 rounded px-1.5 py-0.5 text-xs font-semibold outline-none text-zinc-900 dark:text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(sess.id)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                            title="Save"
                          >
                            <CheckCheck size={12} />
                          </button>
                          <button
                            onClick={() => setEditingSessionId(null)}
                            className="p-1 rounded bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            onSelectSession?.(sess.id);
                            setIsConfigOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-xs font-bold truncate ${isCur ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
                              {sess.title}
                            </span>
                            {sess.pinned && (
                              <Pin size={11} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                              {modeObj.label.split('/')[0]}
                            </span>
                            <span>{sess.messages?.length || 0} msgs</span>
                          </div>
                        </div>
                      )}

                      {/* Hover Actions Bar */}
                      {!isEditing && (
                        <div className="flex items-center justify-end gap-1 mt-1.5 pt-1 border-t border-zinc-100 dark:border-white/5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onTogglePinSession?.(sess.id)}
                            className="p-1 rounded text-zinc-400 hover:text-amber-500"
                            title={sess.pinned ? 'Unpin thread' : 'Pin thread'}
                          >
                            <Pin size={11} className={sess.pinned ? 'fill-amber-500 text-amber-500' : ''} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingSessionId(sess.id);
                              setEditTitleDraft(sess.title);
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-blue-500"
                            title="Rename thread"
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            onClick={() => {
                              const exportText = (sess.messages || [])
                                .map(m => `### ${m.role === 'user' ? 'User' : 'medimind.ai'} (${m.timestamp || ''})\n\n${m.text}\n`)
                                .join('\n---\n\n');
                              const blob = new Blob([exportText], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${sess.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
                              a.click();
                              URL.revokeObjectURL(url);
                              onToast?.({ type: 'success', title: 'Exported', message: 'Thread downloaded as Markdown.' });
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-emerald-500"
                            title="Download thread"
                          >
                            <Download size={11} />
                          </button>
                          {(chatSessions || []).length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete thread "${sess.title}"?`)) {
                                  onDeleteSession?.(sess.id);
                                }
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-rose-500"
                              title="Delete thread"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MODES & INFERENCE ENGINE SETUP */}
        {railTab === 'modes' && (
          <div className="flex-1 flex flex-col min-h-0 gap-3 overflow-y-auto pr-0.5">
            {/* Active Model / Provider Quick Toggle */}
            <div className="backdrop-blur-md bg-white/80 dark:bg-white/[0.04] p-3 rounded-2xl border border-zinc-200/90 dark:border-white/[0.09] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Inference Engine</span>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setProvider('gemini');
                    aiStorage.set('pulseup_ai_provider', 'gemini');
                    aiStorage.notifyUpdate();
                    setPingStatus(null);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all duration-200 border ${
                    provider === 'gemini'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/40 shadow-sm'
                      : 'bg-zinc-100/80 dark:bg-white/[0.03] text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-transparent hover:border-zinc-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={provider === 'gemini' ? 'text-amber-300' : 'text-blue-500 dark:text-blue-400'} />
                    <span>Google Gemini Cloud</span>
                  </div>
                  {geminiKey ? <span className="text-[9px] opacity-90 font-mono">Linked ✓</span> : <span className="text-[9px] opacity-60">No key</span>}
                </button>

                <button
                  onClick={() => {
                    setProvider('custom');
                    aiStorage.set('pulseup_ai_provider', 'custom');
                    aiStorage.notifyUpdate();
                    setPingStatus(null);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all duration-200 border ${
                    provider === 'custom'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/40 shadow-sm'
                      : 'bg-zinc-100/80 dark:bg-white/[0.03] text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-transparent hover:border-zinc-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Cloud size={14} className={provider === 'custom' ? 'text-white' : 'text-purple-500 dark:text-purple-400'} />
                    <span>Cloud LLM (Groq / OpenRouter)</span>
                  </div>
                  {customUrl ? <span className="text-[9px] opacity-90 font-mono">Linked ✓</span> : <span className="text-[9px] opacity-60">Set URL</span>}
                </button>

                <button
                  onClick={handleResetProvider}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all duration-200 border ${
                    provider === 'none'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold border-emerald-400/40 shadow-sm'
                      : 'bg-zinc-100/80 dark:bg-white/[0.03] text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-transparent hover:border-zinc-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bot size={14} className={provider === 'none' ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'} />
                    <span>Prototype Clinical Engine</span>
                  </div>
                  <span className="text-[9px] opacity-80 font-mono">Streaming</span>
                </button>
              </div>
            </div>

            {/* Model Settings Inputs */}
            <div className="backdrop-blur-xl bg-white/90 dark:bg-[#151F33]/85 p-3.5 rounded-2xl border border-zinc-200 dark:border-blue-400/30 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 border-b border-zinc-200 dark:border-white/10 pb-1.5">
                <Sliders size={13} className="text-blue-500 dark:text-blue-400" />
                Credentials & Cloud Setup
              </h4>

              {provider === 'gemini' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 dark:text-zinc-400">Google AI Studio</span>
                    <a
                      href="https://aistudio.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-0.5 font-semibold"
                    >
                      Get Free API Key <ExternalLink size={9} />
                    </a>
                  </div>

                  <div>
                    <label className="text-[9.5px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block mb-1">
                      Gemini Model
                    </label>
                    <select
                      value={geminiModel}
                      onChange={e => setGeminiModel(e.target.value)}
                      className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/15 text-xs rounded-xl px-2.5 py-1.5 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        type={showKey ? 'text' : 'password'}
                        value={geminiDraft}
                        onChange={e => setGeminiDraft(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 text-xs rounded-xl px-2.5 py-1.5 pr-8 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  {pingStatus && (
                    <div className={`p-2 rounded-xl text-[10px] font-mono border flex items-center justify-between ${
                      pingStatus.success
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}>
                      <span className="truncate">
                        {pingStatus.success ? `✓ Verified (${pingStatus.latency}ms)` : `✕ ${pingStatus.error}`}
                      </span>
                      {pingStatus.success && <span className="text-[9px] font-bold text-emerald-500">Live</span>}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveGemini}
                      className="flex-1 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:brightness-105"
                    >
                      Save Key
                    </button>
                    <button
                      onClick={handleTestGemini}
                      disabled={pingStatus?.loading}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold rounded-xl text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 flex items-center gap-1"
                    >
                      {pingStatus?.loading ? <RefreshCw size={12} className="animate-spin text-blue-500" /> : 'Ping'}
                    </button>
                    {geminiKey && (
                      <button
                        onClick={handleResetProvider}
                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              ) : provider === 'custom' ? (
                <div className="space-y-2.5">
                  {/* 1-Click Cloud Provider Presets */}
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      Cloud Presets
                    </label>
                    <div className="grid grid-cols-3 gap-1">
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
                      <label className="text-[9.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
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
                      value={customUrlDraft}
                      onChange={e => setCustomUrlDraft(e.target.value)}
                      placeholder="https://api.groq.com/openai/v1 or https://openrouter.ai/api/v1"
                      className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 text-xs rounded-xl px-2.5 py-1.5 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-[8.5px] text-zinc-400 mt-0.5 font-mono">
                      Auto-resolves /v1 and /chat/completions endpoints
                    </p>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      Model Identifier
                    </label>
                    <input
                      type="text"
                      value={customModelDraft}
                      onChange={e => setCustomModelDraft(e.target.value)}
                      placeholder="llama-3.3-70b-versatile, deepseek-chat, gpt-4o-mini"
                      className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 text-xs rounded-xl px-2.5 py-1.5 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                      API Key / Bearer Token
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={customKeyDraft}
                        onChange={e => setCustomKeyDraft(e.target.value)}
                        placeholder={CLOUD_PRESETS.find(p => p.id === cloudPreset)?.keyPlaceholder || 'sk-... or leave blank'}
                        className="w-full bg-white dark:bg-black/30 border border-zinc-300 dark:border-white/10 text-xs rounded-xl px-2.5 py-1.5 pr-8 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  {pingStatus && (
                    <div className={`p-2 rounded-xl text-[10px] font-mono border flex items-center justify-between ${
                      pingStatus.success
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}>
                      <span className="truncate">
                        {pingStatus.success ? `✓ Connected (${pingStatus.latency}ms)` : `✕ ${pingStatus.error}`}
                      </span>
                      {pingStatus.success && <span className="text-[9px] font-bold text-emerald-500">Live</span>}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveCustom}
                      className="flex-1 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:brightness-105"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleTestCloudConnection}
                      disabled={pingStatus?.loading}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold rounded-xl text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 flex items-center gap-1"
                    >
                      {pingStatus?.loading ? <RefreshCw size={13} className="animate-spin text-purple-500 dark:text-purple-400" /> : 'Ping'}
                    </button>
                    {customUrl && (
                      <button
                        onClick={handleResetProvider}
                        className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Active: <strong>Prototype Clinical Engine</strong> with simulated streaming. Switch to Gemini or Cloud LLM above to link external keys.
                </div>
              )}
            </div>

            {/* Clinical Focus Mode Selector */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">Focus Mode</span>
              <div className="space-y-1.5">
                {CLINICAL_MODES.map(mode => {
                  const Icon = mode.icon;
                  const isSelected = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setActiveMode(mode.id);
                        setIsConfigOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-left backdrop-blur-md transition-all ${
                        isSelected
                          ? `bg-gradient-to-r ${mode.bgGradient} border-zinc-300 dark:border-white/20 shadow-md ${mode.borderGlow}`
                          : 'bg-white/70 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white dark:bg-white/10 shadow-xs ${mode.accentColor}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs truncate ${isSelected ? 'font-bold text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                            {mode.label}
                          </p>
                        </div>
                      </div>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLINICAL PROMPT TEMPLATES / DRILLS */}
        {railTab === 'templates' && (
          <div className="flex-1 flex flex-col min-h-0 gap-2 overflow-y-auto pr-0.5">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1 leading-snug">
              Curated evidence-based prompts for NEET PG revision, NMC CBME bioethics, and ICMR-STS grant writing.
            </div>
            {CLINICAL_PROMPT_TEMPLATES.map(tpl => (
              <div
                key={tpl.id}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:border-blue-400 dark:hover:border-blue-500/40 transition-all flex flex-col gap-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-400/20">
                    {tpl.category.toUpperCase()}
                  </span>
                  <span className="text-base">{tpl.icon}</span>
                </div>
                <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tpl.title}
                </h5>
                <p className="text-[10.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {tpl.description}
                </p>
                <button
                  onClick={() => {
                    handleApplyTemplate(tpl);
                    setIsConfigOpen(false);
                  }}
                  className="mt-1 w-full py-1 px-2 rounded-lg bg-zinc-100 hover:bg-blue-600 dark:bg-white/5 dark:hover:bg-blue-600 hover:text-white text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <span>Use Template</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const activeSessionObj = (chatSessions || []).find(s => s.id === activeSessionId) || null;

  return (
    <div className="relative flex flex-col h-full max-h-full flex-1 w-full min-h-0 rounded-none overflow-hidden backdrop-blur-2xl bg-zinc-50/90 dark:bg-[#0B101B]/90 border-0 shadow-none">
      {/* Glassmorphic Ambient Glow Highlights */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Space Header with Frosted Glass Reflex (Mobile Optimized - Sticky and Locked) */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 backdrop-blur-2xl bg-white/95 dark:bg-[#121A2D]/95 border-b border-zinc-200 dark:border-white/[0.08] flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Menu Drawer Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              title="Open Navigation Drawer"
            >
              <Menu size={16} />
            </button>
          )}

          {/* Return to PulseUp Ecosystem Navigation Button */}
          {onReturnToEcosystem && (
            <button
              onClick={onReturnToEcosystem}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-white/10 transition-all shadow-sm group flex-shrink-0"
              title={`Return to ${ecosystemScreenName || 'PulseUp Ecosystem'}`}
            >
              <ArrowRight size={13} className="rotate-180 text-blue-500 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline font-medium">← Return</span>
              <span className="sm:hidden font-medium">Exit</span>
            </button>
          )}

          {/* Glowing Avatar */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-md flex-shrink-0">
            <div className="w-full h-full rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center text-blue-600 dark:text-white">
              <Bot size={18} className="drop-shadow-[0_0_6px_rgba(59,130,246,0.5)] dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white dark:border-[#121A2D] shadow-sm animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="font-display font-black text-xs sm:text-sm md:text-base tracking-tight text-zinc-900 dark:text-white flex items-center gap-1">
                medimind.ai
                <Sparkles size={13} className="text-amber-500 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse" />
              </h2>

              {/* Active Thread Title Pill with Rename Icon */}
              {activeSessionObj && (
                <div
                  onClick={() => {
                    const nextTitle = window.prompt('Rename consultation thread:', activeSessionObj.title);
                    if (nextTitle && nextTitle.trim()) {
                      onRenameSession?.(activeSessionObj.id, nextTitle.trim());
                    }
                  }}
                  className="cursor-pointer group flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 border border-zinc-200 dark:border-white/10 text-[10px] text-zinc-700 dark:text-zinc-300 font-medium max-w-[150px] sm:max-w-[220px] transition-all"
                  title="Click to rename thread"
                >
                  <span className="truncate">{activeSessionObj.title}</span>
                  <Edit3 size={10} className="opacity-40 group-hover:opacity-100 flex-shrink-0" />
                </div>
              )}

              <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1 border truncate max-w-[130px] sm:max-w-none ${
                provider === 'gemini'
                  ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-400/30'
                  : provider === 'custom'
                  ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-400/30'
                  : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/30'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0"></span>
                <span className="truncate">
                  {provider === 'gemini'
                    ? geminiModel.replace('gemini-', 'Gemini ')
                    : provider === 'custom'
                    ? customModel
                    : 'Prototype Engine'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls with Glassmorphism */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Quick "+ New Chat" Button */}
          <button
            onClick={() => onCreateSession?.(activeMode)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all"
            title="Create New Consultation Thread"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Desktop Tools Rail Toggle */}
          <button
            onClick={() => setIsRailOpen(r => !r)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-zinc-200 dark:border-white/20 bg-white/80 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all shadow-sm"
            title={isRailOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <PanelLeft size={13} className="text-blue-500 dark:text-blue-400" />
            <span className="hidden xl:inline">{isRailOpen ? 'Hide' : 'Threads'}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-zinc-200 dark:border-white/20 bg-white/80 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all shadow-sm"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-blue-600" />}
            </button>
          )}

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-zinc-200 dark:border-white/20 bg-white/80 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all shadow-sm"
            title="Model Settings & Modes"
          >
            <Sliders size={13} className="text-blue-500 dark:text-blue-400" />
            <span className="hidden sm:inline">Setup</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-zinc-200 dark:border-white/20 bg-white/80 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <Maximize2 size={13} className={isFullscreen ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400'} />
            <span className="hidden md:inline ml-1">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            title="Download Transcript"
            className="p-1.5 sm:p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-white/80 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/20 hover:bg-zinc-100 dark:hover:bg-white/10 backdrop-blur-md transition-all shadow-sm"
          >
            <FileText size={13} />
          </button>

          <button
            onClick={handleClearChat}
            title="Clear Chat"
            className="p-1.5 sm:p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-white/80 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/20 hover:bg-zinc-100 dark:hover:bg-white/10 backdrop-blur-md transition-all shadow-sm"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="relative z-10 flex-1 flex min-h-0 h-full overflow-hidden">
        {/* Desktop Left Rail (lg only) */}
        {isRailOpen && (
          <div className="hidden lg:flex w-72 backdrop-blur-xl bg-zinc-50/90 dark:bg-[#0D1424]/60 border-r border-zinc-200 dark:border-white/[0.08] p-3.5 flex-col gap-4 overflow-y-auto flex-shrink-0 animate-fadeIn">
            {renderSidebarContent()}
          </div>
        )}

        {/* Mobile Slide-In Overlay Drawer (< lg) */}
        {isConfigOpen && (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-md lg:hidden flex justify-end animate-fadeIn">
            <div className="w-[88vw] max-w-sm h-full bg-white dark:bg-[#0E1524] p-4 flex flex-col gap-4 overflow-y-auto shadow-2xl border-l border-zinc-200 dark:border-white/10">
              {renderSidebarContent()}
            </div>
          </div>
        )}

        {/* Chat Stream View */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full backdrop-blur-md bg-white/50 dark:bg-[#080D1A]/50 relative overflow-hidden">
          {/* Scrollable Message List */}
          <div
            ref={messagesScrollRef}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5 md:p-6 space-y-3.5 scroll-smooth"
          >
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 sm:gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md mt-0.5 ${
                    isUser
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs'
                      : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white'
                  }`}>
                    {isUser ? <User size={14} /> : <Bot size={15} />}
                  </div>

                  <div className={`group relative rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-xl border break-words ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-sm max-w-[88%] sm:max-w-[85%] border-blue-400/30'
                      : msg.isError
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-200 rounded-tl-sm max-w-[94%] sm:max-w-[92%]'
                      : 'bg-white dark:bg-[#141C2E]/90 border-zinc-200/90 dark:border-white/[0.09] text-zinc-900 dark:text-zinc-100 rounded-tl-sm max-w-[94%] sm:max-w-[92%] shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between gap-3 text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 pb-1 border-b border-zinc-100 dark:border-white/10 font-mono">
                      <span className="font-semibold">{isUser ? 'You' : 'medimind.ai'}</span>
                      <span>{msg.timestamp || ''}</span>
                    </div>

                    <div className="space-y-1">
                      {isUser ? (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      ) : (
                        <div>
                          {renderMarkdown(msg.text)}
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3.5 bg-blue-500 animate-pulse ml-0.5 align-middle rounded-xs" />
                          )}
                        </div>
                      )}
                    </div>

                    {!isUser && (
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200 dark:border-white/20 p-0.5 rounded-lg shadow-sm">
                        <button
                          onClick={handleRegenerateLast}
                          disabled={loading}
                          className="p-1 rounded text-zinc-500 hover:text-blue-500 transition-colors"
                          title="Regenerate deliberation"
                        >
                          <RotateCcw size={11} />
                        </button>
                        <button
                          onClick={() => handleCopyMessage(msg.text, msg.id)}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? <CheckCheck size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && !messages.some(m => m.isStreaming) && (
              <div className="flex gap-2 sm:gap-3 max-w-2xl mr-auto">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot size={15} />
                </div>
                <div className="backdrop-blur-xl bg-white dark:bg-[#141C2E]/80 border border-zinc-200 dark:border-white/20 rounded-2xl rounded-tl-sm p-3 sm:p-4 flex items-center gap-2.5 shadow-sm">
                  <RefreshCw size={13} className="text-blue-500 animate-spin" />
                  <span className="text-xs text-zinc-600 dark:text-[#94A3B8]">
                    {provider === 'gemini'
                      ? 'Deliberating with Gemini…'
                      : provider === 'custom'
                      ? `Querying ${customModel}…`
                      : 'Formulating clinical guidance…'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Composer & Quick Inquiries Bar (Auto-fit for Mobile - Docked & Persistent) */}
          <div className="sticky bottom-0 z-30 p-2.5 sm:p-3.5 md:p-4 border-t border-zinc-200 dark:border-white/15 backdrop-blur-2xl bg-white/95 dark:bg-[#0B101B]/95 flex-shrink-0 shadow-md">
            {/* Quick Chips Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1.5 no-scrollbar">
              <span className="text-[9.5px] font-mono text-zinc-600 dark:text-zinc-400 uppercase flex-shrink-0 font-bold px-1">
                {currentModeObj.label}:
              </span>
              {currentModeObj.starters.map((starter, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendMessage(starter)}
                  className="flex-shrink-0 text-[10.5px] px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/15 text-zinc-700 dark:text-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all truncate max-w-[240px] shadow-sm"
                >
                  {starter}
                </button>
              ))}
            </div>

            {/* Input Box with Character & Token Counter */}
            <div className="flex items-end gap-2 max-w-4xl mx-auto">
              <div className="flex-1 backdrop-blur-xl bg-white dark:bg-[#141C2E]/85 border border-zinc-300 dark:border-white/[0.12] rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 p-2 sm:p-2.5 transition-all">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask medimind.ai (${currentModeObj.label})...`}
                  className="w-full bg-transparent resize-none outline-none text-[16px] sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 leading-relaxed font-sans max-h-28"
                />
                <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-white/[0.06] text-[9.5px] text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Mode: <strong className="text-zinc-800 dark:text-zinc-200">{currentModeObj.label}</strong></span>
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[9px] opacity-80">
                    <span>{input.length} chars (~{Math.round(input.length / 4)} tokens)</span>
                    <span className="hidden sm:inline opacity-60">| Enter ↵ to send</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-md flex-shrink-0 transition-all active:scale-95"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
