import type { CoachingPrompt } from "@/types/session";

/** Inline coaching prompt when buyer rejects pricing in the presentation flow */
export function buildPricingRejectCoachingPrompt(): CoachingPrompt {
  return {
    id: `p-${Date.now()}`,
    timestamp: Date.now(),
    phase: "closing",
    signal: "red",
    audioCue:
      "Slow down. Acknowledge the no, then reopen with a low-risk next step—prove value before asking for commitment.",
    nextMove:
      "Ask what they'd need to see in the next 7 days to reconsider. Offer a narrow pilot that removes risk.",
    buySignal: undefined,
  };
}
