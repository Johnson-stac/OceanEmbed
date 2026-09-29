/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#F0F5FC',
          100: '#E1EDFB',
          200: '#C3DCF7',
          300: '#94C0F2',
          400: '#5A9BEB',
          500: '#2E78E0',
          600: '#155BBD',
          700: '#0B3A82', // Primary OceanEmbed Blue
          800: '#082C64', // Darker Blue / Hover
          900: '#051C40', // Deep Navy Blue
          950: '#030E20',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
