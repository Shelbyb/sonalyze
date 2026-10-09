import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core Spotify-inspired palette
        base: '#0a0a0a',
        panel: '#121212',
        elevated: '#181818',
        elevated2: '#212121',
        border: '#282828',
        muted: '#a7a7a7',
        subtle: '#727272',
        accent: '#1ed760',
        accentDeep: '#1db954',
        accentDim: '#0f7a37',
        cream: '#f5f3ee',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(120% 120% at 50% -10%, rgba(30,215,96,0.25) 0%, rgba(10,10,10,0) 55%)',
        'card-fade': 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        barPulse: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        rise: 'rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        barPulse: 'barPulse 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
