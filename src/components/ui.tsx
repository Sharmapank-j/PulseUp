import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
  clay?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  clay = false,
  padding = 'md',
  onClick,
}: CardProps) {
  const padClass =
    padding === 'none'
      ? 'py-0 px-0'
      : padding === 'sm'
        ? 'py-2 px-3'
        : padding === 'lg'
          ? 'py-6 px-6'
          : 'p-4'

  return (
    <div
      onClick={onClick}
      className={`relative isolate rounded-2xl border border-white/10 bg-white/80 shadow-sm transition-all duration-300 dark:bg-[#151D2D]/80 dark:border-white/10 ${padClass} ${className}`}
    >
      {glass && (
        <div
          className="absolute inset-0 rounded-2xl border border-white/20 bg-white/50 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-glass-dark"
          style={{ pointerEvents: 'none' }}
        />
      )}
      {clay && (
        <div
          className="absolute inset-0 rounded-2xl border border-clay-200/60 bg-gradient-to-b from-clay-50 to-white/90 shadow-clay-lg dark:border-white/5 dark:bg-[#1c2740]/80"
          style={{ pointerEvents: 'none' }}
        />
      )}
      {hover && (
        <div
          className="absolute inset-0 rounded-2xl border border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-3d-hover"
          style={{ pointerEvents: 'none' }}
        />
      )}
      <div className={glass || clay || hover ? 'relative' : ''}>{children}</div>
    </div>
  )
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mb-3 flex items-center justify-between border-b border-zinc-200/50 dark:border-white/5 pb-2.5 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={`text-sm font-semibold tracking-tight text-zinc-800 dark:text-ice ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={`mt-1 text-xs text-zinc-500 dark:text-zinc-400 ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mt-3 flex items-center border-t border-zinc-200/50 dark:border-white/5 pt-3 ${className}`}>
      {children}
    </div>
  )
}
