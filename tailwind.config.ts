import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        sidebar: 'rgb(var(--sidebar) / <alpha-value>)',
        sidebarForeground: 'rgb(var(--sidebar-foreground) / <alpha-value>)',
        sidebarMuted: 'rgb(var(--sidebar-muted) / <alpha-value>)',
        sidebarActive: 'rgb(var(--sidebar-active) / <alpha-value>)',
      },
    },
  },
  plugins: [],
} satisfies Config
