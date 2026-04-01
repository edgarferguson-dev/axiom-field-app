import { createInitialInteractiveDemoState } from "@/lib/flows/interactiveDemoEngine";
import type { InteractiveDemoState } from "@/lib/flows/interactiveDemoEngine";
import type { MaterialSummary } from "@/lib/flows/materialEngine";
import type { PresentationSlide, StrategyPackage } from "@/lib/flows/presentationEngine";

/**
 * Single nested bucket for buyer-facing presentation flow state.
 * Raw pasted text is not stored — only structured `materialSummary` after ingestion.
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
  };
}
