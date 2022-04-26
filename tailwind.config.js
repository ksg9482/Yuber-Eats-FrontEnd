const colors = require("tailwindcss/colors");

module.exports = {
  purge:[
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx'
  ],
  darkMode:false,
  content: [],
  theme: {
    extend: {
      colors: {
        lime: colors.lime
      }
    },
    variants: {
      extend: {}
    }
  },
  plugins: [],
}
