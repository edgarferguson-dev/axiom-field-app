import type { PricingTier } from "@/lib/flows/presentationEngine";

/** Demo default tiers — legacy multi-tier (unused in Phase 7B primary flow). */
export const DEMO_PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$299/mo",
    subtitle: "Proof of value",
    highlights: ["Lead capture + instant response", "After-hours coverage", "Basic reporting"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$599/mo",
    subtitle: "Most teams land here",
    highlights: ["Everything in Starter", "Guided selling overlays", "Performance scoring + recap"],
    recommended: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$999/mo",
    subtitle: "Highest leverage",
    highlights: ["Everything in Growth", "Advanced routing + playbooks", "Priority support"],
  },
];

/** Phase 7B — one clear offer; no matrix in the room. */
export const SIMPLE_ASK_SINGLE_TIER: PricingTier[] = [
  {
    id: "pilot-start",
    name: "Pilot start",
    price: "$299/mo",
    subtitle: "Lean proof — scale after the first win",
    highlights: ["Automated first response", "Booking handoff", "Light recap"],
    recommended: true,
  },
];
