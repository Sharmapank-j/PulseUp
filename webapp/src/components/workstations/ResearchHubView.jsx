import React, { useState } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  Award,
  Search,
  Lock,
  Plus,
  AlertTriangle,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

export default function ResearchHubView({ onToast, onAddCredits }) {
  const [journalQuery, setJournalQuery] = useState('');
  const [bounties, setBounties] = useState([
    {
      id: 1,
      title: 'Kaplan-Meier Survival Analysis in R',
      desc: 'Evaluate 90-day modified Rankin Scale (mRS) outcomes in thrombolyzed patients. Deliverable: reproducible R script + high-res forest plot.',
      credits: 250,
      claimed: false,
    },
    {
      id: 2,
      title: 'Medical Line-Editing & Vancouver Citation Scrub',
      desc: 'Introduction & Discussion sections (3,200 words) requiring native English academic proofing and verification against Lancet guidelines.',
      credits: 120,
      claimed: false,
    }
  ]);

  const journals = [
    { name: 'Lancet Regional Health — Southeast Asia', if: '8.5', q: 'Scopus Q1', speed: '28d review', status: 'NMC Approved ✓', risk: 'safe' },
    { name: 'Stroke — American Heart Association', if: '7.7', q: 'MEDLINE Q1', speed: '35d review', status: 'NMC Approved ✓', risk: 'safe' },
    { name: 'International Journal of Stroke', if: '6.0', q: 'WSO Q1', speed: '21d review', status: 'NMC Approved ✓', risk: 'safe' },
    { name: 'International Journal of Emerging Medical Sciences', if: 'Fake 4.2', q: 'Not Indexed', speed: '48h instant', status: 'Predatory Alert ⚠️', risk: 'danger' },
  ];

  const filteredJournals = journals.filter(j =>
    j.name.toLowerCase().includes(journalQuery.toLowerCase())
  );

  const handleClaim = (bounty) => {
    setBounties(prev => prev.map(b => b.id === bounty.id ? { ...b, claimed: true } : b));
    onAddCredits(bounty.credits);
    onToast({
      type: 'success',
      title: 'Bounty Claimed!',
      message: `Allocated +${bounty.credits} Pulse Credits for "${bounty.title}". Milestone escrow unlocked.`
    });
  };

  return (
    <div className="space-y-5">
      {/* Active Project Card */}
      <div className="bg-gradient-to-br from-blue-500/10 via-emerald/5 to-transparent border border-blue-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Multi-Center Clinical Registry
            </span>
            <h2 className="font-display font-extrabold text-xl text-zinc-900 dark:text-zinc-100 mt-1">
              Multi-Center Stroke Thrombolysis Registry
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#94A3B8] mt-0.5">
              PI: Dr. Vikram Nair (NIMHANS) · Target: <strong className="text-emerald font-semibold">Lancet Regional Health (IF 8.5)</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-mono font-semibold bg-emerald/10 text-emerald border border-emerald/20 px-2.5 py-1 rounded-full">
              ✓ CTRI/2026/08/001234
            </span>
            <span className="text-xs font-mono font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2.5 py-1 rounded-full">
              IEC Cleared (MAMC & KEM)
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-zinc-600 dark:text-zinc-300">Sprint Delivery Completion</span>
            <span className="font-mono text-emerald">68% · 3 / 5 Milestones</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
            <div className="bg-emerald h-full rounded-full" style={{ width: '68%' }} />
          </div>
        </div>
      </div>

      {/* CRediT Authorship Matrix Table */}
      <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
              CRediT Authorship Matrix (Cryptographically Sealed)
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">
              Contributor Roles Taxonomy mapped under ICMJE guidelines with SHA-256 multi-sig lock.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToast({ type: 'info', title: 'CRediT Role Assigned', message: 'Added collaborator: Dr. Marcus Vance with Writing - Review role.' })}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.1] transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Contributor</span>
            </button>
            <button
              onClick={() => onToast({ type: 'success', title: 'Authorship Locked', message: 'Authorship order locked with SHA-256 multi-sig consensus.' })}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald/10 text-emerald border border-emerald/20 flex items-center gap-1.5"
            >
              <Lock size={13} />
              <span>Order Locked</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-[#151D2D] border-b border-zinc-200 dark:border-white/[0.07] text-[10px] uppercase font-bold text-zinc-500 dark:text-[#94A3B8]">
              <tr>
                <th className="p-3">Contributor</th>
                <th className="p-3">CRediT Roles</th>
                <th className="p-3">Milestone Progress</th>
                <th className="p-3">Rank</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
              <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="p-3">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Dr. Vikram Nair</div>
                  <div className="text-[10px] text-zinc-400">NIMHANS Bengaluru</div>
                </td>
                <td className="p-3">
                  <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">
                    Conceptualization · Supervision
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">100%</span>
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-emerald">1st (Lead)</td>
                <td className="p-3 text-right">
                  <span className="text-[10px] font-semibold bg-emerald/10 text-emerald px-2 py-0.5 rounded-full">
                    ✓ Signed
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="p-3">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Dr. Aarav Sharma</div>
                  <div className="text-[10px] text-zinc-400">MAMC New Delhi</div>
                </td>
                <td className="p-3">
                  <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                    Data Curation · Investigation
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald h-full rounded-full" style={{ width: '85.6%' }} />
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">85.6%</span>
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-blue-500">2nd</td>
                <td className="p-3 text-right">
                  <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                    In Progress
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                <td className="p-3">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Dr. Priya Verma</div>
                  <div className="text-[10px] text-zinc-400">KEM Hospital Mumbai</div>
                </td>
                <td className="p-3">
                  <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                    Formal Analysis · Software
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">45%</span>
                  </div>
                </td>
                <td className="p-3 font-mono font-bold text-zinc-400">3rd</td>
                <td className="p-3 text-right">
                  <span className="text-[10px] font-semibold bg-zinc-200 dark:bg-white/[0.08] text-zinc-500 px-2 py-0.5 rounded-full">
                    Queued
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bounties & Anti-Predatory Journal Shield */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Research Bounties */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <span>Biostatistics & Proofing Bounties</span>
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">Peer Reward Engine</span>
          </div>

          <div className="space-y-2.5">
            {bounties.map(b => (
              <div
                key={b.id}
                className="p-4 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] rounded-xl flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{b.title}</h4>
                    <span className="font-mono font-bold text-amber-500 text-xs">+{b.credits} PC</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] mt-1 leading-relaxed">{b.desc}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleClaim(b)}
                    disabled={b.claimed}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      b.claimed
                        ? 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-400 cursor-not-allowed'
                        : 'bg-emerald/10 text-emerald hover:bg-emerald hover:text-navy-950'
                    }`}
                  >
                    {b.claimed ? 'Claimed ✓' : 'Claim Bounty'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Predatory Journal Shield */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald" />
              <span>Anti-Predatory Journal Shield</span>
            </h3>
            <span className="text-[10px] text-emerald font-semibold bg-emerald/10 px-2 py-0.5 rounded-full">
              UGC-CARE Whitelist
            </span>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Check journal name or ISSN..."
              value={journalQuery}
              onChange={(e) => setJournalQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.07] rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald"
            />
          </div>

          <div className="space-y-2">
            {filteredJournals.map((j, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.05] rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{j.name}</p>
                  <p className="text-[10px] text-zinc-400">{j.q} · {j.speed}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-mono font-bold text-[11px] text-emerald bg-emerald/10 px-1.5 py-0.5 rounded">
                    IF {j.if}
                  </span>
                  <span className={`text-[9.5px] font-semibold ${j.risk === 'danger' ? 'text-rose-500' : 'text-emerald'}`}>
                    {j.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px]">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span>4 predatory publications targeting Indian thesis papers blocked this week.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
