/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    screens: {
      'xs': '475px',
      
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      fontFamily: {
        belleza: ['Belleza', 'sans-serif'], // Agrega la fuente Belleza
        quicksand: ['Quicksand', 'sans-serif'], 
      },
      colors:{
        darkGray: '#333333',
        healthyGray: '#E5EBDF',
        healthyGray1: '#c3c3c3',
        healthyDarkGray1: '#8e8b8b',
        hbGreen: '#EDF6B9',
        healthyGreen: '#a1bc1f',
        healthyDarkGreen: '#8ba020',
        healthyOrange:'#FA9B6A',
        healthyDarkOrange: '#C25C28',
      }
    },
  },
  plugins: [],
}

