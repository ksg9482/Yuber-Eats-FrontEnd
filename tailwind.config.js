const colors = require("tailwindcss/colors");

module.exports = {
  purge:[
    "./src/**/*.tsx"
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
