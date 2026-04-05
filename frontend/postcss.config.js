module.exports = {
  plugins: {
    // Явный config: './tailwind.config.js' ломал Tailwind (blocklist undefined) при next build
    tailwindcss: {},
    autoprefixer: {},
  },
}
