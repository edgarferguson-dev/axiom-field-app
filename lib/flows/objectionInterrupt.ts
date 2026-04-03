import type { FieldEngagementDecision, PreCallIntel } from "@/types/session";

export type ObjectionInterruptContent = {
  likelyObjection: string;
  response: string;
  regainQuestion: string;
  avoidMistake: string;
};

/**
 * Deterministic objection overlay from pre-call intel + gate — no AI.
 */
export function buildObjectionInterrupt(
  intel: PreCallIntel | null | undefined,
  decision: FieldEngagementDecision | null | undefined
): ObjectionInterruptContent {
  const likely =
    intel?.likelyObjection?.trim() ||
    "“We’re good / busy / already have a tool.”";

  const d = decision?.decision ?? "SOFT_GO";

  let response: string;
  if (d === "GO") {
    response = "Once: “Fair — what makes a 7‑day pilot worth it?”";
  } else if (d === "SOFT_GO") {
    response = "Mirror — then: “What makes a small test feel safe?”";
  } else {
    response = "Don’t fight it. “Got it — text me if follow‑up helps.”";
  }

  const anchor = intel?.keyOpportunities?.[0]?.trim();
  const regain = anchor
    ? `${anchor.slice(0, 88)}${anchor.length > 88 ? "…" : ""}`
    : "What’s true for a 7‑day pilot on one metric?";

  return {
    likelyObjection: likely,
    response,
    regainQuestion: regain,
    avoidMistake: "No discount. Return to their leak.",
  };
}
