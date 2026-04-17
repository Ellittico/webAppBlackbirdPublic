/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        zen: ['zen', 'sans-serif'],
      },
      screens: {
        'tablet-lg': '1000px',
      },
    },
  },
  plugins: [],
};
