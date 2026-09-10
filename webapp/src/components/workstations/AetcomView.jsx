import React, { useState } from 'react';
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  Play,
  FileCheck,
  AlertCircle,
  X,
  Users,
  ShieldAlert
} from 'lucide-react';

export default function AetcomView({ onToast, onAddCredits }) {
  const [activeSim, setActiveSim] = useState(null);
  const [simStep, setSimStep] = useState(0);

  const simulations = [
    {
      id: 'spikes',
      title: 'SPIKES Protocol: Breaking Bad News',
      desc: '35-year-old patient with inoperable Glioblastoma Multiforme. Family waiting in Consultation Room 4. Navigate Setting, Perception, Knowledge, and Empathy without technical jargon.',
      tag: 'Phase III Part 1',
      scoreNeeded: '88% Empathy',
      creditsReward: 50,
      icon: Stethoscope,
      stages: [
        {
          step: 'Setting (S)',
          question: 'How do you arrange the consultation environment for the family?',
          options: [
            { text: 'A. Deliver news in the busy casualty corridor while checking pending ward vitals.', correct: false, score: 20, fb: 'Breaches patient privacy, confidentiality and psychological safety.' },
            { text: 'B. Private counseling room, seated together, turn off pager/phone chime, tissues ready.', correct: true, score: 100, fb: 'Exemplary Setting. Follows SPIKES consensus guidelines.' },
            { text: 'C. Ask the nursing staff to inform the attendants before you arrive.', correct: false, score: 30, fb: 'Abdicates primary clinical and ethical responsibility.' }
          ]
        },
        {
          step: 'Perception (P) & Empathy (E)',
          question: 'The mother begins weeping inconsolably upon hearing the MRI diagnosis. What is your immediate response?',
          options: [
            { text: 'A. "Please control yourself, crying will not change the biology of the tumor."', correct: false, score: 10, fb: 'Dismissive and damaging; shuts down emotional expression.' },
            { text: 'B. Empathetic silence, offer water/tissues, say: "I see how agonizing this news is. We are here with you."', correct: true, score: 100, fb: 'NURSE Empathy Protocol in action. Validates acute grief.' },
            { text: 'C. Immediately begin listing aggressive second-line clinical trial regimens.', correct: false, score: 40, fb: 'Premature intellectualization overwhelms the family in shock.' }
          ]
        }
      ]
    },
    {
      id: 'casualty',
      title: 'Casualty Mob De-escalation & Acute Bereavement',
      desc: '24-year-old traumatic cardiac arrest refractory to 45 minutes of ACLS. Hostile crowd gathering at ER triage doors alleging medical negligence.',
      tag: 'Emergency Medicine / Medico-Legal',
      scoreNeeded: '90% Non-Violent Crisis Intervention',
      creditsReward: 60,
      icon: ShieldAlert,
      stages: [
        {
          step: 'First Contact & Triage Isolation',
          question: 'A group of 8 agitated attendants bang on the casualty glass window shouting accusations. How do you engage?',
          options: [
            { text: 'A. Shout back through the window ordering them to clear the hospital premises immediately.', correct: false, score: 10, fb: 'Escalates aggression and precipitates physical assault.' },
            { text: 'B. Step out calmly with the CMO, invite 2 primary family elders inside a secure room, acknowledge anguish.', correct: true, score: 100, fb: 'De-escalation mastery: isolates leaders, de-densifies mob, validates emotion.' },
            { text: 'C. Lock the casualty doors and refuse all communication until police forces arrive.', correct: false, score: 35, fb: 'Leaves relatives uninformed, causing rumors of body withholding.' }
          ]
        },
        {
          step: 'Communicating Resuscitation Timeline',
          question: 'The brother shouts: "You killed him! He was talking in the ambulance!" What is your explanation?',
          options: [
            { text: 'A. Hand him the CPR rhythm printout and state: "Look at the asystole tracing yourself."', correct: false, score: 30, fb: 'Defensive and technically alienating to a grieving layperson.' },
            { text: 'B. Walk him through resuscitation efforts with compassion: "We administered 6 rounds of adrenaline and shocked his heart 4 times, but his injury was fatal."', correct: true, score: 100, fb: 'Transparent disclosure of medical efforts with zero defensiveness.' },
            { text: 'C. Threaten him with a police FIR under Medical Protection Act 2008.', correct: false, score: 20, fb: 'Premature legal threats inflame the mob further.' }
          ]
        }
      ]
    },
    {
      id: 'consent',
      title: 'Emergency Laparotomy: Medico-Legal Informed Consent',
      desc: 'Unconscious polytrauma patient in hemorrhagic shock (FAST positive, grade IV splenic laceration). Next of kin unavailable on phone.',
      tag: 'CPA & Supreme Court Doctrine',
      scoreNeeded: '95% Medicolegal Precision',
      creditsReward: 50,
      icon: FileCheck,
      stages: [
        {
          step: 'Doctrine of Emergency Necessity',
          question: 'The patient requires immediate exploratory laparotomy. Attendants are 3 hours away. What is the lawful protocol?',
          options: [
            { text: 'A. Wait for attendants to reach the hospital to obtain written signature before opening abdomen.', correct: false, score: 10, fb: 'Gross clinical negligence. Patient will exsanguinate.' },
            { text: 'B. Proceed with life-saving surgery under Emergency Doctrine (Samira Kohli vs Dr. Prabha Manchanda SC rule), documented by two consultants.', correct: true, score: 100, fb: 'Flawless medicolegal compliance with Supreme Court emergency precedents.' },
            { text: 'C. Refuse surgery and transfer patient to a private trauma center.', correct: false, score: 0, fb: 'Abandonment under EMTALA/NMC ethics guidelines.' }
          ]
        }
      ]
    }
  ];

  const handleRunSim = (sim) => {
    setActiveSim(sim);
    setSimStep(0);
  };

  const handleSimChoice = (opt) => {
    if (opt.correct) {
      onToast({ type: 'success', title: 'Exemplary Communication', message: `${opt.fb} (+${activeSim.creditsReward} Pulse Credits)` });
      onAddCredits(activeSim.creditsReward);
    } else {
      onToast({ type: 'error', title: 'Communication Flaw Flagged', message: opt.fb });
    }

    if (simStep + 1 < activeSim.stages.length) {
      setSimStep(s => s + 1);
    } else {
      const finishedSim = activeSim;
      setActiveSim(null);
      onToast({
        type: 'success',
        title: 'AETCOM Simulation Completed',
        message: `Evaluation for "${finishedSim.title}" recorded in NMC CBME Reflective Logbook.`
      });
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
              <span>NMC Module Logbook (27 Competencies)</span>
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
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Informed Consent — CPA & Emergency Doctrine</p>
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

            <div className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-zinc-400 bg-zinc-100 dark:bg-white/[0.06] px-2 py-1 rounded">4.4</span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Clinical Audit & Remediation of Medical Errors</p>
                  <p className="text-[10px] text-zinc-400">Phase IV Resident · Incident Reporting</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                Queued
              </span>
            </div>
          </div>
        </div>

        {/* AI Bedside Simulators (All 3 Modules) */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-500" />
              <span>Interactive Bedside Simulators (3 Scenarios)</span>
            </h3>
            <span className="text-[10px] text-blue-500 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full">
              AI Standardized Patient
            </span>
          </div>

          <div className="space-y-3">
            {simulations.map(sim => {
              const Icon = sim.icon;
              return (
                <div
                  key={sim.id}
                  className="p-4 bg-zinc-50/70 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.07] rounded-xl space-y-2 hover:border-emerald/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald/10 text-emerald">
                        <Icon size={15} />
                      </div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{sim.title}</h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-500">+{sim.creditsReward} PC</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] leading-relaxed">
                    {sim.desc}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-zinc-400">{sim.tag}</span>
                    <button
                      onClick={() => handleRunSim(sim)}
                      className="px-3 py-1 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Play size={11} fill="currentColor" />
                      <span>Run Simulator</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      {activeSim && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.14] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.07] pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{activeSim.title}</h3>
                <p className="text-[11px] text-emerald font-semibold">
                  Stage {simStep + 1} of {activeSim.stages.length}: {activeSim.stages[simStep].step}
                </p>
              </div>
              <button onClick={() => setActiveSim(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
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
