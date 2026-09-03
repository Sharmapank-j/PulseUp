import React, { useState } from 'react';
import {
  Target,
  Plus,
  MessageSquare,
  FileText,
  CheckCircle2,
  Users,
  Send,
  Sparkles,
  Paperclip
} from 'lucide-react';

export default function GoalSpacesView({ onToast }) {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban', 'chat', 'files'
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
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
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'IEC Ethics Clearance for Site 3 (CMC Vellore)', assignee: 'Dr. Marcus', status: 'todo', tag: 'Overdue', tagColor: 'rose' },
    { id: 2, title: 'Upload De-identified Echo Reports Batch B (80 patients)', assignee: 'Dr. Aarav', status: 'todo', tag: 'Due Friday', tagColor: 'amber' },
    { id: 3, title: 'ECG Waveform Annotation for Cohort A (134 tracings)', assignee: 'Dr. Priya', status: 'review', tag: 'Reviewing', tagColor: 'amber' },
    { id: 4, title: 'PRISMA-P Protocol Registration on PROSPERO', assignee: 'Dr. Vikram', status: 'done', tag: 'Done', tagColor: 'emerald' },
    { id: 5, title: 'Systematic Literature Search (PubMed & Cochrane)', assignee: 'Dr. Aarav', status: 'done', tag: 'Done', tagColor: 'emerald' },
    { id: 6, title: 'Institutional Ethics Clearance — KEM Hospital', assignee: 'Dr. Priya', status: 'done', tag: 'Done', tagColor: 'emerald' }
  ]);

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

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const reviewTasks = tasks.filter(t => t.status === 'review');
  const doneTasks = tasks.filter(t => t.status === 'done');
  const completionPct = Math.round((doneTasks.length / tasks.length) * 100);

  return (
    <div className="space-y-5">
      {/* Workbench Header */}
      <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
              Sprint Week 4 / 12
            </span>
            <span className="text-xs text-zinc-400">4 Collaborators</span>
          </div>
          <h2 className="font-display font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
            AI ECG Multi-Center Study (Clinical Research Sprint)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#94A3B8]">
            Target: JAMA Cardiology · Protocol: PRISMA-P Registered
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs font-medium">
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
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm flex flex-col h-[480px]">
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
            {messages.map(m => (
              <div key={m.id} className="flex gap-3 items-start text-xs">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                  m.isAi ? 'bg-emerald/20 text-emerald border border-emerald/30' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {m.avatar}
                </div>
                <div className={`flex-1 p-3.5 rounded-2xl max-w-xl ${
                  m.isAi ? 'bg-emerald/5 border border-emerald/20 dark:bg-emerald/10' : 'bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06]'
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

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/[0.07] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Copilot or message researchers (e.g., 'Check sample size power')..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald/40"
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
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
              De-Identified Clinical File Vault
            </h3>
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
  );
}
