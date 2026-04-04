/**
 * Legacy TS mirror — **theme source of truth is `app/globals.css` `:root` tokens**
 * and `tailwind.config.ts` semantic colors. Update those first; sync here only if TS consumers need literals.
 */
export const tokens = {
  colors: {
    /** Canvas (approximate; use CSS vars in new UI) */
    bg: "#C4C2C0",
    surface: "#FFFFFF",
    border: "#DCDCDC",
    text: "#111111",
    subtext: "#3A3A3A",
    accent: "#00A8A8",
    accentHighlight: "#00CFCF",
    accentDark: "#007B7B",
    accentSoft: "#E6FAFA",
    signalBuy: "#1F7A1F",
    signalNeutral: "#7A7A7A",
    signalRisk: "#A61E1E",
    /** In-app caution between buy and risk */
    signalCaution: "#8A7A38",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "40px",
    xxl: "64px",
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "16px",
  },
  shadow: {
    soft: "0 4px 20px rgba(0,0,0,0.045)",
    medium: "0 8px 30px rgba(0,0,0,0.07)",
  },
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"] as const,
  },
} as const;

export type TokenColors = typeof tokens.colors;
