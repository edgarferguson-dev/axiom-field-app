import type { SignalColor } from "@/types/session";

/** Visual tokens for coaching prompt signals (private rep UI) */
export const COACHING_SIGNAL_STYLES: Record<
  SignalColor,
  { label: string; dot: string; border: string; text: string }
> = {
  green: {
    label: "Momentum",
    dot: "bg-signal-green",
    border: "border-signal-green/40",
    text: "text-signal-green",
  },
  yellow: {
    label: "Redirect",
    dot: "bg-signal-yellow",
    border: "border-signal-yellow/40",
    text: "text-signal-yellow",
  },
  red: {
    label: "Objection",
    dot: "bg-signal-red",
    border: "border-signal-red/40",
    text: "text-signal-red",
  },
};
