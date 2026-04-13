/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf2f3',
          100: '#fbe4e6',
          200: '#f6c5ca',
          300: '#ed939c',
          400: '#e15c6a',
          500: '#d23543',
          600: '#c4151c',
          700: '#a31218',
          800: '#871418',
          900: '#70161a',
          950: '#3d0709',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05)',
        'card-hover':
          '0 2px 4px rgba(15, 23, 42, 0.06), 0 12px 28px rgba(196, 21, 28, 0.14)',
      },
    },
  },
  plugins: [],
};
