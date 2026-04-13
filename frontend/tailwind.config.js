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
          50: '#f1f7f3',
          100: '#dcebe1',
          200: '#b8d6c2',
          300: '#8bba9c',
          400: '#5e9976',
          500: '#3d7c58',
          600: '#1e5a38',
          700: '#18482d',
          800: '#143924',
          900: '#0f2c1c',
          950: '#08180e',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05)',
        'card-hover':
          '0 2px 4px rgba(15, 23, 42, 0.06), 0 12px 28px rgba(30, 90, 56, 0.16)',
      },
    },
  },
  plugins: [],
};
