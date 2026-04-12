/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05)',
        'card-hover':
          '0 2px 4px rgba(15, 23, 42, 0.06), 0 12px 28px rgba(79, 70, 229, 0.12)',
      },
    },
  },
  plugins: [],
};
