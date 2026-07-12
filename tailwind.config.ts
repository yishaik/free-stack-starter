import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f17',
        panel: '#111827',
        line: '#1f2a3a',
        ink: '#e8eef7',
        muted: '#93a7c4',
        accent: '#22d3ee',
      },
    },
  },
  plugins: [],
}
export default config
