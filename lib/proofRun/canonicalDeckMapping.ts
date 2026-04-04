/**
 * Canonical Proof Run ↔ deck mapping (single source of truth for beat semantics).
 *
 * `proofRun.phase` is defined by **product meaning**, not deck position or legacy labels.
 * Bridge slides (e.g. `decision-next`) do not map to their own beat; phase stays at the
 * last canonical beat seen walking the deck from index 0..i.
 *
 * | Phase    | Product meaning       | Slide `type`          |
 * |----------|----------------------|------------------------|
 * | beat-1   | Pain Mirror          | `proof-snapshot`       |
 * | beat-2   | Missed Opportunity   | `comparison-proof`     |
 * | beat-3   | The Fix              | `mock-flow`            |
 * | beat-4   | Full System          | `impact-stat`          |
 * | beat-5   | Ask                  | `pricing`              |
 * | beat-6   | Health Report Share  | `health-report-share`  |
 * | complete | Post-proof (CTA etc.)| `presentation-actions` |
 *
 * Reducer / UI should use these helpers instead of hard-coding indices or inferring from
 * names like "decision-next" or "pricing maybe".
 */

import type { PresentationSlide, SlideType } from "@/lib/flows/presentationEngine";
import type { ProofRunBeatId, ProofRunPhase } from "@/types/proofRun";
import { proofRunBeatIdFromPhase } from "@/types/proofRun";

/** Slide type for each canonical in-run beat (beats 1–6 only). */
export const PROOF_RUN_CANONICAL_BEAT_SLIDE_TYPE: Record<ProofRunBeatId, SlideType> = {
  "beat-1": "proof-snapshot",
  "beat-2": "comparison-proof",
  "beat-3": "mock-flow",
  "beat-4": "impact-stat",
  "beat-5": "pricing",
  "beat-6": "health-report-share",
};

const SLIDE_TYPE_TO_BEAT: Map<SlideType, ProofRunBeatId> = new Map(
  (Object.entries(PROOF_RUN_CANONICAL_BEAT_SLIDE_TYPE) as [ProofRunBeatId, SlideType][]).map(
    ([beat, slideType]) => [slideType, beat]
  )
);

export function canonicalBeatIdFromSlideType(type: SlideType): ProofRunBeatId | null {
  return SLIDE_TYPE_TO_BEAT.get(type) ?? null;
}

/**
 * Phase for the slide at `index`, given the full deck (order matters for bridge stickiness).
 */
export function proofRunPhaseFromDeckIndex(slides: PresentationSlide[], index: number): ProofRunPhase {
  if (slides.length === 0) return "beat-1";
  const i = Math.max(0, Math.min(index, slides.length - 1));
  const type = slides[i]!.type;
  if (type === "presentation-actions") return "complete";
  const direct = canonicalBeatIdFromSlideType(type);
  if (direct) return direct;
  let last: ProofRunBeatId | null = null;
  for (let j = 0; j <= i; j++) {
    const b = canonicalBeatIdFromSlideType(slides[j]!.type);
    if (b) last = b;
  }
  return last ?? "beat-1";
}

/**
 * First deck index that shows the given phase (for controlled deck sync / hydration).
 */
export function slideIndexForProofRunPhaseInDeck(slides: PresentationSlide[], phase: ProofRunPhase): number {
  if (slides.length === 0) return 0;
  const n = slides.length;
  if (phase === "idle") return 0;
  if (phase === "complete") {
    const actionsIdx = slides.findIndex((s) => s.type === "presentation-actions");
    if (actionsIdx >= 0) return actionsIdx;
    const healthIdx = slides.findIndex((s) => s.type === "health-report-share");
    if (healthIdx >= 0) return healthIdx;
    return n - 1;
  }
  const beat = proofRunBeatIdFromPhase(phase);
  if (!beat) return 0;
  const want = PROOF_RUN_CANONICAL_BEAT_SLIDE_TYPE[beat];
  const idx = slides.findIndex((s) => s.type === want);
  if (idx >= 0) return idx;
  return 0;
}

/** Deck index of the Ask beat (`pricing`), or -1 if absent. */
export function slideIndexForAskBeat(slides: PresentationSlide[]): number {
  return slides.findIndex((s) => s.type === PROOF_RUN_CANONICAL_BEAT_SLIDE_TYPE["beat-5"]);
}

/** Deck index of the Health Report Share beat, or -1 if absent. */
export function slideIndexForHealthReportBeat(slides: PresentationSlide[]): number {
  return slides.findIndex((s) => s.type === PROOF_RUN_CANONICAL_BEAT_SLIDE_TYPE["beat-6"]);
}

/**
 * Whether advancing with `next` from the last slide may close the run (`phase` → complete with timestamps).
 * Requires beat-6 to exist in the deck before auto-completing from a non–post-proof slide; otherwise last slide only.
 */
export function mayAutoCompleteProofRunFromLastSlide(
  slides: PresentationSlide[],
  lastSlideIndex: number
): boolean {
  if (slides.length === 0) return true;
  const cur = slides[lastSlideIndex];
  if (!cur) return true;
  const healthIdx = slideIndexForHealthReportBeat(slides);
  if (healthIdx < 0) return true;
  return cur.type === "health-report-share" || cur.type === "presentation-actions";
}
