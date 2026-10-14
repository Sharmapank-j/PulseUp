import { Zap, Gift, ShieldCheck, HandHeart } from 'lucide-react'
import { usePulse } from '../store/PulseStore'
import { Card, SectionTitle, Stat, timeAgo } from '../components/ui'

const EARN_RULES = [
  ['Generate a career plan', '8-point score boost + ledger entry', '+0 cr (engagement)'],
  ['Sync an opportunity into the plan', 'tracked in Medical Passport', '+5 cr'],
  ['Complete a plan milestone', 'verified by the deterministic engine', '+10…35 cr'],
  ['Advance a manuscript pipeline stage', 'checkpoint-locked', '+10 cr'],
  ['Mentor responds to your SBAR ticket', 'quality-gated', '+10 cr'],
]

const SPEND_RULES = [
  ['Open an SBAR ticket', 'structured mentorship handover', '20–50 cr'],
  ['Priority mentor routing (skip queue)', 'next-available slot', '+15 cr'],
  ['Verified portfolio audit', 'senior mentor sign-off', '25 cr'],
]

export default function Credits() {
  const { state } = usePulse()

  const earned = state.events
    .filter((e) => (e.creditDelta ?? 0) > 0)
    .reduce((a, e) => a + (e.creditDelta ?? 0), 0)
  const spent = state.events
    .filter((e) => (e.creditDelta ?? 0) < 0)
    .reduce((a, e) => a - (e.creditDelta ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Credit balance" value={state.credits} sub="auditable ledger balance" />
        <Stat label="Total earned" value={earned} sub="excluding starting grant" accent="purple" />
        <Stat label="Total spent" value={spent} sub="mentorship + verified audits" accent="amber" />
        <Stat label="Ledger entries" value={state.events.length} sub="every movement recorded" accent="blue" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="How you earn" subtitle="contribution-first credit economy — never pay-to-ask" right={<Gift size={16} className="text-pulse-500" />} />
          <ul className="space-y-2 text-sm">
            {EARN_RULES.map(([rule, why, delta]) => (
              <li key={rule} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-zinc-100 dark:hover:bg-white/5">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{rule}</div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{why}</div>
                </div>
                <span className="chip shrink-0 bg-pulse-500/10 font-mono text-pulse-600 dark:text-pulse-300">{delta}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle title="How you spend" subtitle="mentorship is escrowed and quality-rated" right={<HandHeart size={16} className="text-accent-purple" />} />
          <ul className="space-y-2 text-sm">
            {SPEND_RULES.map(([rule, why, cost]) => (
              <li key={rule} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 hover:bg-zinc-100 dark:hover:bg-white/5">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{rule}</div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{why}</div>
                </div>
                <span className="chip shrink-0 bg-accent-purple/10 font-mono text-accent-purple">{cost}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl bg-pulse-500/5 p-3 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            <ShieldCheck size={12} className="mr-1 inline text-pulse-500" />
            Baseline protection: every new account starts with a 120-credit grant, so free entry-level
            mentorship is always possible. No balance mutation happens client-side — the ledger records
            source, amount, status, and the linked activity for every entry.
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle title="Full ledger" subtitle="newest first · every entry carries a credit delta and timestamp" right={<Zap size={16} className="text-pulse-500" />} />
        {state.events.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-400 dark:border-white/10">
                  <th className="py-2 pr-3">Entry</th>
                  <th className="py-2 pr-3">Kind</th>
                  <th className="py-2 pr-3">Delta</th>
                  <th className="py-2">When</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {state.events.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-100 dark:border-white/5">
                    <td className="py-2 pr-3 font-sans">{e.text}</td>
                    <td className="py-2 pr-3 text-zinc-400">{e.kind}</td>
                    <td className={`py-2 pr-3 font-bold ${(e.creditDelta ?? 0) >= 0 ? 'text-pulse-500' : 'text-rose-500'}`}>
                      {e.creditDelta ? (e.creditDelta > 0 ? `+${e.creditDelta}` : e.creditDelta) : '—'}
                    </td>
                    <td className="py-2 text-zinc-400">{timeAgo(e.ts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
