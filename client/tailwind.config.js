/** @type {import('tailwindcss').Config} */
export default {
  // This content array is the key part.
  // It tells Tailwind to look for class names in these files.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- This line is crucial
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}