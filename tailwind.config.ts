import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#7EE000',
          dark: '#5AB800',
          light: '#E8FFD0',
        },
        veri: {
          black: '#0B0B0B',
          gray: '#666666',
          light: '#F5F5F2',
          border: '#E8E8E4',
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],  // bold headings → font-display
        body:    ['Poppins', 'sans-serif'],  // normal text  → font-body
     },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'marquee': 'marquee 20s linear infinite',
        'blink': 'blink 1.4s ease infinite',
        'pulse-dot': 'pulse-dot 1.5s ease infinite',
        'charge': 'charge 2.2s cubic-bezier(0.4,0,0.2,1) forwards',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' },
        },
        charge: {
          '0%':   { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
      },
    },
  },
  plugins: [],
}

export default config
