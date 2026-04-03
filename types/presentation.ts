import { createInitialInteractiveDemoState } from "@/lib/flows/interactiveDemoEngine";
import type { InteractiveDemoState } from "@/lib/flows/interactiveDemoEngine";
import type { MaterialSummary } from "@/lib/flows/materialEngine";
import type { PresentationSlide, StrategyPackage } from "@/lib/flows/presentationEngine";
import type { OpeningMode } from "@/types/presentationPack";
import { DEFAULT_OPENING_MODE, DEFAULT_PRESENTATION_PACK_ID } from "@/types/presentationPack";

/**
 * Single nested bucket for buyer-facing presentation flow state.
 * Raw pasted text is not stored — only structured `materialSummary` after ingestion.
 * RFC 7 — pack / opening ids are lightweight; slide bodies live in code registry, not here.
 */
export type SessionPresentationState = {
  materialSummary: MaterialSummary | null;
  strategyPackage: StrategyPackage | null;
  generatedSlides: PresentationSlide[];
  interactiveProof: InteractiveDemoState;
  pricingTierId: string | null;
  pricingResponse: "accept" | "hesitate" | "reject" | null;
  /** Tier + terms accepted — distinct from account / onboarding completion */
  pricingAccepted: boolean;
  openAccountStarted: boolean;
  /** Registry id (e.g. core-local, b2b-lean) — not a CMS payload */
  packId: string;
  /** Structural opening order for proof-led beats */
  openingMode: OpeningMode;
  /** Synced from PresentationEngine — for private beat coaching only */
  activeSlideIndex: number;
  /** Phase 7D — null = use workspace default offer template */
  runOfferTemplateId: string | null;
};

export function createEmptyPresentation(): SessionPresentationState {
  return {
    materialSummary: null,
    strategyPackage: null,
    generatedSlides: [],
    interactiveProof: createInitialInteractiveDemoState(),
    pricingTierId: null,
    pricingResponse: null,
    pricingAccepted: false,
    openAccountStarted: false,
    packId: DEFAULT_PRESENTATION_PACK_ID,
    openingMode: DEFAULT_OPENING_MODE,
    activeSlideIndex: 0,
    runOfferTemplateId: null,
  };
}
