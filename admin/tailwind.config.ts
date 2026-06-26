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
        // NoBrainFit brand
        void:    '#08080C',
        surface: '#111115',
        card:    '#141418',
        'card-hi': '#1A1A20',
        border:  'rgba(255,255,255,0.07)',
        'border-hi': 'rgba(255,255,255,0.12)',
        snow:    '#F5F5F7',
        grey1:   '#9898A8',
        grey2:   '#56565F',
        blue:    '#3D8EFF',
        lime:    '#CCFF00',
        orange:  '#FF5C2B',
        // Semantic
        primary:   { DEFAULT: '#3D8EFF', foreground: '#08080C' },
        secondary: { DEFAULT: '#1A1A20', foreground: '#F5F5F7' },
        muted:     { DEFAULT: '#141418', foreground: '#9898A8' },
        accent:    { DEFAULT: '#1A1A20', foreground: '#F5F5F7' },
        destructive: { DEFAULT: '#FF5C2B', foreground: '#F5F5F7' },
        success:   { DEFAULT: '#22C55E', foreground: '#08080C' },
        background: '#08080C',
        foreground: '#F5F5F7',
        popover:   { DEFAULT: '#1A1A20', foreground: '#F5F5F7' },
        input:     '#1A1A20',
        ring:      '#3D8EFF',
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
