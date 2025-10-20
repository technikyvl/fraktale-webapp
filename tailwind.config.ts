import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(240 5% 7%)',
        foreground: 'hsl(0 0% 98%)',
        muted: 'hsl(240 4% 16%)',
        accent: '#6366f1',
        card: 'hsl(240 5% 10%)',
        border: 'hsl(240 4% 20%)',
      },
    },
  },
  plugins: [],
} satisfies Config;


