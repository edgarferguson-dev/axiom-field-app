import type { PackageTier } from "@/lib/flows/offerFitEngine";

export const OFFER_FIT_TIER_STYLES: Record<
  PackageTier,
  { badge: string; dot: string }
> = {
  core: { badge: "bg-border text-muted border-border", dot: "bg-muted" },
  growth: { badge: "bg-accent/15 text-accent border-accent/30", dot: "bg-accent" },
  scale: {
    badge: "bg-signal-green/15 text-signal-green border-signal-green/30",
    dot: "bg-signal-green",
  },
};
