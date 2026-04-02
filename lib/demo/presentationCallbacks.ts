import { resolveObjection } from "@/lib/flows/salesEngine";
import type { CoachingPrompt, ObjectionType, SalesStep, Signal } from "@/types/session";
import { buildPricingRejectCoachingPrompt } from "@/lib/demo/pricingRejectCoachingPrompt";

export type DemoPresentationCallbackDeps = {
  addSignal: (signal: Signal) => void;
  addObjection: (objection: ObjectionType) => void;
  addSalesStep: (step: SalesStep) => void;
  addCoachingPrompt: (prompt: CoachingPrompt) => void;
};

/**
 * Stable handlers for `PresentationEngine` demo wiring — same behavior as inline lambdas on the demo page.
 */
export function createDemoPresentationCallbacks(deps: DemoPresentationCallbackDeps) {
  const { addSignal, addObjection, addSalesStep, addCoachingPrompt } = deps;

  return {
    onInteractiveProofMilestone: () => addSignal("green"),
    onPricingAccept: () => addSignal("green"),
    onOpenAccount: () => addSignal("green"),
    onHesitate: () => {
      addObjection("price");
      addSalesStep(resolveObjection("price"));
      addSignal("yellow");
    },
    onReject: () => addCoachingPrompt(buildPricingRejectCoachingPrompt()),
  };
}
