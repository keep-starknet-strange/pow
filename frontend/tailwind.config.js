/* eslint-disable */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Xerxes', 'sans-serif'],
        'Xerxes': ['Xerxes', 'sans-serif'],
        'Pixels': ['Pixels', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
