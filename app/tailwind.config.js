/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#AAFF45',
          dark: '#8CE032',
          light: '#D4FF9A',
          ultra: '#E8FFCF',
        },
        ink: {
          DEFAULT: '#0D0D0D',
          soft: '#1A1A1A',
          muted: '#444444',
          faint: '#888888',
        },
        paper: {
          DEFAULT: '#FAFAF8',
          gray: '#F0F0EE',
          mid: '#E8E8E5',
          dark: '#D8D8D5',
        },
        status: {
          open: '#AAFF45',
          progress: '#FFE066',
          review: '#FF9933',
          done: '#22C55E',
          cancelled: '#FF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px #0D0D0D',
        'brutal-lg': '6px 6px 0px #0D0D0D',
        'brutal-lime': '4px 4px 0px #AAFF45',
        'brutal-sm': '2px 2px 0px #0D0D0D',
        'card': '0 1px 3px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
};
