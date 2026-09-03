import React, { useState } from 'react';
import {
  MessageSquare,
  Play,
  Pause,
  Star,
  Clock,
  Plus,
  Lock,
  Send,
  CheckCircle2,
  X
} from 'lucide-react';

export default function MentorshipView({ onToast, onAddCredits }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(15);
  const [showSbarModal, setShowSbarModal] = useState(false);
  const [sbarForm, setSbarForm] = useState({ s: '', b: '', a: '', r: '', mentor: 'Prof. Dr. Priya Ramaswamy' });

  const mentors = [
    { name: 'Prof. Dr. Priya Ramaswamy', role: 'Chief of Neurosurgery · Manipal Hospitals', rating: '4.9 ⭐', reviews: 127, sla: '48h SLA', fee: 150 },
    { name: 'Dr. Anand Mehta, DM', role: 'Cardiologist · AIIMS Delhi', rating: '4.8 ⭐', reviews: 84, sla: '72h SLA', fee: 100 },
    { name: 'Dr. Sunita Krishnan, MD', role: 'Pediatric Intensivist · KMC Manipal', rating: '4.9 ⭐', reviews: 62, sla: '48h SLA', fee: 75 },
  ];

  const handleToggleAudio = () => {
    setIsPlaying(!isPlaying);
    onToast({
      type: 'info',
      title: !isPlaying ? 'Playing Audio Memo' : 'Paused',
      message: !isPlaying ? 'Playing 1:48 clinical advice voice memo from Prof. Dr. Priya Ramaswamy.' : 'Audio memo paused.'
    });
  };

  const handleSbarSubmit = (e) => {
    e.preventDefault();
    if (!sbarForm.s.trim()) {
      onToast({ type: 'error', title: 'Missing Situation', message: 'Please enter the core Situation question.' });
      return;
    }
    setShowSbarModal(false);
    onToast({
      type: 'success',
      title: 'SBAR Ticket Dispatched',
      message: `Escrow locked (150 PC) · Query submitted to ${sbarForm.mentor} under 48h SLA.`
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Async Clinical Triage
          </span>
          <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-100 mt-1">
            Async Mentorship Triage (SBAR Structured Queries)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#94A3B8]">
            SLA-governed voice memos and ticket triage with verified Indian & international faculty.
          </p>
        </div>
        <button
          onClick={() => setShowSbarModal(true)}
          className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus size={14} />
          <span>Open SBAR Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Tickets Queue */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald" />
              <span>Active Tickets</span>
            </h3>
            <span className="text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
              1 Unread Memo
            </span>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-white/[0.02] border-l-4 border-l-amber-500 border border-zinc-200 dark:border-white/[0.06] rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Oxford Neurosurgery Fellowship SOP Review
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Prof. Dr. Priya Ramaswamy · 150 PC Escrowed
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                Responded
              </span>
            </div>

            {/* Audio Waveform Player */}
            <div className="p-3 bg-white dark:bg-[#151D2D] border border-zinc-200 dark:border-white/[0.07] rounded-xl flex items-center gap-3">
              <button
                onClick={handleToggleAudio}
                className="w-8 h-8 rounded-full bg-emerald text-navy-950 font-bold flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </button>

              <div className="flex-1 flex items-center gap-1 h-6">
                {[12, 18, 8, 22, 14, 20, 10, 16, 22, 12, 18, 6, 14, 20, 10, 16].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isPlaying ? 'bg-emerald animate-pulse' : 'bg-zinc-300 dark:bg-white/[0.2]'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              <span className="text-[11px] font-mono text-zinc-400">
                0:{audioSeconds} / 1:48
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-zinc-400">SLA Fulfilled in 31 Hours</span>
              <button
                onClick={() => onToast({ type: 'success', title: 'Feedback Submitted', message: '5-star rating submitted and 150 PC escrow released.' })}
                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald/10 text-emerald hover:bg-emerald hover:text-navy-950 rounded-lg transition-colors"
              >
                Rate & Release Escrow
              </button>
            </div>
          </div>
        </div>

        {/* Mentor Directory */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Verified Consultant Mentors
            </h3>
            <span className="text-[10px] text-zinc-400">NMC Registered</span>
          </div>

          <div className="space-y-2.5">
            {mentors.map((m, i) => (
              <div
                key={i}
                onClick={() => {
                  setSbarForm(f => ({ ...f, mentor: m.name }));
                  setShowSbarModal(true);
                }}
                className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.05] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald/40 transition-colors text-xs"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{m.name}</p>
                  <p className="text-[10.5px] text-zinc-400">{m.role}</p>
                  <div className="flex gap-2 mt-1 text-[10px]">
                    <span className="text-emerald font-semibold">{m.sla}</span>
                    <span className="text-amber-500 font-mono">{m.fee} PC Escrow</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald">{m.rating}</span>
                  <p className="text-[10px] text-zinc-400">{m.reviews} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SBAR Ticket Modal */}
      {showSbarModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.14] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.07] pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Open Clinical SBAR Ticket</h3>
                <p className="text-[11px] text-zinc-400">Recipient: {sbarForm.mentor}</p>
              </div>
              <button onClick={() => setShowSbarModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSbarSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-emerald">S — Situation (Core Query)</label>
                <input
                  type="text"
                  placeholder="e.g. Guidance needed on matching Neurosurgery fellowship in UK..."
                  value={sbarForm.s}
                  onChange={e => setSbarForm({ ...sbarForm, s: e.target.value })}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-blue-500">B — Background (Clinical/Academic)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 2nd year resident at MAMC. 2 published papers in indexed journals..."
                  value={sbarForm.b}
                  onChange={e => setSbarForm({ ...sbarForm, b: e.target.value })}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-amber-500">A — Assessment (Your Thought)</label>
                <input
                  type="text"
                  placeholder="e.g. Considering applying for GMC sponsored route or MRCS Part B..."
                  value={sbarForm.a}
                  onChange={e => setSbarForm({ ...sbarForm, a: e.target.value })}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-purple-500">R — Recommendation (Guidance Requested)</label>
                <input
                  type="text"
                  placeholder="e.g. Please critique my SOP draft and suggest 2 UK hospitals..."
                  value={sbarForm.r}
                  onChange={e => setSbarForm({ ...sbarForm, r: e.target.value })}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowSbarModal(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold rounded-lg shadow-sm"
                >
                  Lock Escrow & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
