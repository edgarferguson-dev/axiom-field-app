import { resolveObjection } from "@/lib/flows/salesEngine";
import type { CoachingPrompt, ObjectionType, SalesStep, Signal } from "@/types/session";
import { buildPricingRejectCoachingPrompt } from "@/lib/demo/pricingRejectCoachingPrompt";

export type DemoPresentationCallbackDeps = {
  addSignal: (signal: Signal) => void;
  addObjection: (objection: ObjectionType) => void;
  addSalesStep: (step: SalesStep) => void;
  addCoachingPrompt: (prompt: CoachingPrompt) => void;
  /** Syncs live deal signal for Command Mode + private column UI */
  setDealSignal?: (signal: Signal) => void;
};

/**
 * Stable handlers for `PresentationEngine` demo wiring — same behavior as inline lambdas on the demo page.
 */
export function createDemoPresentationCallbacks(deps: DemoPresentationCallbackDeps) {
  const { addSignal, addObjection, addSalesStep, addCoachingPrompt, setDealSignal } = deps;

  const sync = (signal: Signal) => {
    addSignal(signal);
    setDealSignal?.(signal);
  };

  return {
    onInteractiveProofMilestone: () => sync("green"),
    onPricingAccept: () => sync("green"),
    onHesitate: () => {
      addObjection("price");
      addSalesStep(resolveObjection("price"));
      sync("yellow");
    },
    onReject: () => addCoachingPrompt(buildPricingRejectCoachingPrompt()),
  };
}
