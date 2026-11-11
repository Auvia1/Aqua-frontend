/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F3F1EA',
        surface: '#FBFAF6',
        card: '#FFFFFF',
        tile: '#EFEDE5',
        line: '#E6E3DA',
        forest: {
          900: '#0E3326',
          800: '#164232',
          700: '#1E5640',
        },
        leaf: {
          500: '#4E9A6B',
          400: '#6FB584',
          300: '#9CC9A8',
          200: '#C9DFC6',
        },
        lime: {
          300: '#D5EBB5',
          100: '#E6F2D6',
        },
        ink: '#12221A',
        muted: '#7B867F',
        danger: '#C2453D',
        warn: '#D9A441',
        frame: '#EDEAE0',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Telugu"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['34px', { lineHeight: '40px', fontWeight: '700' }],
        h1: ['28px', { lineHeight: '34px', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '26px', fontWeight: '700' }],
        title: ['16px', { lineHeight: '22px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        money: ['40px', { lineHeight: '44px', fontWeight: '700' }],
      },
      borderRadius: {
        hero: '24px',
        card: '20px',
        tile: '18px',
        input: '16px',
        pill: '999px',
        nav: '28px',
        frame: '32px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(14, 51, 38, 0.06)',
        fab: '0 8px 20px rgba(14, 51, 38, 0.18)',
        sheet: '0 -8px 32px rgba(14, 51, 38, 0.10)',
      },
      spacing: {
        page: '20px',
        nav: '7rem',
        fab: '56px',
        touch: '48px',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
      width: {
        app: '430px',
        fab: '56px',
      },
      maxWidth: {
        app: '430px',
      },
      height: {
        fab: '56px',
        btn: '56px',
        tile: '64px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        slide: '250ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease-out',
      },
      zIndex: {
        nav: '30',
        sheet: '40',
        toast: '50',
      },
    },
  },
  plugins: [],
};
