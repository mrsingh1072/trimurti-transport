/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#0ea5e9',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom right, #020617, #0f172a, #000000)',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(0, 255, 200, 0.15)',
        'glow-purple': '0 0 50px rgba(168, 85, 247, 0.25)',
        'glow-cyan': '0 0 50px rgba(34, 211, 238, 0.25)',
      },
    },
  },
  plugins: [],
}
