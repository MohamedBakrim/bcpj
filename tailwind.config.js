/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: '#E53131',
        secondary: '#6ec3f4',
        third: '#F78CA2',
        fourth: '#3D0C11',

      },
      fontFamily:{
        MAIN:["Roboto" , "sans-serif"]
      }
    },
  },
  variants: {},
  plugins: [
    require('taos/plugin')
  ],
  safelist: [
    '!duration-[0ms]',
    '!delay-[0ms]',
    'html.js :where([class*="taos:"]:not(.taos-init))'
  ],
  content: {
    relative: true,
    transform: (content) => content.replace(/taos:/g, ''),
    files: ['./src/*.{html,js}'],
  },
  
}

