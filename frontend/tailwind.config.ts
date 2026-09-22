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
        sand: {
          50: "#F9FAF9",
          100: "#F2F4F2",
          200: "#E8EBE8",
          300: "#E0E4E0",
          400: "#CAD0CA",
          500: "#A4ACA6",
          600: "#7A847D",
          700: "#565E59",
          800: "#363B38",
          900: "#1C1F1D",
        },
        forest: {
          50: "#EDF5F0",
          100: "#DBEBE1",
          200: "#B9D7C5",
          300: "#90BEA3",
          400: "#64A17F",
          500: "#428360",
          600: "#31694C",
          700: "#28553E",
          800: "#234A38",
          900: "#183528",
          950: "#16201B",
        },
        rust: {
          50: "#FDF2F1",
          100: "#FCE3E2",
          200: "#F9CBC9",
          300: "#F3A7A3",
          400: "#E97670",
          500: "#D84F48",
          600: "#C03730",
          700: "#A12D27",
          800: "#993833",
          900: "#71201B",
        },
        amber: {
          50: "#FAF5EB",
          100: "#F5E9CE",
          200: "#ECD19A",
          300: "#E2B564",
          400: "#D89B37",
          500: "#BC7F22",
          600: "#A4671A",
          700: "#8C6524",
          800: "#714618",
          900: "#5E3A18",
        },
        // Transitional tokens mapped to the editorial palette
        cyber: {
          dark: "#F9FAF9",
          card: "#FFFFFF",
          cardHover: "#F2F4F2",
          border: "#E0E4E0",
          borderLight: "#CAD0CA",
          accent: "#234A38",
          accentGlow: "#28553E",
          safe: "#234A38",
          warning: "#8C6524",
          danger: "#993833",
          muted: "#6C7771",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(22, 32, 27, 0.05), 0 1px 2px rgba(22, 32, 27, 0.03)",
        card: "0 2px 8px rgba(22, 32, 27, 0.04), 0 1px 2px rgba(22, 32, 27, 0.02)",
      },
    },
  },
  plugins: [],
};

export default config;
