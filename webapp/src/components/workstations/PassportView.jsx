import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Award,
  Clock,
  Printer,
  Plus,
  FileText,
  X
} from 'lucide-react';

export default function PassportView({ onToast, credits }) {
  const [procedures, setProcedures] = useState([
    { name: 'Venipuncture & Central IV Line (IJV)', count: '140+', type: 'Independent', verified: true },
    { name: 'Lumbar Puncture (Diagnostic & Therapeutic)', count: '24', type: 'Independent', verified: true },
    { name: 'Endotracheal Intubation (ICU / Trauma)', count: '32', type: 'Supervised', verified: true },
    { name: 'Thoracocentesis / Pleural Fluid Tap', count: '14', type: 'Supervised', verified: true },
    { name: 'Bedside Point-of-Care Ultrasound (POCUS)', count: '45', type: 'Logged', verified: true },
  ]);

  const [showLogModal, setShowLogModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [newProcName, setNewProcName] = useState('');
  const [newProcRole, setNewProcRole] = useState('Independent');

  const handleAddProcedure = (e) => {
    e.preventDefault();
    if (!newProcName.trim()) return;
    setProcedures(prev => [{ name: newProcName.trim(), count: '1', type: newProcRole, verified: true }, ...prev]);
    setShowLogModal(false);
    setNewProcName('');
    onToast({
      type: 'success',
      title: 'Procedure Logged',
      message: `Registered "${newProcName}" under supervisor Dr. S. K. Rao (DMC/R/08214).`
    });
  };

  return (
    <div className="space-y-5">
      {/* Profile Hero Header */}
      <div className="bg-gradient-to-br from-blue-500/10 via-emerald/5 to-transparent border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center flex-shrink-0 border-2 border-emerald shadow-lg">
            AS
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-100">
              Dr. Aarav Sharma, MBBS
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#94A3B8] mt-0.5">
              Senior Resident (JR-2) · Department of Internal Medicine · Maulana Azad Medical College (MAMC), New Delhi
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-mono font-semibold bg-emerald/10 text-emerald border border-emerald/20 px-2 py-0.5 rounded-full">
                ✓ NMC: DMC/R/142981
              </span>
              <span className="text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                ✓ ABDM: aarav.sharma@hpid.abdm
              </span>
              <span className="text-[10px] font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                DigiLocker Synced
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-4 border-r border-zinc-200 dark:border-white/[0.08]">
            <p className="font-mono font-extrabold text-2xl text-emerald">785</p>
            <p className="text-[10px] text-zinc-400">Career Score</p>
          </div>
          <div className="text-center px-4">
            <p className="font-mono font-extrabold text-2xl text-amber-500">{credits}</p>
            <p className="text-[10px] text-zinc-400">Pulse Credits</p>
          </div>
          <button
            onClick={() => setShowCvModal(true)}
            className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer size={14} />
            <span>Export Verified CV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 3-Node Timeline */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock size={16} className="text-emerald" />
            <span>Verified Career Timeline (3 Milestones)</span>
          </h3>

          <div className="space-y-4 text-xs border-l-2 border-emerald/30 pl-4 ml-2">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald" />
              <p className="font-bold text-zinc-900 dark:text-zinc-100">Postgraduate Residency (MD Internal Medicine)</p>
              <p className="text-zinc-500 dark:text-[#94A3B8]">MAMC & Lok Nayak Hospital, New Delhi</p>
              <span className="text-[10px] font-mono text-emerald font-semibold">2026 – Present · DMC Verified</span>
            </div>

            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald" />
              <p className="font-bold text-zinc-900 dark:text-zinc-100">Compulsory Rotatory Residential Internship (CRRI)</p>
              <p className="text-zinc-500 dark:text-[#94A3B8]">Lok Nayak Hospital & GB Pant Institute · 12 Rotations</p>
              <span className="text-[10px] font-mono text-blue-400 font-semibold">2025 – 2026 · DigiLocker Verified</span>
            </div>

            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-400" />
              <p className="font-bold text-zinc-900 dark:text-zinc-100">MBBS with Distinction — MAMC Delhi</p>
              <p className="text-zinc-500 dark:text-[#94A3B8]">Gold Medal Pharmacology · 3x ICMR-STS Grantee</p>
              <span className="text-[10px] font-mono text-zinc-400 font-semibold">2020 – 2025 · DigiLocker Verified</span>
            </div>
          </div>
        </div>

        {/* Procedure Logbook */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              <span>NMC Procedure Logbook ({procedures.length} Entries)</span>
            </h3>
            <button
              onClick={() => setShowLogModal(true)}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald/10 text-emerald hover:bg-emerald hover:text-navy-950 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus size={13} />
              <span>Log Procedure</span>
            </button>
          </div>

          <div className="space-y-2">
            {procedures.map((p, i) => (
              <div
                key={i}
                className="p-2.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.05] rounded-lg flex items-center justify-between text-xs"
              >
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{p.name}</span>
                <span className="font-mono text-[10px] font-semibold bg-emerald/10 text-emerald px-2 py-0.5 rounded-full">
                  {p.count} · {p.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Procedure Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.14] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/[0.07] pb-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Log Clinical Procedure</h3>
              <button onClick={() => setShowLogModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProcedure} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Procedure Title</label>
                <input
                  type="text"
                  placeholder="e.g. Arterial Cannulation, Ascitic Tap..."
                  value={newProcName}
                  onChange={e => setNewProcName(e.target.value)}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Supervision Level</label>
                <select
                  value={newProcRole}
                  onChange={e => setNewProcRole(e.target.value)}
                  className="w-full mt-1 p-2 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] rounded-lg text-xs"
                >
                  <option value="Independent">Independent</option>
                  <option value="Supervised">Supervised</option>
                  <option value="Observed">Observed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald hover:bg-emerald-dark text-navy-950 font-bold rounded-lg shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CV Preview Modal */}
      {showCvModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-zinc-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-zinc-900">Official Verified Medical CV</h3>
                <p className="text-[10px] text-emerald-700 font-mono">ERAS & NMC Format · SHA-256 Verified</p>
              </div>
              <button onClick={() => setShowCvModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-extrabold text-sm text-zinc-900">DR. AARAV SHARMA, MBBS</h4>
                <p className="text-zinc-600">Junior Resident, MD Internal Medicine · MAMC New Delhi</p>
                <p className="text-[10px] text-zinc-500 font-mono">NMC Reg: DMC/R/142981 · ABDM ID: aarav.sharma@hpid.abdm</p>
              </div>

              <div>
                <h5 className="font-bold text-[11px] uppercase tracking-wider text-zinc-400 border-b pb-1">Residency & Training</h5>
                <p className="mt-1 font-semibold text-zinc-800">MD Internal Medicine (2026–Present)</p>
                <p className="text-zinc-600">Maulana Azad Medical College & Lok Nayak Hospital, New Delhi</p>
              </div>

              <div>
                <h5 className="font-bold text-[11px] uppercase tracking-wider text-zinc-400 border-b pb-1">Research & Publications</h5>
                <p className="mt-1 text-zinc-800">• Co-Investigator: Multi-Center Stroke Thrombolysis Registry (NIMHANS/MAMC)</p>
                <p className="text-zinc-800">• 3x ICMR Short-Term Studentship (STS) Awardee</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setShowCvModal(false)}
                className="px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Printer size={13} />
                <span>Print Dossier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
