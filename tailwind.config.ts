import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        charcoal: {
          800: "#1A1D21",
          900: "#111315",
          950: "#0B0C0E",
        },
        surface: {
          base: "#FFFFFF",
          subtle: "#F9F9FB",
          muted: "#F1F2F4",
          dark: "#111315",
          "dark-subtle": "#181A1D",
        },
        clinical: {
          teal: "#0D9488",
          "teal-hover": "#0F766E",
          "teal-light": "#F0FDFA",
          "teal-dark": "#115E59",
        },
        border: {
          subtle: "#E2E8F0",
          strong: "#CBD5E1",
          dark: "#27272A",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
