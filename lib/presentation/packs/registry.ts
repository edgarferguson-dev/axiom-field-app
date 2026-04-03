import type { OpeningMode } from "@/types/presentationPack";
import { DEFAULT_PRESENTATION_PACK_ID } from "@/types/presentationPack";
import { APPOINTMENT_DEFAULT_MODE, INQUIRY_DEFAULT_MODE } from "@/lib/presentation/merchantProofRuns";

/**
 * Phase 7B — two curated merchant proof runs (appointment vs inquiry).
 * Asset keys kept for fallback; primary visuals use `merchantVisual` on slides.
 */
export type PresentationPackDefinition = {
  id: string;
  /** Private / rep-facing label only */
  label: string;
  defaultOpeningMode: OpeningMode;
  assetKeys: {
    snapshot: string;
    flow: string;
    compare: string;
    stat: string;
  };
};

export const PRESENTATION_PACKS: Record<string, PresentationPackDefinition> = {
  "appointment-local": {
    id: "appointment-local",
    label: "Appointment business",
    defaultOpeningMode: APPOINTMENT_DEFAULT_MODE,
    assetKeys: {
      snapshot: "svc-response-grid",
      flow: "svc-automation-3",
      compare: "svc-before-after",
      stat: "svc-leak-stat",
    },
  },
  "inquiry-local": {
    id: "inquiry-local",
    label: "Inquiry / office",
    defaultOpeningMode: INQUIRY_DEFAULT_MODE,
    assetKeys: {
      snapshot: "svc-response-grid",
      flow: "svc-automation-3",
      compare: "svc-before-after",
      stat: "svc-leak-stat",
    },
  },
};

export function getPresentationPackDefinition(packId: string | undefined | null): PresentationPackDefinition {
  if (packId === "core-local") {
    return PRESENTATION_PACKS["appointment-local"]!;
  }
  if (packId && PRESENTATION_PACKS[packId]) return PRESENTATION_PACKS[packId];
  return PRESENTATION_PACKS[DEFAULT_PRESENTATION_PACK_ID]!;
}

export function listPresentationPacks(): PresentationPackDefinition[] {
  return Object.values(PRESENTATION_PACKS);
}
