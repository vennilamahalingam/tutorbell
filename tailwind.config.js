const { light } = require('./src/theme/colors');

// Every token becomes a class (bg-primary, text-muted, border-border…) backed by a CSS
// variable, so light/dark switch at runtime via ThemeProvider (src/theme/theme-provider.tsx).
const colors = Object.fromEntries(
  Object.keys(light).map((name) => [name, `rgb(var(--c-${name}) / <alpha-value>)`]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        // Two weights only (design): regular + semibold. Use font-sans / font-semi.
        sans: ['PlusJakartaSans_400Regular'],
        semi: ['PlusJakartaSans_600SemiBold'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
