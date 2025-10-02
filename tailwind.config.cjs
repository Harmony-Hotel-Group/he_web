/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary': '#29333B', // Azul Marino Oscuro
        'accent': '#BF953D',  // Dorado Antiguo
        'background': '#ffffff', // Gris Claro/Beige
      },
    },
  },
  plugins: [],
}
