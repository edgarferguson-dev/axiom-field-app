import type { FieldEngagementDecision } from "@/types/session";

export type CloseCTA = {
  primaryCTA: string;
  backupCTA: string;
};

/**
 * Deterministic CTAs from pre-brief gate — no AI.
 * GO: push for commitment; SOFT_GO: test / follow-up; WALK: respectful exit.
 */
export function computeCloseCTAs(
  decision: FieldEngagementDecision["decision"],
  confidence: number
): CloseCTA {
  const tight = confidence >= 72;

  if (decision === "GO") {
    return {
      primaryCTA: tight
        ? "Ask to start: card on file or pay today."
        : "Trial: “Does this fix the leak — yes or no?”",
      backupCTA: tight
        ? "Stall? Date + owner in the room."
        : "Book 20‑min setup — calendar out now.",
    };
  }

  if (decision === "SOFT_GO") {
    return {
      primaryCTA: tight
        ? "7‑day pilot — one site or one source."
        : "One week, one metric, you check in.",
      backupCTA: "Hesitant? Follow‑up with the one proof they need.",
    };
  }

  return {
    primaryCTA: "Thank, leave value, exit — no twist.",
    backupCTA: "“Text when you want the 10‑min version.”",
  };
}
