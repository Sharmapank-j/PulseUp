import { Sun, Moon, Flame } from 'lucide-react'
import { usePulse } from '../store/PulseStore'

const MODES = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'night', label: 'Night call', icon: Flame },
] as const

export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = usePulse()

  return (
    <div
      role="group"
      aria-label="Theme"
      className={`inline-flex select-none items-center gap-0.5 rounded-xl border border-zinc-300 bg-zinc-100 p-0.5 dark:border-white/15 dark:bg-white/5 ${
        compact ? '' : 'w-full'
      }`}
    >
      {MODES.map(({ key, label, icon: Icon }) => {
        const active = theme === key
        return (
          <button
            key={key}
            onClick={() => setTheme(key)}
            aria-pressed={active}
            title={`${label} theme`}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2 ${
              compact ? 'py-1' : 'py-1.5 text-xs'
            } font-semibold transition ${
              active
                ? key === 'night'
                  ? 'bg-rose-900/80 text-rose-200 shadow-sm'
                  : 'bg-white text-zinc-900 shadow-sm dark:bg-white/15 dark:text-ice'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-ice'
            }`}
          >
            <Icon size={14} className={active && key === 'night' ? 'text-rose-400' : active ? 'text-pulse-500' : ''} />
            {!compact && label}
          </button>
        )
      })}
    </div>
  )
}
