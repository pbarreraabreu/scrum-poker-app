module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e'
        },
        emerald: {
          500: '#10b981'
        }
      }
    }
  },
  plugins: [],
};