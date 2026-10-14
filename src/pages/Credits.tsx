import { usePulse } from '../store/PulseStore'
import { CreditCard, TrendingUp, ArrowUpRight, ExternalLink, Receipt, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function Credits() {
  const { credits, ledger, deductCredit } = usePulse()
  const [amount, setAmount] = useState('10')

  const totalEarned = ledger
    .filter((e) => e.amount > 0)
    .reduce((s, e) => s + e.amount, 0)
  const totalSpent = ledger
    .filter((e) => e.amount < 0)
    .reduce((s, e) => s + Math.abs(e.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-ice">
          Pulse Credits
        </h1>
        <div className="flex items-center gap-2 rounded-xl bg-pulse-500/10 px-3 py-1.5 text-sm font-semibold text-pulse-600 dark:text-pulse-300">
          <CreditCard size={14} />
          <span>{crCreditsDisplay}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Balance
          </div>
          <div className="mt-1 font-mono text-3xl font-bold text-pulse-600 dark:text-pulse-300">
            {crCreditsDisplay}
          </div>
          <div className="mt-1 text-xs text-zinc-400">
            {crCreditsDisplay === '0'
              ? 'All spent'
              : crCreditsDisplay === '1'
                ? '1 credit remaining'
                : `${crCreditsDisplay} credits remaining`}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Total Earned
          </div>
          <div className="mt-1 font-mono text-3xl font-bold text-zinc-800 dark:text-ice">
            +{totalEarned}
          </div>
          <div className="mt-1 text-xs text-zinc-400">Across all activities</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Total Spent
          </div>
          <div className="mt-1 font-mono text-3xl font-bold text-zinc-800 dark:text-ice">
            -{totalSpent}
          </div>
          <div className="mt-1 text-xs text-zinc-400">Across all activities</div>
        </div>
      </div>

      {/* Earning rules */}
      <div className="card-clay p-4">
        <h2 className="mb-3 text-sm font-semibold text-clay-700 dark:text-white/80">Earning rules</h2>
        <ul className="space-y-2">
          {[
            { rule: 'Complete a skill baseline', credits: 15 },
            { rule: 'Finish a milestone', credits: 25 },
            { rule: 'Open an SBAR ticket', credits: 10 },
            { rule: 'Mentor responds to your SBAR', credits: 5 },
            { rule: 'Complete a mentor session', credits: 10 },
            { rule: 'Submit a research abstract', credits: 30 },
            { rule: 'Earn a quality review from mentor', credits: 10 },
          ].map(({ rule, credits: cr }) => (
            <li key={rule} className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
              <span>{rule}</span>
              <span className="font-mono font-semibold text-pulse-600 dark:text-pulse-300">+{cr} cr</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Spending rules */}
      <div className="card-clay p-4">
        <h2 className="mb-3 text-sm font-semibold text-clay-700 dark:text-white/80">Spending rules</h2>
        <ul className="space-y-2">
          {[
            { rule: 'Open a mentor session', credits: 20 },
            { rule: 'Submit an SBAR ticket (escrow)', credits: 15 },
            { rule: 'Unlock research database premium', credits: 25 },
            { rule: 'Priority opportunity alert', credits: 5 },
          ].map(({ rule, credits: cr }) => (
            <li key={rule} className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
              <span>{rule}</span>
              <span className="font-mono font-semibold text-rose-500">-{cr} cr</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ledger */}
      <div className="card-clay p-4">
        <h2 className="mb-3 text-sm font-semibold text-clay-700 dark:text-white/80">
          Transaction ledger
        </h2>
        {ledger.length === 0 ? (
          <p className="text-sm text-zinc-400">No transactions yet. Complete activities to earn credits.</p>
        ) : (
          <ul className="divide-y divide-zinc-200/50 dark:divide-white/5">
            {ledger.slice().reverse().map((entry) => (
              <li
                key={entry.id}
                className="py-2.5 text-sm dark:text-zinc-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {new Date(entry.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className={`font-mono font-semibold ${entry.amount > 0 ? 'text-pulse-600 dark:text-pulse-300' : 'text-rose-500'}`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-zinc-400">
                  {entry.source} — {entry.note}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
