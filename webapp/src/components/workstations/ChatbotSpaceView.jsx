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
  Maximize2
} from 'lucide-react';

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
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-black/30 text-emerald-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-white/10">$1</code>');
}

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('```')) return null;
    const bullet = line.match(/^(\s*[-*•])\s+(.+)/);
    if (bullet) {
      return (
        <div key={i} className="flex gap-2 text-xs md:text-sm leading-relaxed my-1">
          <span className="text-emerald-400 mt-1 flex-shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">•</span>
          <span dangerouslySetInnerHTML={{ __html: inlineFmt(bullet[2]) }} />
        </div>
      );
    }
    const num = line.match(/^(\d+)\.\s+(.+)/);
    if (num) {
      return (
        <div key={i} className="flex gap-2 text-xs md:text-sm leading-relaxed my-1">
          <span className="text-blue-400 font-mono font-bold flex-shrink-0 w-5">{num[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: inlineFmt(num[2]) }} />
        </div>
      );
    }
    if (line.startsWith('### ')) {
      return <h4 key={i} className="font-bold text-xs md:text-sm text-zinc-100 mt-3 mb-1 tracking-tight">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} className="font-bold text-sm md:text-base text-blue-300 mt-3.5 mb-1.5 border-b border-white/10 pb-1">{line.slice(3)}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 key={i} className="font-bold text-base md:text-lg text-emerald-400 mt-4 mb-2">{line.slice(2)}</h2>;
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-xs md:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFmt(line) }} />;
  }).filter(Boolean);
}

const LS = {
  get: (k, def) => {
    try {
      const v = localStorage.getItem(k);
      return v !== null ? JSON.parse(v) : def;
    } catch {
      return def;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  }
};

export default function ChatbotSpaceView({ onToast, onAddCredits }) {
  // Provider Settings State
  const [provider, setProvider] = useState(() => LS.get('pulseup_ai_provider', 'none'));
  const [geminiKey, setGeminiKey] = useState(() => LS.get('pulseup_gemini_key', ''));
  const [geminiDraft, setGeminiDraft] = useState('');
  const [customUrl, setCustomUrl] = useState(() => LS.get('pulseup_custom_url', ''));
  const [customKey, setCustomKey] = useState(() => LS.get('pulseup_custom_key', ''));
  const [customModel, setCustomModel] = useState(() => LS.get('pulseup_custom_model', 'llama3'));
  const [customUrlDraft, setCustomUrlDraft] = useState('');
  const [customKeyDraft, setCustomKeyDraft] = useState('');
  const [customModelDraft, setCustomModelDraft] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Ping Test State
  const [pingStatus, setPingStatus] = useState(null);

  // Active Clinical Mode
  const [activeMode, setActiveMode] = useState('general');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Messages State
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: `### Welcome to the PulseAI Clinical Intelligence Space 🩺✨\n\nI am your dedicated **Medical Career & Clinical Copilot**, tailored specifically for Indian MBBS students, interns, and postgrad residents.\n\n**Key Workstations & Capabilities:**\n- **NEET PG & NEXT Strategy**: High-yield subject prioritization, clinical recall analysis, and grand test drills.\n- **ICMR-STS & Research Grants**: Protocol design, ethics clearance (IEC), sample size calculation, and CRediT authorship.\n- **NMC CBME & AETCOM**: SPIKES protocol, informed consent, difficult patient encounters, and reflective logbook entries.\n- **USMLE & Global Fellowships**: Step 1/2 CK study calendars, ECFMG certification, and elective matching.\n- **Multi-LLM Engine**: Switch effortlessly between **Google Gemini**, your own **Custom LLM Server** (Ollama, vLLM, LM Studio, VPS), or offline high-yield clinical drills.\n\nSelect a clinical mode on the left or tap any prompt starter below to begin!`,
      id: 'welcome',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setGeminiDraft(geminiKey);
    setCustomUrlDraft(customUrl);
    setCustomKeyDraft(customKey);
    setCustomModelDraft(customModel);
  }, [geminiKey, customUrl, customKey, customModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveGemini = () => {
    const k = geminiDraft.trim();
    if (!k.startsWith('AIza')) {
      onToast?.({
        type: 'error',
        title: 'Invalid Gemini Key',
        message: 'Gemini API keys start with "AIza". Obtain yours free at aistudio.google.com'
      });
      return;
    }
    setGeminiKey(k);
    LS.set('pulseup_gemini_key', k);
    setProvider('gemini');
    LS.set('pulseup_ai_provider', 'gemini');
    setIsConfigOpen(false);
    onToast?.({
      type: 'success',
      title: 'Gemini 2.0 Flash Activated',
      message: 'PulseAI is now powered by Google Gemini high-speed clinical inference.'
    });
  };

  const handleSaveCustom = () => {
    const url = customUrlDraft.trim().replace(/\/$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      onToast?.({
        type: 'error',
        title: 'Invalid Server URL',
        message: 'Endpoint must start with http:// or https://'
      });
      return;
    }
    const model = customModelDraft.trim() || 'llama3';
    setCustomUrl(url);
    LS.set('pulseup_custom_url', url);
    setCustomKey(customKeyDraft.trim());
    LS.set('pulseup_custom_key', customKeyDraft.trim());
    setCustomModel(model);
    LS.set('pulseup_custom_model', model);
    setProvider('custom');
    LS.set('pulseup_ai_provider', 'custom');
    setIsConfigOpen(false);
    onToast?.({
      type: 'success',
      title: 'Custom Model Connected',
      message: `Active provider: ${model} @ ${url}`
    });
  };

  const handleTestConnection = async () => {
    const url = (customUrlDraft || customUrl).trim().replace(/\/$/, '');
    if (!url) {
      onToast?.({ type: 'error', title: 'Missing URL', message: 'Enter a Base URL first' });
      return;
    }
    setPingStatus({ loading: true });
    const startTime = Date.now();
    try {
      const endpoint = `${url}/v1/chat/completions`;
      const headers = { 'Content-Type': 'application/json' };
      const key = customKeyDraft || customKey;
      if (key) headers['Authorization'] = `Bearer ${key}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: customModelDraft || customModel || 'llama3',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });

      const latency = Date.now() - startTime;
      if (res.ok) {
        setPingStatus({ loading: false, success: true, latency });
        onToast?.({
          type: 'success',
          title: 'Connection Successful',
          message: `Endpoint responded in ${latency}ms!`
        });
      } else {
        const errText = await res.text().catch(() => '');
        setPingStatus({ loading: false, success: false, error: `HTTP ${res.status}: ${errText.slice(0, 100)}` });
        onToast?.({
          type: 'error',
          title: 'Connection Failed',
          message: `Server returned status ${res.status}`
        });
      }
    } catch (err) {
      setPingStatus({ loading: false, success: false, error: err.message });
      onToast?.({
        type: 'error',
        title: 'Connection Error',
        message: err.message || 'Could not connect to custom server. Check CORS / URL.'
      });
    }
  };

  const handleResetProvider = () => {
    setProvider('none');
    LS.set('pulseup_ai_provider', 'none');
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
    a.download = `pulseup-ai-session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onToast?.({ type: 'success', title: 'Exported', message: 'Chat transcript downloaded as Markdown.' });
  };

  const getSmartScriptedResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('neet') || q.includes('revision') || q.includes('next')) {
      return `### NEET PG / NEXT 30-Day High-Yield Strategy\n\n**1. Subject Weightage Hierarchy:**\n- **Tier 1 (Core Clinicals)**: General Medicine, Surgery, Obstetrics & Gynaecology, Paediatrics (~40% of marks)\n- **Tier 2 (High ROI)**: Pathology, Pharmacology, Preventive & Social Medicine (PSM), Microbiology (~30% of marks)\n- **Tier 3 (Short Subjects)**: Dermatology, Psychiatry, Radiology, Anaesthesia, Orthopaedics (~20% of marks)\n\n**2. Daily Revision Rhythm:**\n- **Morning (08:00–13:00)**: First-pass active recall & high-yield flashcards (Marrow Pearl / Pre-PG tables).\n- **Afternoon (14:00–17:00)**: 100 timed MCQs in exam simulation mode. Never skip error bookmarking.\n- **Evening (18:00–21:00)**: Review incorrect questions + 20 image-based radiological/histopathological cases.\n\n**3. Grand Test (GT) Benchmark:**\n- Aim for 140+ correct answers on national mock tests before final month.\n- Track percentile rather than absolute marks (aim for >92nd percentile).`;
    }
    if (q.includes('icmr') || q.includes('grant') || q.includes('research') || q.includes('sts')) {
      return `### ICMR-STS Undergraduate Research Protocol Blueprint\n\n**1. Recommended Study Designs for MBBS Students:**\n- **Cross-Sectional Observational**: Prevalence of metabolic syndrome in young adults, antimicrobial prescription adherence, burnout among resident doctors.\n- **Clinical Audit**: Turnaround time for emergency stroke thrombolysis, surgical antibiotic prophylaxis timing.\n\n**2. Mandatory Protocol Components:**\n- **Title**: Specific, informative, including population and design (e.g., *"Evaluation of Time-to-Antibiotic Administration in Septic Shock Patients at a Tertiary Teaching Hospital: A Retrospective Cohort Study"*).\n- **Introduction & Justification**: 300 words citing Indian data (ICMR or National Family Health Survey NFHS-5).\n- **Methodology**: Detailed inclusion/exclusion criteria, sample size formula with 80% statistical power (1-β) and 5% alpha.\n- **Ethics Statement**: Clear commitment to patient confidentiality, anonymous coding, and IEC clearance.\n\n**3. Incentive on PulseUp:**\n- Submitting your proposal adds **+50 Pulse Credits** to your ledger and unlocks the Research Contributor badge on your Medical Passport.`;
    }
    if (q.includes('spikes') || q.includes('bad news') || q.includes('aetcom')) {
      return `### AETCOM Module 4.1: The SPIKES Protocol for Breaking Bad News\n\n**1. S — Setting up the Interview:**\n- Ensure privacy (quiet counselling room, no corridor discussions).\n- Involve significant family members with patient consent.\n- Sit down at eye level, turn off mobile ringtones, have tissues available.\n\n**2. P — Perception of the Patient/Family:**\n- *"What have the doctors told you about your condition so far?"*\n- Assess their understanding and medical literacy level.\n\n**3. I — Invitation:**\n- *"Would you like me to explain the detailed test results, or should I give you an overview first?"*\n- Respect patients who prefer family members to handle the technical details.\n\n**4. K — Knowledge Transmission:**\n- Warning shot: *"I am afraid I have some difficult news to share..."*\n- Use simple non-technical vernacular (avoid *"neoplasm"*, *"metastasis"*, *"poor prognosis"* initially).\n- Speak in short phrases and pause frequently to check comprehension.\n\n**5. E — Empathy & Emotions (NURSE framework):**\n- **Name**: *"I can see how overwhelming this must be."*\n- **Understand**: *"Anyone in your position would feel shocked."*\n- **Respect**: *"You have taken wonderful care of your father during this illness."*\n- **Support**: *"We will be with you throughout every stage of this treatment."*\n- **Explore**: *"Tell me what concerns you most right now."*\n\n**6. S — Strategy & Summary:**\n- Outline immediate palliative or therapeutic plan; schedule the next family meeting.`;
    }
    if (q.includes('usmle') || q.includes('step 1') || q.includes('step 2') || q.includes('match')) {
      return `### USMLE Pathway for Indian Medical Graduates (IMGs)\n\n**1. Step 1 (Pass/Fail):**\n- Target completion by end of 3rd Professional MBBS or early internship.\n- Core resources: **First Aid USMLE**, **UWorld (1.5x passes)**, **Pathoma Chapters 1–3**, **Sketchy Micro/Pharm**.\n- NBME practice exams: Ensure >70% EPC before booking exam.\n\n**2. Step 2 CK (Scored — High Stakes):**\n- Target score: **250+** for Internal Medicine / Paediatrics; **260+** for competitive branches (Radiology, Surgery).\n- Primary resource: 100% UWorld with custom flashcards, Amboss Ethics & Biostatistics.\n\n**3. US Clinical Experience (USCE):**\n- Aim for minimum **3 months of hands-on electives / sub-internships** at ACGME-accredited teaching hospitals with Letters of Recommendation (LoRs).\n\n**4. ECFMG Certification:**\n- Must pass Occupational English Test (OET Medicine) and satisfy Pathway requirements before ERAS submission in September.`;
    }
    return `### Clinical Consultation Note from PulseAI 🩺\n\nThank you for reaching out regarding: *"${query.slice(0, 80)}..."*\n\n**Clinical Analysis & High-Yield Summary:**\n- **Contextual Alignment**: In the Indian healthcare and training ecosystem (NMC CBME regulations), proactive longitudinal planning is critical.\n- **Actionable Steps**:\n  1. Review your current milestone log in the **Goal Spaces** and **Career Board** workstations.\n  2. For exam preparation, prioritize multi-system integrative reasoning over isolated rote memorization.\n  3. For research & audits, adhere to ICMR Good Clinical Practice (GCP) guidelines.\n\n*Configure your own Gemini or Custom LLM in the settings tab to unlock unlimited dynamic reasoning!*`;
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

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const modeConfig = CLINICAL_MODES.find(m => m.id === activeMode) || CLINICAL_MODES[4];
    const systemPromptWithMode = `${SYSTEM_INSTRUCTION_BASE}\n\nCURRENT SPECIALTY FOCUS: ${modeConfig.label}\n${modeConfig.prompt}`;

    try {
      let replyText = '';

      if (provider === 'gemini' && geminiKey) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const historyContents = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
          }));

        const body = {
          system_instruction: { parts: [{ text: systemPromptWithMode }] },
          contents: [
            ...historyContents,
            { role: 'user', parts: [{ text: userText }] }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP Error ${res.status}`);
        }
        const data = await res.json();
        replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(Empty response from Gemini)';

      } else if (provider === 'custom' && customUrl) {
        const endpoint = `${customUrl}/v1/chat/completions`;
        const headers = { 'Content-Type': 'application/json' };
        if (customKey) headers['Authorization'] = `Bearer ${customKey}`;

        const history = messages
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          }));

        const body = {
          model: customModel || 'llama3',
          messages: [
            { role: 'system', content: systemPromptWithMode },
            ...history,
            { role: 'user', content: userText }
          ],
          temperature: 0.7,
          max_tokens: 1500
        };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Server returned HTTP ${res.status}: ${errText.slice(0, 150)}`);
        }
        const data = await res.json();
        replyText = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '(No text in completion)';

      } else {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        replyText = getSmartScriptedResponse(userText);
      }

      const botMsg = {
        role: 'assistant',
        text: replyText,
        id: 'bot-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);

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
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `**⚠️ Error Communicating with AI Provider:**\n\n${err.message}\n\n*Suggestions:*\n- If using **Gemini**, verify your API key in the provider configuration settings.\n- If using a **Custom LLM**, check that your server has CORS enabled and the base URL is reachable.`,
          id: 'err-' + Date.now(),
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      onToast?.({
        type: 'error',
        title: 'Inference Error',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentModeObj = CLINICAL_MODES.find(m => m.id === activeMode) || CLINICAL_MODES[4];

  return (
    <div className="relative flex flex-col h-[calc(100vh-84px)] max-h-[1100px] rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/70 dark:bg-[#0B101B]/80 border border-white/20 dark:border-white/[0.12] shadow-[0_12px_48px_0_rgba(0,0,0,0.35)]">
      {/* Glassmorphic Ambient Glow Highlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Space Header with Frosted Glass Reflex */}
      <div className="relative z-10 flex items-center justify-between px-5 md:px-7 py-4 backdrop-blur-xl bg-white/60 dark:bg-[#121A2D]/70 border-b border-white/20 dark:border-white/[0.08] flex-shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Glowing Avatar */}
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-blue-500/25 flex-shrink-0">
            <div className="w-full h-full rounded-2xl bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center text-white">
              <Bot size={22} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#121A2D] shadow-sm shadow-emerald-400/80 animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display font-black text-sm md:text-base tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                medimind.ai
                <Sparkles size={15} className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse" />
              </h2>
              {/* Glassmorphic Status Pill */}
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md flex items-center gap-1.5 border transition-all ${
                provider === 'gemini'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-400/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
                  : provider === 'custom'
                  ? 'bg-purple-500/15 text-purple-400 border-purple-400/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]"></span>
                {provider === 'gemini' ? 'Gemini 2.0 Flash' : provider === 'custom' ? `Custom: ${customModel}` : 'Scripted Clinical Engine'}
              </span>

              <span className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20 hidden sm:inline-flex items-center gap-1">
                <Maximize2 size={10} /> Fullscreen Workspace
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] truncate hidden sm:block font-medium">
              medimind.ai · Next-gen clinical intelligence, grant drafting, ethics reasoning & multi-LLM workspace
            </p>
          </div>
        </div>

        {/* Action Controls with Glassmorphism */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Toggle True Fullscreen'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/20 dark:border-white/[0.1] bg-white/40 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-200 hover:bg-white/60 dark:hover:bg-white/[0.12] transition-all shadow-sm"
          >
            <Maximize2 size={13} className={isFullscreen ? 'text-amber-400' : 'text-blue-400'} />
            <span className="hidden md:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all duration-200 shadow-sm ${
              isConfigOpen
                ? 'bg-blue-600/90 text-white border-blue-400/60 shadow-[0_0_16px_rgba(59,130,246,0.4)]'
                : 'bg-white/40 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-200 border-white/20 dark:border-white/[0.1] hover:bg-white/60 dark:hover:bg-white/[0.12]'
            }`}
          >
            <Settings size={14} />
            <span className="hidden sm:inline">Model Settings</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            title="Download Chat as Markdown"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-white/40 dark:bg-white/[0.06] border border-white/20 dark:border-white/[0.1] hover:bg-white/60 dark:hover:bg-white/[0.12] backdrop-blur-md transition-all shadow-sm"
          >
            <FileText size={14} />
          </button>

          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 bg-white/40 dark:bg-white/[0.06] border border-white/20 dark:border-white/[0.1] hover:bg-white/60 dark:hover:bg-white/[0.12] backdrop-blur-md transition-all shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Workspace Body: 2-Column Glassmorphic Layout */}
      <div className="relative z-10 flex-1 flex min-h-0 overflow-hidden">
        {/* Left Column: Clinical Modes & Configuration Drawer */}
        <div className={`w-80 backdrop-blur-xl bg-white/50 dark:bg-[#0D1424]/60 border-r border-white/20 dark:border-white/[0.08] p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0 ${
          isConfigOpen ? 'block' : 'hidden lg:flex'
        }`}>
          {/* Active Model / Provider Quick Toggle */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-white/[0.04] p-3.5 rounded-2xl border border-white/30 dark:border-white/[0.09] shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Inference Engine</span>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Configure ⚙️
              </button>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => { setProvider('gemini'); LS.set('pulseup_ai_provider', 'gemini'); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all duration-200 border ${
                  provider === 'gemini'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/40 shadow-[0_4px_16px_rgba(59,130,246,0.35)]'
                    : 'bg-white/40 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 border-transparent hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className={provider === 'gemini' ? 'text-amber-300' : 'text-blue-400'} />
                  <span>Google Gemini</span>
                </div>
                {geminiKey ? <span className="text-[9px] opacity-90 font-mono">Linked ✓</span> : <span className="text-[9px] opacity-60">No key</span>}
              </button>

              <button
                onClick={() => { setProvider('custom'); LS.set('pulseup_ai_provider', 'custom'); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all duration-200 border ${
                  provider === 'custom'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/40 shadow-[0_4px_16px_rgba(168,85,247,0.35)]'
                    : 'bg-white/40 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 border-transparent hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Server size={14} className={provider === 'custom' ? 'text-white' : 'text-purple-400'} />
                  <span>Custom LLM Server</span>
                </div>
                {customUrl ? <span className="text-[9px] opacity-90 font-mono">Linked ✓</span> : <span className="text-[9px] opacity-60">Set URL</span>}
              </button>

              <button
                onClick={handleResetProvider}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all duration-200 border ${
                  provider === 'none'
                    ? 'bg-gradient-to-r from-emerald to-teal-500 text-navy-950 font-bold border-emerald-400/40 shadow-[0_4px_16px_rgba(16,185,129,0.35)]'
                    : 'bg-white/40 dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 border-transparent hover:border-white/10 hover:bg-white/60 dark:hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot size={14} className={provider === 'none' ? 'text-navy-950' : 'text-emerald-400'} />
                  <span>Scripted High-Yield</span>
                </div>
                <span className="text-[9px] opacity-80 font-mono">Offline</span>
              </button>
            </div>
          </div>

          {/* Model Settings Drawer (Collapsible) */}
          {isConfigOpen && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-[#151F33]/85 p-4 rounded-2xl border border-blue-400/40 dark:border-blue-400/30 shadow-[0_8px_32px_rgba(0,0,0,0.25)] space-y-3.5 animation-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sliders size={13} className="text-blue-400" />
                  Provider Configuration
                </h4>
                <button onClick={() => setIsConfigOpen(false)} className="text-zinc-400 hover:text-zinc-200 text-xs font-bold p-1">
                  ✕
                </button>
              </div>

              {provider === 'gemini' ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Paste your Gemini API key from{' '}
                    <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5 font-semibold">
                      Google AI Studio <ExternalLink size={9} />
                    </a>
                  </p>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={geminiDraft}
                      onChange={e => setGeminiDraft(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-white/60 dark:bg-black/30 border border-white/20 dark:border-white/10 text-xs rounded-xl px-3 py-2 pr-8 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    >
                      {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveGemini}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    Save Gemini Key
                  </button>
                </div>
              ) : provider === 'custom' ? (
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Base Endpoint URL</label>
                    <input
                      type="text"
                      value={customUrlDraft}
                      onChange={e => setCustomUrlDraft(e.target.value)}
                      placeholder="https://your-server.com or http://localhost:11434"
                      className="w-full mt-1 bg-white/60 dark:bg-black/30 border border-white/20 dark:border-white/10 text-xs rounded-xl px-3 py-2 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Model Identifier</label>
                    <input
                      type="text"
                      value={customModelDraft}
                      onChange={e => setCustomModelDraft(e.target.value)}
                      placeholder="e.g. llama3.3, mistral, gpt-4o"
                      className="w-full mt-1 bg-white/60 dark:bg-black/30 border border-white/20 dark:border-white/10 text-xs rounded-xl px-3 py-2 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Bearer Token (Optional)</label>
                    <div className="relative mt-1">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={customKeyDraft}
                        onChange={e => setCustomKeyDraft(e.target.value)}
                        placeholder="sk-... or leave blank"
                        className="w-full bg-white/60 dark:bg-black/30 border border-white/20 dark:border-white/10 text-xs rounded-xl px-3 py-2 pr-8 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveCustom}
                      className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all active:scale-[0.98]"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={handleTestConnection}
                      disabled={pingStatus?.loading}
                      className="px-3 py-2 bg-white/40 dark:bg-white/[0.08] hover:bg-white/60 dark:hover:bg-white/[0.14] text-xs font-semibold rounded-xl text-zinc-800 dark:text-zinc-200 transition-colors border border-white/10"
                    >
                      {pingStatus?.loading ? <RefreshCw size={13} className="animate-spin text-purple-400" /> : 'Ping'}
                    </button>
                  </div>

                  {pingStatus && (
                    <div className={`p-2.5 rounded-xl text-[10px] font-mono border backdrop-blur-sm ${
                      pingStatus.success
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}>
                      {pingStatus.success ? `Connected! Latency: ${pingStatus.latency}ms` : `Ping Failed: ${pingStatus.error}`}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Currently running in <strong>Scripted Mode</strong>. Select Gemini or Custom LLM above to connect real generative AI.
                </div>
              )}
            </div>
          )}

          {/* Clinical Focus Preset Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Clinical Focus Mode</span>
            </div>
            <div className="space-y-1.5">
              {CLINICAL_MODES.map(mode => {
                const Icon = mode.icon;
                const isSelected = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left backdrop-blur-md transition-all duration-200 ${
                      isSelected
                        ? `bg-gradient-to-r ${mode.bgGradient} border-white/30 dark:border-white/20 shadow-lg ${mode.borderGlow}`
                        : 'bg-white/30 dark:bg-white/[0.02] border-white/10 dark:border-white/[0.04] hover:bg-white/50 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/40 dark:bg-white/10 border border-white/20 ${mode.accentColor}`}>
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-zinc-900 dark:text-white font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {mode.label}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate">{mode.badge}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Starters for Active Mode */}
          <div className="mt-auto pt-3 border-t border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
              Quick Inquiries ({currentModeObj.label})
            </span>
            <div className="space-y-1.5">
              {currentModeObj.starters.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(starter)}
                  className="w-full text-left p-2.5 rounded-xl text-[11px] leading-snug backdrop-blur-sm bg-white/40 dark:bg-white/[0.03] border border-white/15 dark:border-white/[0.05] text-zinc-700 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-300 hover:border-blue-400/40 hover:bg-white/60 dark:hover:bg-white/[0.08] transition-all"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right / Main Area: Interactive Glassmorphic Chat Stream */}
        <div className="flex-1 flex flex-col min-w-0 backdrop-blur-md bg-white/30 dark:bg-[#080D1A]/50 relative">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar with Glow */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md mt-0.5 ${
                    isUser
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-blue-500/20'
                      : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-purple-500/25'
                  }`}>
                    {isUser ? <User size={15} /> : <Bot size={16} />}
                  </div>

                  {/* Glassmorphic Bubble */}
                  <div className={`group relative rounded-2xl p-4 shadow-sm backdrop-blur-xl border transition-all ${
                    isUser
                      ? 'bg-blue-600/90 text-white rounded-tr-sm max-w-[85%] border-blue-400/30 shadow-[0_4px_20px_rgba(37,99,235,0.25)]'
                      : msg.isError
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-200 rounded-tl-sm max-w-[92%]'
                      : 'bg-white/80 dark:bg-[#141C2E]/80 border-white/20 dark:border-white/[0.09] text-zinc-900 dark:text-zinc-100 rounded-tl-sm max-w-[92%] shadow-[0_4px_24px_rgba(0,0,0,0.15)]'
                  }`}>
                    {/* Timestamp & Role Header */}
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1.5 pb-1 border-b border-black/10 dark:border-white/10 font-mono">
                      <span>{isUser ? 'You' : 'PulseAI Assistant'}</span>
                      <span>{msg.timestamp || ''}</span>
                    </div>

                    {/* Formatted Text */}
                    <div className="space-y-1">
                      {isUser ? (
                        <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      ) : (
                        renderMarkdown(msg.text)
                      )}
                    </div>

                    {/* Copy Button (Assistant Only) */}
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-white/20 dark:border-white/10 p-1.5 rounded-lg shadow-sm text-zinc-500 hover:text-zinc-200"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator with Glass Pulse */}
            {loading && (
              <div className="flex gap-3 max-w-2xl mr-auto">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/25">
                  <Bot size={16} />
                </div>
                <div className="backdrop-blur-xl bg-white/80 dark:bg-[#141C2E]/80 border border-white/20 dark:border-white/[0.09] rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-md">
                  <RefreshCw size={14} className="text-blue-400 animate-spin" />
                  <span className="text-xs text-zinc-600 dark:text-[#94A3B8]">
                    {provider === 'gemini'
                      ? 'Deliberating with Gemini 2.0 Flash...'
                      : provider === 'custom'
                      ? `Querying ${customModel} at ${customUrl}...`
                      : 'Formulating clinical guidance...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Composer with Frosted Floating Glass Reflex */}
          <div className="p-4 md:p-5 border-t border-white/15 dark:border-white/[0.08] backdrop-blur-xl bg-white/50 dark:bg-[#0B101B]/70">
            <div className="flex items-end gap-2.5 max-w-4xl mx-auto">
              <div className="flex-1 backdrop-blur-xl bg-white/80 dark:bg-[#141C2E]/85 border border-white/30 dark:border-white/[0.12] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.1)] focus-within:ring-2 focus-within:ring-blue-500/50 p-2.5 transition-all">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask PulseAI anything (${currentModeObj.label} mode)... [Shift+Enter for newline]`}
                  className="w-full bg-transparent resize-none outline-none text-xs md:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 leading-relaxed font-sans"
                />
                <div className="flex items-center justify-between pt-1.5 border-t border-black/5 dark:border-white/[0.06] text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                    Active Focus: <strong className="text-zinc-700 dark:text-zinc-200">{currentModeObj.label}</strong>
                  </span>
                  <span className="hidden sm:inline opacity-70">Press Enter ↵ to Send</span>
                </div>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0 transition-all hover:scale-105 active:scale-95"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
