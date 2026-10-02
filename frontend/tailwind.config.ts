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
        // CyberSentry Clean Modern Design System (Approved Mockup)
        cs: {
          bg: "#F7F9FC",
          surface: "#FFFFFF",
          text: "#172033",
          muted: "#687386",
          border: "#E5EAF1",
          primary: {
            DEFAULT: "#2563EB",
            soft: "#EEF5FF",
            hover: "#1D4ED8",
          },
          success: {
            DEFAULT: "#25B47A",
            soft: "#E8F8F1",
          },
          warning: {
            DEFAULT: "#F2B84B",
            soft: "#FEF7EB",
          },
          danger: {
            DEFAULT: "#EF4444",
            soft: "#FEE2E2",
          },
          purple: {
            DEFAULT: "#8067D8",
            soft: "#F3F0FC",
          },

          // Compatibility aliases so existing unmigrated pages continue rendering gracefully
          cream: "#F7F9FC",
          "cream-deep": "#EEF2F6",
          paper: "#FFFFFF",
          "paper-pure": "#FFFFFF",
          ink: "#172033",
          denim: "#2563EB",
          "denim-light": "#EEF5FF",
          "denim-dark": "#1D4ED8",
          olive: "#25B47A",
          "olive-light": "#E8F8F1",
          "olive-dark": "#1E9565",
          pink: "#F3F0FC",
          "pink-light": "#F8F6FD",
          "pink-dark": "#8067D8",
          sand: "#EEF2F6",
          safe: "#25B47A",
          "safe-bg": "#E8F8F1",
          "warning-bg": "#FEF7EB",
          "danger-bg": "#FEE2E2",
        },
        cyber: {
          dark: "#F7F9FC",
          card: "#FFFFFF",
          cardHover: "#F8FAFC",
          border: "#E5EAF1",
          borderLight: "#EEF2F6",
          accent: "#2563EB",
          accentGlow: "#2563EB",
          safe: "#25B47A",
          warning: "#F2B84B",
          danger: "#EF4444",
          muted: "#687386",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-sans)",
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16, 24, 40, 0.04)",
        sm: "0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)",
        md: "0 4px 8px -2px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
        lg: "0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)",
        // Legacy aliases
        paper: "0 1px 3px rgba(16, 24, 40, 0.05), 0 1px 2px rgba(16, 24, 40, 0.03)",
        "paper-hover": "0 4px 8px -2px rgba(16, 24, 40, 0.06), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
        folder: "0 4px 8px -2px rgba(16, 24, 40, 0.06)",
        tactile: "0 1px 3px rgba(16, 24, 40, 0.06)",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "16px",
        full: "9999px",
        tab: "8px 8px 0 0",
        folder: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
