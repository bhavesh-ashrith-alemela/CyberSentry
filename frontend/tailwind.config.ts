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
        // CyberSentry Gen Z Editorial Color System
        cs: {
          cream: "#F5E4CF",
          "cream-deep": "#EADBCA",
          paper: "#FFFDF8",
          "paper-pure": "#FFFFFF",
          ink: "#20252B",
          muted: "#5F6870",
          border: "#CFC8BC",
          "border-dark": "#20252B",
          denim: "#275CCC",
          "denim-light": "#EBF1FC",
          "denim-dark": "#1C47A8",
          olive: "#7E8C4A",
          "olive-light": "#F2F5E8",
          "olive-dark": "#68743B",
          pink: "#E8B7C2",
          "pink-light": "#FDF2F4",
          "pink-dark": "#D495A3",
          sand: "#EADBCA",
          safe: "#2E7D47",
          "safe-bg": "#E8F5E9",
          warning: "#C27318",
          "warning-bg": "#FEF3E2",
          danger: "#C53B4F",
          "danger-bg": "#FCE8EB",
        },
        // Graceful mapping for legacy cyber classes until individual pages are refactored
        cyber: {
          dark: "#F5E4CF",
          card: "#FFFDF8",
          cardHover: "#FAF7EF",
          border: "#CFC8BC",
          borderLight: "#DFD9CE",
          accent: "#275CCC",
          accentGlow: "#275CCC",
          safe: "#2E7D47",
          warning: "#C27318",
          danger: "#C53B4F",
          muted: "#5F6870",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Fraunces", "Newsreader", "Playfair Display", "Georgia", "serif"],
        serif: ["var(--font-display)", "Fraunces", "Newsreader", "Playfair Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        paper: "0 1px 3px rgba(32, 37, 43, 0.04), 0 4px 12px rgba(32, 37, 43, 0.05)",
        "paper-hover": "0 4px 14px rgba(32, 37, 43, 0.08), 0 10px 28px rgba(32, 37, 43, 0.06)",
        folder: "0 2px 0 rgba(32, 37, 43, 0.08), 0 8px 24px rgba(32, 37, 43, 0.07)",
        tactile: "0 2px 0 #CFC8BC, 0 4px 10px rgba(32, 37, 43, 0.04)",
      },
      borderRadius: {
        tab: "10px 10px 0 0",
        folder: "16px",
      },
      animation: {
        "lift": "liftCard 0.2s ease-out forwards",
      },
      keyframes: {
        liftCard: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-3px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
