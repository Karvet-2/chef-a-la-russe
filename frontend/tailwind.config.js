const path = require('path')

const repoRoot = path.join(__dirname, '..')

/** Пути для fast-glob: в Linux важны `/` и регистр имён каталогов (Components ≠ components). */
const posix = (...parts) => path.join(...parts).replace(/\\/g, '/')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    posix(repoRoot, 'app', '**', '*.{js,ts,jsx,tsx,mdx}'),
    posix(repoRoot, 'components', '**', '*.{js,ts,jsx,tsx,mdx}'),
    posix(repoRoot, 'contexts', '**', '*.{js,ts,jsx,tsx,mdx}'),
    posix(repoRoot, 'lib', '**', '*.{js,ts,jsx,tsx,mdx}'),
    posix(repoRoot, 'pages', '**', '*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#71717B',
        background: '#FFFFFF',
        lightGray: '#F1F5F9',
        dark: '#0E172A',
        accent: '#E13559',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'custom': '26px',
      },
    },
  },
  plugins: [],
}
