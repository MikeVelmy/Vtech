// Used only to (re)generate css/tailwind.css — not loaded at runtime.
// Regenerate after adding new Tailwind classes to any .html file:
//   ./tailwindcss -i tailwind-src.css -o css/tailwind.css -c tailwind.config.js --minify
// (download the standalone CLI from https://github.com/tailwindlabs/tailwindcss/releases
// if you don't have it — no Node/npm required.)
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        surface: "var(--color-bg)",
        ink: "var(--color-ink)",
        void: "#070c17",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"],
      },
    },
  },
};
