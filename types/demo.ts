/** Buyer posture for adaptive coaching (in-person). */
export type BuyerState =
  | "unknown"
  | "skeptical"
  | "price_resistant"
  | "distracted"
  | "curious"
  | "ready_to_buy"
  | "needs_reassurance";

/** Rep-facing vs buyer-facing surface on demo route. */
export type DemoViewMode = "public" | "private";

/** Deal energy (distinct from signal color). */
export type CoachingMomentum = "up" | "flat" | "down";
