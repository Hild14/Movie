/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#09090b',
          darker: '#050507',
          card: '#18181b',
          border: '#27272a',
          red: '#ef4444',
          gold: '#f59e0b',
          neon: '#22d3ee',
          green: '#22c55e',
        },
      },
    },
  },
  plugins: [],
}

