import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  MessageSquare,
  FileText,
  CheckCircle2,
  Users,
  Send,
  Sparkles,
  Paperclip,
  ArrowLeft,
  X,
  Clock,
  BookOpen,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function GoalSpacesView({ onToast }) {
  const [selectedSpaceId, setSelectedSpaceId] = useState('ai_ecg'); // null or space ID
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'chat', 'files'
  const [chatInput, setChatInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Available Goal Spaces
  const [spaces, setSpaces] = useState([
    {
      id: 'ai_ecg',
      title: 'AI ECG Multi-Center Study',
      category: 'Clinical AI Research',
      icon: '🫀',
      status: 'Active Sprint',
      statusColor: 'emerald',
      sprintText: 'Week 4 / 12 · Target: JAMA Cardiology',
      members: ['VN', 'AS', 'PV', 'MV'],
      membersText: '4 researchers'
    },
    {
      id: 'neet_pg',
      title: 'NEET PG High-Yield 2027',
      category: 'PG Exam Preparation',
      icon: '📚',
      status: 'On Track',
      statusColor: 'emerald',
      sprintText: 'Daily 20 spotters · Saturday Grand Viva Review',
      members: ['RK', 'SA', 'PM'],
      membersText: '+39 peers'
    },
    {
      id: 'usmle_step2',
      title: 'USMLE Step 2 CK Match 2027',
      category: 'US Residency Pathway',
      icon: '🧬',
      status: 'Gated Circle',
      statusColor: 'blue',
      sprintText: 'Verified Step 1 pass required · UWorld QBank blocks',
      members: ['AK', 'AS', 'DR'],
      membersText: '86 members'
    },
    {
      id: 'icmr_sts',
      title: 'ICMR-STS Protocol Drafting Hub',
      category: 'Research Grant Sprint',
      icon: '🔬',
      status: 'Protocol Ready',
      statusColor: 'purple',
      sprintText: 'Standardized STS submission templates & sample size calculations',
      members: ['MR', 'AS'],
      membersText: '12 teams'
    },
    {
      id: 'laparo_club',
      title: 'Laparoscopic Surgery Simulation Club',
      category: 'Surgical Skills',
      icon: '✂️',
      status: 'Simulation Active',
      statusColor: 'amber',
      sprintText: 'Peg transfer & intracorporeal knot-tying timed trials',
      members: ['DrS', 'DrV'],
      membersText: '18 residents'
    },
    {
      id: 'journal_club',
      title: 'Internal Medicine Evidence Journal Club',
      category: 'EBM Rounds',
      icon: '📖',
      status: 'Bi-Weekly',
      statusColor: 'emerald',
      sprintText: 'Critical appraisal of NEJM & Lancet randomized trials',
      members: ['MAMC', 'KEM'],
      membersText: '54 doctors'
    }
  ]);

  const [newSpaceForm, setNewSpaceForm] = useState({
    title: '',
    category: 'Clinical Research',
    sprintText: ''
  });

  const defaultMessages = [
    {
      id: 1,
      sender: 'Dr. Vikram Nair (PI)',
      role: 'Lead',
      avatar: 'VN',
      text: 'Data curation for Cohort A is verified. @Aarav please confirm Batch B de-identification through the DICOM PHI scrubber before Thursday.',
      time: 'Today, 3:42 PM',
      isAi: false,
    },
    {
      id: 2,
      sender: 'Dr. Aarav Sharma (Resident)',
      role: 'You',
      avatar: 'AS',
      text: 'Ran DICOM tag de-identifier on 80 scans. Zero hospital MRNs or patient identifiers remain. Uploading to Vault now.',
      time: 'Today, 4:10 PM',
      isAi: false,
    },
    {
      id: 3,
      sender: 'PulseUp Research Copilot',
      role: 'AI Verification Engine',
      avatar: 'AI',
      text: '✅ Automated Protocol Check: Batch B sample size (N=80) achieves 88.4% statistical power for detecting sensitivity delta >= 5% at alpha=0.05. STROBE checklist guidelines verified.',
      time: 'Today, 4:12 PM',
      isAi: true,
    }
  ];

  const defaultTasks = [
    { id: 1, title: 'IEC Ethics Clearance for Site 3 (CMC Vellore)', assignee: 'Dr. Marcus', status: 'todo', tag: 'Overdue', tagColor: 'rose' },
    { id: 2, title: 'Upload De-identified Echo Reports Batch B (80 patients)', assignee: 'Dr. Aarav', status: 'todo', tag: 'Due Friday', tagColor: 'amber' },
    { id: 3, title: 'ECG Waveform Annotation for Cohort A (134 tracings)', assignee: 'Dr. Priya', status: 'review', tag: 'Reviewing', tagColor: 'amber' },
    { id: 4, title: 'PRISMA-P Protocol Registration on PROSPERO', assignee: 'Dr. Vikram', status: 'done', tag: 'Done', tagColor: 'emerald' },
    { id: 5, title: 'Systematic Literature Search (PubMed & Cochrane)', assignee: 'Dr. Aarav', status: 'done', tag: 'Done', tagColor: 'emerald' },
    { id: 6, title: 'Institutional Ethics Clearance — KEM Hospital', assignee: 'Dr. Priya', status: 'done', tag: 'Done', tagColor: 'emerald' }
  ];

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseup_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return defaultMessages;
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseup_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return defaultTasks;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pulseup_tasks', JSON.stringify(tasks));
    } catch (e) { console.error(e); }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('pulseup_messages', JSON.stringify(messages));
    } catch (e) { console.error(e); }
  }, [messages]);

  const moveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    onToast({
      type: 'info',
      title: 'Task Transitioned',
      message: `Task moved to ${newStatus === 'done' ? 'Completed' : newStatus === 'review' ? 'In Review' : 'To Do'}.`
    });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = {
      id: Date.now(),
      sender: 'Dr. Aarav Sharma (Resident)',
      role: 'You',
      avatar: 'AS',
      text: chatInput.trim(),
      time: 'Just now',
      isAi: false,
    };
    setMessages(prev => [...prev, userMsg]);
    const promptText = chatInput;
    setChatInput('');

    // AI Copilot response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'PulseUp Research Copilot',
        role: 'AI Verification Engine',
        avatar: 'AI',
        text: `Synthesizing clinical query: "${promptText.substring(0, 45)}...". Under STROBE Statement recommendations, ensure 95% confidence intervals are reported for all hazard ratios. Data extraction forms in the Vault are updated.`,
        time: 'Just now',
        isAi: true,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 600);
  };

  const handleCreateSpace = (e) => {
    e.preventDefault();
    if (!newSpaceForm.title.trim()) return;

    const newSpace = {
      id: 'space_' + Date.now(),
      title: newSpaceForm.title.trim(),
      category: newSpaceForm.category,
      icon: '🎯',
      status: 'Active',
      statusColor: 'emerald',
      sprintText: newSpaceForm.sprintText.trim() || 'New clinical goal space initialized',
      members: ['AS'],
      membersText: '1 member'
    };

    setSpaces(prev => [newSpace, ...prev]);
    setSelectedSpaceId(newSpace.id);
    setShowCreateModal(false);
    setNewSpaceForm({ title: '', category: 'Clinical Research', sprintText: '' });
    onToast({
      type: 'success',
      title: 'Goal Space Created',
      message: `"${newSpace.title}" workbench is ready for sprint collaboration.`
    });
  };

  const currentSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const reviewTasks = tasks.filter(t => t.status === 'review');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const completionPct = Math.round((doneTasks.length / tasks.length) * 100);

  return (
    <div className="space-y-5">
      {/* Top Banner & Space Switcher */}
      <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
              Goal Spaces Hub
            </span>
            <span className="text-xs text-zinc-400">6 Active Collaborative Sprints</span>
          </div>
          <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-100">
            Goal Spaces & Sprint Acceleration
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#94A3B8]">
            Multi-center collaborative hubs for clinical registries, exam groups, and ICMR grants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} />
            <span>Create Goal Space</span>
          </button>
        </div>
      </div>

      {/* 6 Goal Space Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {spaces.map((sp) => {
          const isSelected = selectedSpaceId === sp.id;
          return (
            <div
              key={sp.id}
              onClick={() => {
                setSelectedSpaceId(sp.id);
                onToast({
                  type: 'info',
                  title: 'Switched Space',
                  message: `Now viewing "${sp.title}" workbench.`
                });
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald/5 dark:bg-emerald/10 border-emerald ring-1 ring-emerald'
                  : 'bg-white dark:bg-[#1A2235] border-zinc-200 dark:border-white/[0.07] hover:border-emerald/40 hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-2xl">{sp.icon}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    sp.statusColor === 'emerald'
                      ? 'bg-emerald/10 text-emerald'
                      : sp.statusColor === 'blue'
                      ? 'bg-blue-500/10 text-blue-400'
                      : sp.statusColor === 'purple'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {sp.status}
                  </span>
                </div>
                <h4 className="font-display font-bold text-xs text-zinc-900 dark:text-zinc-100 mb-1">
                  {sp.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] leading-relaxed line-clamp-2">
                  {sp.sprintText}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-100 dark:border-white/[0.05] text-[10px] text-zinc-400">
                <span>{sp.membersText}</span>
                <span className="text-emerald font-semibold flex items-center gap-0.5">
                  <span>{isSelected ? 'Active Workbench' : 'Open Space'}</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Workbench Section */}
      <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-2xl p-5 shadow-sm space-y-4">
        {/* Active Space Workbench Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{currentSpace.icon}</span>
              <span className="text-xs font-mono font-bold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
                {currentSpace.category}
              </span>
              <span className="text-xs text-zinc-400">{currentSpace.membersText}</span>
            </div>
            <h3 className="font-display font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
              {currentSpace.title} (Sprint Workbench)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#94A3B8]">
              {currentSpace.sprintText}
            </p>
          </div>

          {/* Tab Toggle Buttons */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-medium flex-shrink-0">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'kanban'
                  ? 'bg-white dark:bg-[#151D2D] text-emerald font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-[#94A3B8] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Kanban Board ({completionPct}%)
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-[#151D2D] text-emerald font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-[#94A3B8] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Discussion & Copilot
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'files'
                  ? 'bg-white dark:bg-[#151D2D] text-emerald font-semibold shadow-sm'
                  : 'text-zinc-600 dark:text-[#94A3B8] hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              File Vault (3)
            </button>
          </div>
        </div>

        {/* TAB 1: KANBAN BOARD */}
        {activeTab === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* To Do Column */}
            <div className="bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-4 flex flex-col min-h-[360px]">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <span>To Do</span>
                <span className="font-mono bg-zinc-200 dark:bg-white/[0.08] px-1.5 py-0.5 rounded text-[10px]">
                  {todoTasks.length}
                </span>
              </div>
              <div className="space-y-2.5 flex-1">
                {todoTasks.map(t => (
                  <div
                    key={t.id}
                    className="p-3 bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.08] rounded-xl shadow-sm hover:border-blue-400/40 transition-all text-xs"
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-white/[0.05] text-[10px] text-zinc-400">
                      <span className="font-mono">{t.assignee}</span>
                      <span className="text-amber-500 font-semibold">{t.tag}</span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => moveTask(t.id, 'review')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-100 dark:bg-white/[0.06] hover:bg-emerald/10 hover:text-emerald rounded transition-colors"
                      >
                        Move to Review →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Review Column */}
            <div className="bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-4 flex flex-col min-h-[360px]">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <span>In Review</span>
                <span className="font-mono bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">
                  {reviewTasks.length}
                </span>
              </div>
              <div className="space-y-2.5 flex-1">
                {reviewTasks.map(t => (
                  <div
                    key={t.id}
                    className="p-3 bg-white dark:bg-[#1A2235] border border-amber-500/30 rounded-xl shadow-sm text-xs"
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-white/[0.05] text-[10px] text-zinc-400">
                      <span className="font-mono">{t.assignee}</span>
                      <span className="text-amber-500 font-semibold">{t.tag}</span>
                    </div>
                    <div className="mt-2 flex justify-between gap-1">
                      <button
                        onClick={() => moveTask(t.id, 'todo')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-zinc-100 dark:bg-white/[0.06] rounded"
                      >
                        ← Return
                      </button>
                      <button
                        onClick={() => moveTask(t.id, 'done')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-emerald/10 text-emerald rounded"
                      >
                        Mark Done ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-4 flex flex-col min-h-[360px]">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-emerald uppercase tracking-wider">
                <span>Completed</span>
                <span className="font-mono bg-emerald/10 px-1.5 py-0.5 rounded text-[10px]">
                  {doneTasks.length}
                </span>
              </div>
              <div className="space-y-2.5 flex-1 opacity-80">
                {doneTasks.map(t => (
                  <div
                    key={t.id}
                    className="p-3 bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.05] rounded-xl shadow-sm text-xs"
                  >
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">{t.title}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-white/[0.05] text-[10px] text-zinc-400">
                      <span className="font-mono">{t.assignee}</span>
                      <span className="text-emerald font-semibold">✓ Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAT & COPILOT */}
        {activeTab === 'chat' && (
          <div className="bg-zinc-50/50 dark:bg-black/20 border border-zinc-200 dark:border-white/[0.06] rounded-xl p-4 flex flex-col h-[480px]">
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
              {messages.map(m => (
                <div key={m.id} className="flex gap-3 items-start text-xs">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    m.isAi ? 'bg-emerald/20 text-emerald border border-emerald/30' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {m.avatar}
                  </div>
                  <div className={`flex-1 p-3.5 rounded-2xl max-w-xl ${
                    m.isAi ? 'bg-emerald/5 border border-emerald/20 dark:bg-emerald/10' : 'bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.06]'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{m.sender}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{m.time}</span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/[0.07] flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Copilot or message team (e.g., 'Check sample size power')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>Send</span>
                <Send size={13} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FILE VAULT */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                De-Identified Clinical File Vault
              </h4>
              <span className="text-[10px] text-emerald font-semibold bg-emerald/10 px-2 py-0.5 rounded">
                Zero PHI Verified
              </span>
            </div>

            <div
              onClick={() => onToast({ type: 'success', title: 'File Downloaded', message: 'DeIdentified_Stroke_Cohort_A.csv (250 Records, SHA-256 Verified).' })}
              className="p-3.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.05] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald/40 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-emerald" />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">DeIdentified_Stroke_Cohort_A.csv</p>
                  <p className="text-[10px] text-zinc-400">250 patient records · Cryptographically scrubbed · 4.8 MB</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-emerald/10 text-emerald px-2 py-0.5 rounded">
                Download
              </span>
            </div>

            <div
              onClick={() => onToast({ type: 'info', title: 'Opening Document', message: 'Protocol_Draft_v5.docx with STROBE Checklist opened in viewer.' })}
              className="p-3.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.05] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald/40 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-500" />
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Protocol_Draft_v5.docx</p>
                  <p className="text-[10px] text-zinc-400">Includes STROBE checklist & PRISMA flow chart · 4 active reviewers</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">
                Review
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Create Goal Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.14] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/[0.07] pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Create New Goal Space</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Goal Space Title</label>
                <input
                  type="text"
                  placeholder="e.g. Multi-Center Stroke Registry Cohort 2..."
                  value={newSpaceForm.title}
                  onChange={e => setNewSpaceForm({ ...newSpaceForm, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Category</label>
                <select
                  value={newSpaceForm.category}
                  onChange={e => setNewSpaceForm({ ...newSpaceForm, category: e.target.value })}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                >
                  <option value="Clinical AI Research">Clinical AI Research</option>
                  <option value="PG Exam Preparation">PG Exam Preparation</option>
                  <option value="US Residency Pathway">US Residency Pathway</option>
                  <option value="Research Grant Sprint">Research Grant Sprint</option>
                  <option value="Surgical Skills">Surgical Skills</option>
                  <option value="EBM Rounds">EBM Rounds</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Sprint Objective & Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. 8-week target for ICMR STS submission..."
                  value={newSpaceForm.sprintText}
                  onChange={e => setNewSpaceForm({ ...newSpaceForm, sprintText: e.target.value })}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold rounded-lg shadow-sm"
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
