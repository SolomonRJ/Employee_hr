/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './{App,main,index}.{ts,tsx,jsx,js}',
    './components/**/*.{ts,tsx,jsx,js}',
    './pages/**/*.{ts,tsx,jsx,js}',
    './hooks/**/*.{ts,tsx,jsx,js}',
    './services/**/*.{ts,tsx,jsx,js}',
    './context/**/*.{ts,tsx,jsx,js}',
  ],
  theme: {
    fontFamily: {
      sans: ['"Roboto"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        background: '#FFFFFF',
        textPrimary: '#000000',
        textSecondary: '#666666',
        border: '#E5E5E5',
        accent: '#111111',
        muted: '#999999',
      },
    },
  },
  plugins: [],
};

