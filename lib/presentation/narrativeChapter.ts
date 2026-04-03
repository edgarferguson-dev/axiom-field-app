import type { SlideType } from "@/lib/flows/presentationEngine";

/**
 * Phase 7A — three beats: proof arc (all visual proof slides), offer, commit.
 * Avoids fragmenting the story across “opening / problem / proof” when the deck is proof-first.
 */
export const NARRATIVE_CHAPTERS: { id: string; label: string; match: (t: SlideType) => boolean }[] = [
  {
    id: "proof-arc",
    label: "Proof",
    match: (t) =>
      t === "proof-snapshot" ||
      t === "mock-flow" ||
      t === "comparison-proof" ||
      t === "impact-stat" ||
      t === "decision-next" ||
      t === "pain" ||
      t === "solution" ||
      t === "proof" ||
      t === "cost-roi" ||
      t === "interactive-proof" ||
      t === "business-snapshot",
  },
  { id: "offer", label: "Offer", match: (t) => t === "pricing" },
  { id: "commit", label: "Next step", match: (t) => t === "presentation-actions" },
];

export function narrativeChapterIndexForSlideType(type: SlideType): number {
  const i = NARRATIVE_CHAPTERS.findIndex((c) => c.match(type));
  return i >= 0 ? i : 0;
}
