import type { Config } from "tailwindcss";

/**
 * Semantic colors reference `app/globals.css` :root RGB triplets.
 * Uses `rgb(var(--token) / <alpha-value>)` so Tailwind opacity modifiers work.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-dim": "rgb(var(--color-accent-dim) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
        "accent-dark": "rgb(var(--color-accent-dark) / <alpha-value>)",
        highlight: "rgb(var(--color-highlight) / <alpha-value>)",
        "signal-green": "rgb(var(--color-signal-green) / <alpha-value>)",
        "signal-yellow": "rgb(var(--color-signal-yellow) / <alpha-value>)",
        "signal-red": "rgb(var(--color-signal-red) / <alpha-value>)",
        ink: {
          950: "rgb(var(--color-ink-950) / <alpha-value>)",
          900: "rgb(var(--color-ink-900) / <alpha-value>)",
          800: "rgb(var(--color-ink-800) / <alpha-value>)",
          700: "rgb(var(--color-ink-700) / <alpha-value>)",
          600: "rgb(var(--color-ink-600) / <alpha-value>)",
          500: "rgb(var(--color-ink-500) / <alpha-value>)",
          border: "rgb(var(--color-ink-border) / <alpha-value>)",
        },
      },
      borderRadius: {
        ax: "var(--radius-md)",
        "ax-lg": "var(--radius-xl)",
        "dani-xs": "var(--radius-xs)",
        "dani-sm": "var(--radius-sm)",
        "dani-md": "var(--radius-md)",
        "dani-lg": "var(--radius-lg)",
        "dani-xl": "var(--radius-xl)",
        "dani-2xl": "var(--radius-2xl)",
        "dani-3xl": "var(--radius-3xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-md)",
        elevated: "var(--shadow-elevated)",
        bar: "0 -4px 20px rgba(0,0,0,0.06)",
        glow: "var(--shadow-glow-accent)",
        ink: "var(--shadow-ink)",
        inset: "var(--shadow-inset-light)",
      },
      spacing: {
        "ax-xs": "var(--space-1)",
        "ax-sm": "var(--space-2)",
        "ax-md": "var(--space-4)",
        "ax-lg": "var(--space-6)",
        "ax-xl": "var(--space-10)",
        "ax-xxl": "var(--space-12)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "dani-xs": ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }],
        "dani-sm": ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }],
        "dani-base": ["var(--text-base)", { lineHeight: "var(--leading-normal)" }],
        "dani-lg": ["var(--text-lg)", { lineHeight: "var(--leading-snug)" }],
        "dani-xl": ["var(--text-xl)", { lineHeight: "var(--leading-snug)" }],
        "dani-2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-tight)" }],
        "dani-3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-tight)" }],
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
