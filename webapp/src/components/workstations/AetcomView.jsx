import React, { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  Play,
  FileCheck,
  AlertCircle,
  X
} from 'lucide-react';

export default function AetcomView({ onToast, onAddCredits }) {
  const [activeSim, setActiveSim] = useState(null);
  const [simStep, setSimStep] = useState(0);

  const simData = {
    title: 'SPIKES Protocol: Breaking Bad News',
    desc: '35-year-old patient with inoperable Glioblastoma Multiforme. Family waiting in Consultation Room 4.',
    stages: [
      {
        step: 'Setting (S)',
        question: 'How do you arrange the consultation environment for the family?',
        options: [
          { text: 'A. Deliver news in the corridor while monitoring ward vitals.', correct: false, score: 20, fb: 'Breaches privacy and psychological safety.' },
          { text: 'B. Private room, seated for all, turn off pager sound, tissues ready.', correct: true, score: 100, fb: 'Exemplary Setting. Follows SPIKES guidelines.' },
          { text: 'C. Ask the nurse to inform the family first.', correct: false, score: 30, fb: 'Abdicates primary clinical responsibility.' }
        ]
      },
      {
        step: 'Perception (P) & Empathy (E)',
        question: 'The mother begins weeping after hearing the MRI findings. What is your response?',
        options: [
          { text: 'A. "Please do not cry, medicine has many chemotherapy options."', correct: false, score: 40, fb: 'Premature reassurance invalidates acute bereavement.' },
          { text: 'B. Empathetic silence, hand tissues, say: "I see how heartbreaking this news is."', correct: true, score: 100, fb: 'NURSE Empathy Protocol in action.' },
          { text: 'C. Step out to let them cry alone.', correct: false, score: 35, fb: 'Perceived as abandonment by distressed relatives.' }
        ]
      }
    ]
  };

  const handleRunSim = () => {
    setActiveSim(simData);
    setSimStep(0);
  };

  const handleSimChoice = (opt) => {
    if (opt.correct) {
      onToast({ type: 'success', title: 'Exemplary Communication', message: `${opt.fb} (+50 Pulse Credits)` });
      onAddCredits(50);
    } else {
      onToast({ type: 'error', title: 'Communication Flaw', message: opt.fb });
    }

    if (simStep + 1 < simData.stages.length) {
      setSimStep(s => s + 1);
    } else {
      setActiveSim(null);
      onToast({ type: 'success', title: 'AETCOM Simulation Completed', message: 'Evaluation: 95% Empathy Score. Entry recorded in CBME Reflective Journal.' });
    }
  };

  return (
    <div className="space-y-5">
      {/* CBME Progress Banner */}
      <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded-full">
            NMC CBME Competency Ledger
          </span>
          <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-100 mt-1">
            AETCOM: Attitude, Ethics & Communication
          </h2>
          <p className="text-xs text-zinc-500 dark:text-[#94A3B8] mt-0.5">
            Internal Medicine Residency 2024–2027 · Maulana Azad Medical College MEU
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-3 border-r border-zinc-200 dark:border-white/[0.08]">
            <p className="font-mono font-extrabold text-2xl text-emerald">22 / 27</p>
            <p className="text-[10px] text-zinc-400">Modules Completed</p>
          </div>
          <div className="text-center px-3 border-r border-zinc-200 dark:border-white/[0.08]">
            <p className="font-mono font-extrabold text-2xl text-emerald">81.5%</p>
            <p className="text-[10px] text-zinc-400">AETCOM Score</p>
          </div>
          <button
            onClick={() => onToast({ type: 'success', title: 'NMC Dossier Exported', message: 'Generated official PDF with MEU Convener cryptographic signature.' })}
            className="px-3.5 py-2 text-xs font-semibold bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] rounded-xl text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            Export Dossier PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module Logbook */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileCheck size={16} className="text-emerald" />
              <span>NMC Module Logbook</span>
            </h3>
            <span className="text-[10px] text-zinc-400">Phase IV Active</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-emerald/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-emerald bg-emerald/10 px-2 py-1 rounded">3.1</span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Breaking Bad News — SPIKES Protocol</p>
                  <p className="text-[10px] text-zinc-400">Phase III Part 1 · Dr. S. K. Rao (Signed)</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                ✓ Signed
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-emerald/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-emerald bg-emerald/10 px-2 py-1 rounded">3.3</span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Informed Consent — CPA & MTP Guidelines</p>
                  <p className="text-[10px] text-zinc-400">Phase III Part 1 · Dr. B. Sharma (Signed)</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                ✓ Signed
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">4.1</span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">End-of-Life DNR & Passive Euthanasia</p>
                  <p className="text-[10px] text-zinc-400">Phase IV Resident · Supreme Court Doctrine</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                Awaiting MEU
              </span>
            </div>
          </div>
        </div>

        {/* AI Bedside Simulators */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-500" />
              <span>Interactive Bedside Simulators</span>
            </h3>
            <span className="text-[10px] text-blue-500 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full">
              AI Standardized Patient
            </span>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-xl space-y-3">
            <div>
              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Breaking Bad News (SPIKES)</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] mt-1 leading-relaxed">
                Room 4: Glioblastoma Multiforme case. Family is anxious. Navigate Setting, Perception, Knowledge, and Empathy without technical jargon.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-3 text-[11px] font-mono">
                <span>Score: <strong className="text-emerald">88%</strong></span>
                <span>Reward: <strong className="text-amber-500">+50 PC</strong></span>
              </div>
              <button
                onClick={handleRunSim}
                className="px-3.5 py-1.5 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Play size={12} fill="currentColor" />
                <span>Launch Simulator</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      {activeSim && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.14] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.07] pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{activeSim.title}</h3>
                <p className="text-[11px] text-emerald font-semibold">{activeSim.stages[simStep].step}</p>
              </div>
              <button onClick={() => setActiveSim(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-200 font-medium leading-relaxed">
              {activeSim.stages[simStep].question}
            </p>

            <div className="space-y-2">
              {activeSim.stages[simStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSimChoice(opt)}
                  className="w-full text-left p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] hover:border-emerald hover:bg-emerald/5 transition-all text-xs font-medium text-zinc-800 dark:text-zinc-200"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
