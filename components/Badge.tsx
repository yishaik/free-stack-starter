import { type ReactNode } from 'react'

// A small, accessible status/label badge that matches the app's dark design tokens.
// Color is driven by `variant` and text by `children`, so it updates dynamically.
// Set `live` for a status that changes at runtime (adds an aria-live region so
// screen readers announce updates); leave it off for a static label.

export type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'border-line bg-panel text-muted',
  accent: 'border-accent/40 bg-accent/10 text-accent',
  success: 'border-green-500/40 bg-green-500/10 text-green-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  danger: 'border-red-500/40 bg-red-500/10 text-red-300',
}

export function Badge({
  children,
  variant = 'default',
  dot = false,
  live = false,
  className = '',
}: {
  children: ReactNode
  variant?: BadgeVariant
  dot?: boolean
  live?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${VARIANTS[variant]} ${className}`}
      {...(live ? { role: 'status', 'aria-live': 'polite' } : {})}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}
