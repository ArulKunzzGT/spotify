/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.{html,js}"], // Pastikan path ini benar!
  theme: {
    extend: {
      colors: {
        'spotify-gray': '#2A2A2A', // Perhatikan format hex-nya
        'spotify-green': '#1fd660',
      },
    },
  },
  plugins: [],
}