export function PulseRing({ value, max = 100, size = 180 }: { value: number; max?: number; size?: number }) {
  const pct = Math.min(1, value / max)
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* pulse echo rings */}
      <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-pulse-500 animate-pulse-ring" />
      <div
        className="pointer-events-none absolute inset-0 rounded-full border border-pulse-500/40 animate-pulse-ring"
        style={{ animationDelay: '0.9s' }}
      />
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
          className="stroke-pulse-500 transition-all duration-1000 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-4xl font-bold text-pulse-500">{value}</div>
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
