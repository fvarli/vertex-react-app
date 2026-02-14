import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        border: '#e2e8f0',
        muted: '#64748b',
        primary: '#0f172a',
        success: '#15803d',
        danger: '#dc2626',
      },
    },
  },
  plugins: [],
} satisfies Config
