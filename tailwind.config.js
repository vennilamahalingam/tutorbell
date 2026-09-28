/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Placeholder tokens — swap in the values from the Tutorbell designs.
      colors: {
        brand: { DEFAULT: '#2F5D50', soft: '#E7EFEC' },
        ink: { DEFAULT: '#1C1C1E', muted: '#6B6B70' },
        surface: { DEFAULT: '#FFFFFF', muted: '#F6F5F2' },
        success: '#2E7D32',
        warning: '#B26A00',
        danger: '#C62828',
      },
    },
  },
  plugins: [],
};
