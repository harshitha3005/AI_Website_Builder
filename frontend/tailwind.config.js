/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        125: '125px',
      },
      height: {
        125: '125px',
      },
      spacing: {
        125: '125px',
      }
    },
  },
  plugins: [],
}
