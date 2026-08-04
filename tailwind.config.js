/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // sleek blue
          light: '#60a5fa',
          dark: '#2563eb'
        },
        secondary: '#10b981', // emerald
        accent: '#8b5cf6', // violet
        danger: '#f43f5e', // rose
        warning: '#f59e0b', // amber
        body: '#f8fafc',
        surface: '#ffffff'
      }
    },
  },
  plugins: [],
}
