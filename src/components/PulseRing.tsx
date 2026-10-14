export function PulseRing({ value, max = 100, size = 180 }: { value: number; max?: number; size?: number }) {
  const pct = Math.min(1, value / max)
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-pulse-400/20 via-pulse-500/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-pulse-500 animate-pulse-ring" />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} className="stroke-zinc-200 dark:stroke-white/10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="stroke-pulse-500 transition-all duration-1000 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-4xl font-bold bg-gradient-to-br from-pulse-300 via-pulse-500 to-pulse-600 bg-clip-text text-transparent">{value}</div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Career Score</div>
      </div>
    </div>
  )
}
