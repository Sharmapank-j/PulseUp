import React from 'react';
import {
  TrendingUp,
  FlaskConical,
  Award,
  Stethoscope,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import KpiCard from '../common/KpiCard';
import CareerScoreRadar from '../charts/CareerScoreRadar';
import OpportunityBarChart from '../charts/OpportunityBarChart';

export default function CareerBoardView({ onNavigate, isDarkMode, onToast }) {
  return (
    <div className="space-y-5">
      {/* Welcome Cockpit Banner */}
      <div className="bg-gradient-to-br from-emerald/10 via-blue-500/5 to-transparent border border-emerald/20 dark:border-emerald/30 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald font-semibold text-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
            <span>National Medical Residency Network Active</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">
            Good evening, Dr. Aarav Sharma
          </h2>
          <p className="text-xs text-zinc-600 dark:text-[#94A3B8] max-w-xl mt-1 leading-relaxed">
            You have <span className="text-emerald font-bold">2 active research sprint milestones</span>, <span className="text-amber-500 font-bold">1 unread mentor voice ticket</span>, and <span className="text-blue-500 font-bold">5 central Bharat opportunities</span> matched to your internal medicine profile.
          </p>
        </div>

        {/* Career Score Widget */}
        <div
          onClick={() => onToast({ type: 'info', title: 'Career Score Details', message: 'Score: 785/1000. Ranked in top 4% of Senior Residents nationally.' })}
          className="bg-white/80 dark:bg-navy-950/80 border border-emerald/30 p-4 rounded-xl text-center min-w-[170px] cursor-pointer hover:scale-105 transition-transform shadow-sm"
        >
          <div className="font-mono font-extrabold text-4xl text-emerald tracking-tight">785</div>
          <p className="text-xs font-semibold text-zinc-600 dark:text-[#94A3B8] mt-0.5">Career Score / 1000</p>
          <p className="text-[10px] font-bold text-emerald">Top 4% Senior Resident Tier</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          title="Research Index"
          value="82 / 100"
          subtext="2 multi-center papers active"
          trend="up"
          trendValue="+4.2%"
          icon={FlaskConical}
        />
        <KpiCard
          title="Clinical Competency"
          value="88 / 100"
          subtext="133 verified procedures"
          trend="up"
          trendValue="+6.1%"
          icon={Stethoscope}
        />
        <KpiCard
          title="Mentorship Standing"
          value="72 / 100"
          subtext="SLA rating 4.9 / 5.0"
          trend="up"
          trendValue="+1.8%"
          icon={Award}
        />
        <KpiCard
          title="AETCOM Bioethics"
          value="22 / 27"
          subtext="81.5% modules signed"
          trend="up"
          trendValue="On Track"
          icon={CheckCircle2}
        />
      </div>

      {/* Visualizations Grid: Radar Competency + Opportunities Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart Card */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                5-Axis Clinical Competency Radar
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">
                NMC CBME benchmarked against national resident averages
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald bg-emerald/10 px-2 py-0.5 rounded">
              Verified ✓
            </span>
          </div>
          <CareerScoreRadar isDarkMode={isDarkMode} />
        </div>

        {/* Opportunity Distribution Bar Chart */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">
                National Medical Opportunities Distribution
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">
                68 opportunities cataloged across 5 national categories
              </p>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <OpportunityBarChart isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Active Sprints & Bharat Opportunity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Research Sprints */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FlaskConical size={16} className="text-emerald" />
              <span>Active Research Sprints</span>
            </h3>
            <button
              onClick={() => onNavigate('research')}
              className="text-xs font-semibold text-emerald hover:underline"
            >
              View Hub
            </button>
          </div>

          <div
            onClick={() => onNavigate('research')}
            className="p-3.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] rounded-xl cursor-pointer hover:border-emerald/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Multi-Center Stroke Thrombolysis Registry</h4>
                <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">CRediT: Data Curation & Investigation → Target: Lancet Reg Health</p>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">
                48d left
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald h-full rounded-full" style={{ width: '85.6%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
              <span>Cohort Extracted</span>
              <span>214 / 250 (85.6%)</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('research')}
            className="p-3.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] rounded-xl cursor-pointer hover:border-emerald/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">AI ECG Arrhythmia Detection in Rural PHCs</h4>
                <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">CRediT: Writing – Original Draft → Target: JAMA Cardiology</p>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-emerald/10 text-emerald px-2 py-0.5 rounded">
                On Track
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-mono">
              <span>Validation Stage</span>
              <span>60.0% Complete</span>
            </div>
          </div>
        </div>

        {/* Bharat Opportunity Radar */}
        <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Compass size={16} className="text-blue-500" />
              <span>Bharat Opportunity Radar</span>
            </h3>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-semibold text-emerald hover:underline"
            >
              Browse 68 Opps
            </button>
          </div>

          <div
            onClick={() => onNavigate('opportunities')}
            className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald/40 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AIIMS Delhi — 45 Non-Academic JR Posts</p>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">Casualty & Trauma Surgery · 7th CPC (₹89,420/mo)</p>
            </div>
            <span className="text-[10px] font-bold text-emerald bg-emerald/10 px-2 py-1 rounded-full">
              Sep 14
            </span>
          </div>

          <div
            onClick={() => onNavigate('opportunities')}
            className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald/40 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">ICMR-STS Research Grant 2026</p>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">₹10,000/mo Stipend · Cardiology & Neuro tracks</p>
            </div>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">
              Open Now
            </span>
          </div>

          <div
            onClick={() => onNavigate('campus')}
            className="p-3 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.06] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald/40 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">AIIMS Pulse 2026 Suture Workshop</p>
              <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">Sep 15–22 · Delhi · Digital QR Delegate Pass Issued</p>
            </div>
            <span className="text-[10px] font-bold text-emerald bg-emerald/10 px-2 py-1 rounded-full">
              Booked ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
