import React, { useState } from 'react';
import {
  TrendingUp,
  FlaskConical,
  Award,
  Stethoscope,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react';
import KpiCard from '../common/KpiCard';
import CareerScoreRadar from '../charts/CareerScoreRadar';
import OpportunityBarChart from '../charts/OpportunityBarChart';

export default function CareerBoardView({ onNavigate, isDarkMode, onToast, dutyStatus = 'on_duty' }) {
  const scorePercent = 785 / 1000;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scorePercent * circumference);

  return (
    <div className="space-y-5">
      {/* ─── Integrated Clinical Command Console ─── */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-white/95 via-emerald-500/[0.04] to-blue-500/[0.04] dark:from-[#0E1526]/95 dark:via-emerald-500/[0.03] dark:to-blue-500/[0.03] border border-emerald-500/25 dark:border-emerald-500/30 p-5 sm:p-6 shadow-sm dark:shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
        {/* Subtle ambient lighting flares */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Top Clinical Context Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-mono font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>MAMC Emergency Ward 4B</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[10.5px] font-mono font-semibold">
                <ShieldCheck size={12} className="text-blue-500" />
                <span>NMC Reg #2023-DL-9841</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 text-[10px] font-mono">
                <Clock size={11} />
                <span>08:00–14:00 Morning Duty</span>
              </span>
            </div>

            {/* Doctor Greeting & Headline */}
            <div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Good evening, Dr. Aarav Sharma</span>
                <span className="text-xl">🩺</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                Senior Residency Command Cockpit • Maulana Azad Medical College, New Delhi
              </p>
            </div>

            {/* Tactical Status Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
              <button
                onClick={() => onNavigate('research')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-700 dark:text-purple-300 text-[11px] font-mono font-bold transition-all"
              >
                <FlaskConical size={12} />
                <span>2 Active Research Sprints</span>
                <ArrowRight size={10} />
              </button>

              <button
                onClick={() => onNavigate('mentorship')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-mono font-bold transition-all"
              >
                <span>1 SBAR Voice Ticket</span>
                <ArrowRight size={10} />
              </button>

              <button
                onClick={() => onNavigate('opportunities')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-700 dark:text-blue-300 text-[11px] font-mono font-bold transition-all"
              >
                <Compass size={12} />
                <span>5 Central JR Posts</span>
                <ArrowRight size={10} />
              </button>
            </div>
          </div>

          {/* Interactive Circular Career Score Gauge */}
          <div
            onClick={() => onToast({
              type: 'info',
              title: 'Career Score Telemetry (785/1000)',
              message: 'Research Index: 82 • Clinical Procedures: 88 • Mentorship: 72 • AETCOM: 81.5. Top 4% nationally among Indian Senior Residents.'
            })}
            className="flex items-center gap-4 bg-white/90 dark:bg-[#111A2E]/90 border border-emerald-500/30 rounded-2xl p-4 shadow-md cursor-pointer hover:scale-105 transition-all group flex-shrink-0"
            title="Click to view full Career Score breakdown"
          >
            {/* SVG Circular Dial */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 76 76">
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  className="text-zinc-200 dark:text-white/10"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="38"
                  cy="38"
                  r={radius}
                  className="text-emerald-500"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono font-black text-xl text-zinc-900 dark:text-white leading-none group-hover:text-emerald-500 transition-colors">
                  785
                </span>
                <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-bold mt-0.5">/1000</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Career Score
              </p>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <span>Top 4% Nationally</span>
                <TrendingUp size={12} />
              </p>
              <span className="inline-block text-[9.5px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                Phase IV Resident Tier
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ICU/Ward Diagnostic Telemetry Gauges (KPIs) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          title="Research Index"
          value="82 / 100"
          subtext="2 multi-center papers active"
          trend="up"
          trendValue="+4.2%"
          icon={FlaskConical}
          color="purple"
        />
        <KpiCard
          title="Clinical Competency"
          value="88 / 100"
          subtext="133 verified procedures logged"
          trend="up"
          trendValue="+6.1%"
          icon={Stethoscope}
          color="emerald"
        />
        <KpiCard
          title="Mentorship Standing"
          value="72 / 100"
          subtext="SLA 4.9/5.0 · SBAR Compliant"
          trend="up"
          trendValue="+1.8%"
          icon={Award}
          color="amber"
        />
        <KpiCard
          title="AETCOM Bioethics"
          value="22 / 27"
          subtext="81.5% modules signed by HOD"
          trend="up"
          trendValue="On Track"
          icon={CheckCircle2}
          color="blue"
        />
      </div>

      {/* Visualizations Grid: Radar Competency + Opportunities Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar Chart Card */}
        <div className="clinical-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display font-black text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>5-Axis Clinical Competency Radar</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                NMC CBME benchmarked against Indian national resident cohorts
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Verified ✓
            </span>
          </div>
          <CareerScoreRadar isDarkMode={isDarkMode} />
        </div>

        {/* Opportunity Distribution Bar Chart */}
        <div className="clinical-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-display font-black text-sm text-zinc-900 dark:text-white">
                National Medical Opportunities Distribution
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                68 apex opportunities cataloged across 5 national categories
              </p>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <OpportunityBarChart isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Goal Spaces Quick Dock */}
      <div className="clinical-card relative overflow-hidden bg-white/90 dark:bg-[#101726]/90 backdrop-blur-md border border-zinc-200/90 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-display font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Target size={16} className="text-emerald-500" />
              <span>Goal Spaces Collaborative Dock</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              [ACTIVE COHORTS]
            </span>
          </div>
          <button
            onClick={() => onNavigate('goalspaces')}
            className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 group"
          >
            <span>Open All 6 Spaces</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            onClick={() => onNavigate('goalspaces')}
            className="p-3.5 bg-zinc-50/90 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.07] rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.04] transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl group-hover:scale-110 transition-transform">🫀</span>
              <span className="text-[9.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Active Sprint
              </span>
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
              AI ECG Multi-Center Study
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
              Week 4 / 12 · 4 co-investigators · AIIMS + MAMC
            </p>
          </div>

          <div
            onClick={() => onNavigate('goalspaces')}
            className="p-3.5 bg-zinc-50/90 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.07] rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.04] transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl group-hover:scale-110 transition-transform">📚</span>
              <span className="text-[9.5px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                Daily 20
              </span>
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
              NEET PG High-Yield 2027
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
              Grand Viva Prep · +39 peer residents active
            </p>
          </div>

          <div
            onClick={() => onNavigate('goalspaces')}
            className="p-3.5 bg-zinc-50/90 dark:bg-white/[0.03] border border-dashed border-zinc-300 dark:border-white/15 rounded-xl cursor-pointer hover:border-emerald-500/60 hover:bg-emerald-500/[0.02] transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              <Target size={16} />
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
              Explore All Goal Spaces
            </h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              USMLE Step 1/2 · ICMR-STS · Laparo Club
            </p>
          </div>
        </div>
      </div>

      {/* Active Sprints & Bharat Opportunity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Research Sprints */}
        <div className="clinical-card relative overflow-hidden bg-white/90 dark:bg-[#101726]/90 backdrop-blur-md border border-zinc-200/90 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <h3 className="font-display font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FlaskConical size={16} className="text-purple-500" />
                <span>Active Research Sprints</span>
              </h3>
            </div>
            <button
              onClick={() => onNavigate('research')}
              className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              View Hub →
            </button>
          </div>

          <div
            onClick={() => onNavigate('research')}
            className="p-3.5 bg-zinc-50/90 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.07] rounded-xl cursor-pointer hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-purple-500 transition-colors">
                  Multi-Center Stroke Thrombolysis Registry
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  CRediT: Data Curation & Investigation → Target: Lancet Reg Health
                </p>
              </div>
              <span className="text-[9.5px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                48d left
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: '85.6%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
              <span>Cohort Extracted</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">214 / 250 (85.6%)</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('research')}
            className="p-3.5 bg-zinc-50/90 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.07] rounded-xl cursor-pointer hover:border-blue-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                  AI ECG Arrhythmia Detection in Rural PHCs
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  CRediT: Writing – Original Draft → Target: JAMA Cardiology
                </p>
              </div>
              <span className="text-[9.5px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                On Track
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full" style={{ width: '60%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
              <span>Validation Stage</span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300">60.0% Complete</span>
            </div>
          </div>
        </div>

        {/* Bharat Opportunity Radar */}
        <div className="clinical-card relative overflow-hidden bg-white/90 dark:bg-[#101726]/90 backdrop-blur-md border border-zinc-200/90 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <h3 className="font-display font-black text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Compass size={16} className="text-blue-500" />
                <span>Bharat Opportunity Radar</span>
              </h3>
            </div>
            <button
              onClick={() => onNavigate('opportunities')}
              className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse 68 Opps →
            </button>
          </div>

          <div
            onClick={() => onNavigate('opportunities')}
            className="p-3 bg-zinc-50/90 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.07] rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                AIIMS Delhi — 45 Non-Academic JR Posts
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                Casualty & Trauma Surgery · 7th CPC (₹89,420/mo)
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full flex-shrink-0">
              Sep 14
            </span>
          </div>

          <div
            onClick={() => onNavigate('opportunities')}
            className="p-3 bg-zinc-50/90 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.07] rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500/50 transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors">
                ICMR-STS Research Grant 2026
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                ₹10,000/mo Stipend · Cardiology & Neuro tracks
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full flex-shrink-0">
              Open Now
            </span>
          </div>

          <div
            onClick={() => onNavigate('campus')}
            className="p-3 bg-zinc-50/90 dark:bg-white/[0.03] border border-zinc-200/80 dark:border-white/[0.07] rounded-xl flex items-center justify-between cursor-pointer hover:border-emerald-500/50 transition-all group"
          >
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
                AIIMS Pulse 2026 Suture Workshop
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                Sep 15–22 · Delhi · Digital QR Delegate Pass Issued
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full flex-shrink-0">
              Booked ✓
            </span>
          </div>
        </div>
      </div>

      {/* AETCOM NMC Nudge Card + Daily Pulse Credits Activity Ring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AETCOM Nudge */}
        <div
          onClick={() => onNavigate('aetcom')}
          className="clinical-card relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border border-purple-500/25 rounded-2xl p-4.5 flex items-start gap-4 cursor-pointer hover:border-purple-500/50 transition-all shadow-sm group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Stethoscope size={20} className="text-purple-500 dark:text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-black text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-purple-500 transition-colors">
                AETCOM NMC Clearance Log
              </h4>
              <span className="text-[9.5px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                5 Modules Left
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2 leading-relaxed">
              22 / 27 modules signed. Complete End-of-Life DNR &amp; Clinical Audit modules to unlock your NMC Residency Completion Certificate.
            </p>
            <div className="w-full bg-zinc-200 dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: '81.5%' }} />
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
              81.5% complete · Phase IV Resident Active
            </p>
          </div>
        </div>

        {/* Daily PC Activity Ring */}
        <div className="clinical-card relative overflow-hidden bg-white/90 dark:bg-[#101726]/90 backdrop-blur-md border border-zinc-200/90 dark:border-white/10 rounded-2xl p-4.5 flex items-center gap-5 shadow-sm">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            <svg width="74" height="74" viewBox="0 0 74 74">
              <circle cx="37" cy="37" r="29" fill="none" stroke="currentColor" className="text-zinc-200 dark:text-white/10" strokeWidth="8" />
              <circle
                cx="37" cy="37" r="29" fill="none"
                stroke="#10B981" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 29 * 0.68} ${2 * Math.PI * 29 * (1 - 0.68)}`}
                strokeDashoffset={2 * Math.PI * 29 * 0.25}
                transform="rotate(-90 37 37)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400 leading-none">136</span>
              <span className="text-[9px] text-zinc-500 font-mono font-bold">PC</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-black text-xs text-zinc-900 dark:text-zinc-100">Daily Pulse Credits</h4>
              <span className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">68% TARGET</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1.5 font-mono">136 / 200 PC earned today</p>
            <div className="space-y-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
              <p>✅ Med-Q Sprint <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">+50 PC</span></p>
              <p>✅ AETCOM SPIKES Sim <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">+50 PC</span></p>
              <p>✅ Research Bounty Review <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">+36 PC</span></p>
              <p className="text-zinc-500 dark:text-zinc-400">⏳ Peer Review Slot <span className="ml-1 text-zinc-500 dark:text-zinc-400 font-medium">+64 PC pending</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
