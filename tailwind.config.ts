import type { Config } from "tailwindcss";

/** Colors align with `styles/tokens.ts` and `app/globals.css` — DaNI Method brand. */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F3F3F1",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        border: "#DCDCDC",
        foreground: "#111111",
        muted: "#3A3A3A",
        accent: "#00A8A8",
        "accent-dim": "#B8E8E8",
        "accent-soft": "#E6FAFA",
        "accent-dark": "#007B7B",
        highlight: "#00CFCF",
        "signal-green": "#1F7A1F",
        "signal-yellow": "#8A7A38",
        "signal-red": "#A61E1E",
      },
      borderRadius: {
        ax: "10px",
        "ax-lg": "16px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.045)",
        medium: "0 8px 30px rgba(0,0,0,0.07)",
        bar: "0 -4px 20px rgba(0,0,0,0.05)",
        glow: "0 4px 24px rgba(0, 168, 168, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        "ax-xs": "4px",
        "ax-sm": "8px",
        "ax-md": "16px",
        "ax-lg": "24px",
        "ax-xl": "40px",
        "ax-xxl": "64px",
      },
      maxWidth: {
        ax: "72rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
