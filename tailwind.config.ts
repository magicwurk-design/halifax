import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT:'#050d1f', mid:'#0a1628', surface:'#0f1e35', card:'#132040' },
        blue:  { bright:'#1d6ef5', mid:'#1558d6', soft:'#2979ff' },
        gold:  { DEFAULT:'#c9a84c', light:'#e8c97a', dim:'rgba(201,168,76,0.18)' },
        border:     'rgba(255,255,255,0.09)',
        background: '#050d1f',
        foreground: 'rgba(255,255,255,0.92)',
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif'],
        mono: ['JetBrains Mono','Fira Code','monospace'],
      },
      borderRadius: {
        lg:'0.75rem', xl:'1rem', '2xl':'1.25rem',
        '3xl':'1.5rem', '4xl':'2rem',
      },
      keyframes: {
        'fade-in':  { from:{ opacity:'0', transform:'translateY(8px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        'slide-up': { from:{ opacity:'0', transform:'translateY(16px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        'pulse-ring': { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'.4' } },
      },
      animation: {
        'fade-in':  'fade-in .3s ease-out',
        'slide-up': 'slide-up .4s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
