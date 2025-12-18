/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Azul oscuro
        accent: '#D97706',  // Naranja/dorado
        text: '#1F2937',    // Gris oscuro para texto
      }
    },
  },
  plugins: [],
}