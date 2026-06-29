import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NoBrainFit — charte V2.0 « Instrument System »
        // Fond d'acier, un seul accent (le Lume), zéro bruit.
        void:    '#0B0B0F',
        surface: '#101015',
        card:    '#16161B',
        'card-hi': '#1C1C22',
        border:  'rgba(255,255,255,0.07)',
        'border-hi': 'rgba(255,255,255,0.14)',
        snow:    '#F2F2F4', // White Ice
        grey1:   '#9A9AA4', // Silver
        grey2:   '#55555E', // Graphite
        // Acier — le reste vit en niveaux d'acier
        acier:    '#D8D8DE',
        titane:   '#86868F',
        graphite: '#55555E',
        // Accent unique « Lume » — blue/lime sont des alias rétro-compat
        lume:    '#C4ED4A',
        blue:    '#C4ED4A',
        lime:    '#C4ED4A',
        // Rouge fonctionnel — états destructifs / erreurs
        orange:  '#FF6B6B',
        // Semantic
        primary:   { DEFAULT: '#C4ED4A', foreground: '#0B0B0F' },
        secondary: { DEFAULT: '#1C1C22', foreground: '#F2F2F4' },
        muted:     { DEFAULT: '#16161B', foreground: '#9A9AA4' },
        accent:    { DEFAULT: '#1C1C22', foreground: '#F2F2F4' },
        destructive: { DEFAULT: '#FF6B6B', foreground: '#0B0B0F' },
        success:   { DEFAULT: '#22C55E', foreground: '#0B0B0F' },
        background: '#0B0B0F',
        foreground: '#F2F2F4',
        popover:   { DEFAULT: '#1C1C22', foreground: '#F2F2F4' },
        input:     '#1C1C22',
        ring:      '#C4ED4A',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm:  '0.25rem',
        md:  '0.5rem',
        lg:  '0.75rem',
        xl:  '1rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
}

export default config
