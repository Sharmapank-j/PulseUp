import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KpiCard({ title, value, subtext, trend, trendValue, icon: Icon, color = 'emerald' }) {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.07] rounded-xl p-4 transition-all duration-200 hover:border-zinc-300 dark:hover:border-white/[0.16] hover:-translate-y-0.5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-[#94A3B8]">{title}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center text-zinc-700 dark:text-zinc-200">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-[#F1F5F9]">
          {value}
        </span>
        {trendValue && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
            }`}
          >
            {isPositive ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
            {trendValue}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8]">{subtext}</p>}
    </div>
  );
}
