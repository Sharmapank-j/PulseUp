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
      <div
        className="pointer-events-none absolute inset-0 rounded-full border border-pulse-500/40 animate-pulse-ring"
        style={{ animationDelay: '0.9s' }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-full blur-xl bg-pulse-500/10" />
      <div className="absolute inset-3 rounded-full border border-white/20 dark:border-white/5 shadow-3d-sm" />
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-zinc-200 dark:stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-pulse-500 transition-all duration-1000 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="font-mono text-4xl font-bold bg-gradient-to-br from-pulse-300 via-pulse-500 to-pulse-600 bg-clip-text text-transparent">{value}</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-pulse-500/20 blur-md" />
          </div>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Career Score
        </div>
      </div>
    </div>
  )
}

export function EcgLine({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 60" className={`w-full ${className}`} fill="none" aria-hidden>
      <path
        d="M0 30 H70 L85 30 95 12 105 48 115 30 H180 L195 30 205 8 215 52 225 30 H300 L315 30 325 12 335 48 345 30 H400"
        stroke="currentColor"
        strokeWidth="2"
        className="ecg-line text-pulse-500"
      />
    </svg>
  )
}
