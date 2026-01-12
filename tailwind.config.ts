import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e0f7f9',
          100: '#b3eaf0',
          200: '#80dde6',
          300: '#4dd0dc',
          400: '#26c5d4',
          500: '#00bacc',
          600: '#00a3b3',
          700: '#008a99',
          800: '#00707f',
          900: '#004d59',
        },
        secondary: {
          50: '#e8f3f8',
          100: '#c6e0ed',
          200: '#a0cce1',
          300: '#7ab8d5',
          400: '#5ea9cc',
          500: '#429ac3',
          600: '#3c8bb3',
          700: '#33789f',
          800: '#2b668b',
          900: '#1d4766',
        },
        accent: {
          light: '#17C3B2',
          DEFAULT: '#00A896',
          dark: '#008577',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        sans: ['system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 15px rgba(0, 0, 0, 0.08)',
        medium: '0 4px 25px rgba(0, 0, 0, 0.12)',
        strong: '0 10px 40px rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;

