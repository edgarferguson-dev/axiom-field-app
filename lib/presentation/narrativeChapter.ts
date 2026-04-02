import type { SlideType } from "@/lib/flows/presentationEngine";

/** High-level story arc for the buyer-facing deck (one segment may span several slides). */
export const NARRATIVE_CHAPTERS: { id: string; label: string; match: (t: SlideType) => boolean }[] = [
  { id: "opening", label: "Opening", match: (t) => t === "business-snapshot" },
  { id: "problem", label: "Problem", match: (t) => t === "pain" },
  {
    id: "build-the-case",
    label: "Proof & value",
    match: (t) =>
      t === "solution" || t === "proof" || t === "cost-roi" || t === "interactive-proof",
  },
  { id: "offer", label: "Offer", match: (t) => t === "pricing" },
  { id: "commit", label: "Commit", match: (t) => t === "close-open-account" },
];

export function narrativeChapterIndexForSlideType(type: SlideType): number {
  const i = NARRATIVE_CHAPTERS.findIndex((c) => c.match(type));
  return i >= 0 ? i : 0;
}
