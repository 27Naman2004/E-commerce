/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:     '#B76E79',  // Dusty Rose
        primaryDark: '#9C5A66',  // Deep Rose (hover)
        secondary:   '#E8C4C4',  // Blush Pink
        accent:      '#FDF7F5',  // Warm Ivory Pink
        surface:     '#FFFFFF',
        gold:        '#C9A227',  // Antique Gold
        borderSoft:  '#EAD5D5',
        textMain:    '#3A2A2E',
        textMuted:   '#7A6569',

        darkPrimary: '#D89CA6',
        darkPrimaryHover: '#C0808C',
        darkSecondary: '#4A2E36',
        darkAccent:  '#1C1418',
        darkSurface: '#2A1E23',
        darkGold:    '#D4AF37',
        darkBorder:  '#3D2A30',
        darkText:    '#F2E4E6',
        darkTextMuted: '#B59BA0',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body:    ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
