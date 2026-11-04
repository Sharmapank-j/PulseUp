import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function KpiCard({ title, value, subtext, trend, trendValue, icon: Icon, color = 'emerald' }) {
  const isPositive = trend === 'up';

  const colorVariants = {
    emerald: {
      bar: 'bg-emerald-500',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      glow: 'group-hover:border-emerald-500/40',
      value: 'group-hover:text-emerald-500',
    },
    blue: {
      bar: 'bg-blue-500',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      glow: 'group-hover:border-blue-500/40',
      value: 'group-hover:text-blue-500',
    },
    purple: {
      bar: 'bg-purple-500',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      glow: 'group-hover:border-purple-500/40',
      value: 'group-hover:text-purple-500',
    },
    amber: {
      bar: 'bg-amber-500',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      glow: 'group-hover:border-amber-500/40',
      value: 'group-hover:text-amber-500',
    },
  };

  const scheme = colorVariants[color] || colorVariants.emerald;

  return (
    <div className={`group relative bg-white/90 dark:bg-[#111A2E]/90 border border-zinc-200/90 dark:border-white/[0.08] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)] overflow-hidden ${scheme.glow}`}>
      {/* Top Accent Stripe */}
      <div className={`absolute top-0 inset-x-0 h-1 ${scheme.bar} opacity-90 group-hover:h-1.5 transition-all`} />

      {/* Subtle diagnostic watermark */}
      <div className="absolute -bottom-6 -right-6 w-20 h-20 opacity-5 pointer-events-none text-current">
        {Icon && <Icon size={80} />}
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 font-sans tracking-tight">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${scheme.iconBg}`}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className={`text-2xl font-black font-mono tracking-tight text-zinc-900 dark:text-white transition-colors ${scheme.value}`}>
          {value}
        </span>
        {trendValue && (
          <span
            className={`inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
            }`}
          >
            {isPositive ? <ArrowUpRight size={11} className="mr-0.5" /> : <ArrowDownRight size={11} className="mr-0.5" />}
            {trendValue}
          </span>
        )}
      </div>

      {subtext && (
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-emerald-500 transition-colors" />
          <span>{subtext}</span>
        </p>
      )}
    </div>
  );
}
