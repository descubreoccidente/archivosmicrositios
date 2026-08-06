export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracota: '#b34127',
        'terracota-dark': '#8C3E25',
        naranja: '#f26631',
        teal: '#006468',
        magenta: '#e20d77',
        crema: '#F7F0E8',
        marron: '#2C1810',
        gris: '#6B5B52',
      },
      fontFamily: {
        primaria: ['Fredoka', 'sans-serif'],
        secundaria: ['Barlow', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
