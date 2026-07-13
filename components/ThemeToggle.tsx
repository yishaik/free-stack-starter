'use client'

import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'

const ORDER: Theme[] = ['system', 'light', 'dark']

function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.dataset.theme = theme
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const stored = window.localStorage.getItem('theme') as Theme | null
    const initial = stored && ORDER.includes(stored) ? stored : 'system'
    setTheme(initial)
    applyTheme(initial)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if ((window.localStorage.getItem('theme') || 'system') === 'system') applyTheme('system')
    }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
    setTheme(next)
    window.localStorage.setItem('theme', next)
    applyTheme(next)
  }

  const icon = theme === 'dark' ? '●' : theme === 'light' ? '○' : '◐'

  return (
    <button
      type="button"
      onClick={cycle}
      className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-panel text-sm text-muted transition hover:border-accent hover:text-ink"
      title={`Theme: ${theme}. Click to switch.`}
      aria-label={`Current theme is ${theme}. Change theme.`}
    >
      {icon}
    </button>
  )
}
