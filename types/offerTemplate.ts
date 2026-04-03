/**
 * Phase 7D — workspace offer templates (settings); one active template per proof run for the ask beat.
 */

export type OfferTemplate = {
  id: string;
  /** Short label shown to rep (e.g. "Core — $297") */
  label: string;
  monthlyFee: number;
  /** 0 = free setup */
  setupFee: number;
  includedBullets: string[];
  /** Optional subtitle under pricing slide title */
  pilotSubtitle?: string;
  disclaimer?: string;
};

const DEFAULT_INCLUDED = [
  "Automated text answering",
  "Scheduling",
  "Phone-call follow-up flows",
  "DM / chatbot services",
  "Website chatbot",
  "Website setup",
] as const;

export const DEFAULT_OFFER_TEMPLATES: OfferTemplate[] = [
  {
    id: "offer-197",
    label: "Starter — $197/mo",
    monthlyFee: 197,
    setupFee: 0,
    includedBullets: [...DEFAULT_INCLUDED],
    pilotSubtitle: "Light footprint — prove response speed first.",
    disclaimer: "Final terms in a short written agreement after you say yes.",
  },
  {
    id: "offer-297",
    label: "Core — $297/mo",
    monthlyFee: 297,
    setupFee: 0,
    includedBullets: [...DEFAULT_INCLUDED],
    pilotSubtitle: "Prove it on your floor — pause or adjust after the window.",
    disclaimer: "Final terms in a short written agreement after you say yes.",
  },
  {
    id: "offer-497",
    label: "Plus — $497/mo",
    monthlyFee: 497,
    setupFee: 0,
    includedBullets: [...DEFAULT_INCLUDED],
    pilotSubtitle: "Full coverage for busier locations — same simple pilot.",
    disclaimer: "Final terms in a short written agreement after you say yes.",
  },
];

export const DEFAULT_OFFER_TEMPLATE_ID = "offer-297";
