import type { OpeningMode } from "@/types/presentationPack";

/** Field visit log — fast taps, local-first. */
export type PostRunResult =
  | "no_interest"
  | "interested"
  | "follow_up"
  | "soft_commit"
  | "hard_commit";

/** Logged only when an ask was attempted; otherwise `n_a` on save. */
export type PostRunAskTiming = "too_early" | "on_time" | "too_late" | "n_a";

export type PostRunReuseIntent = "yes" | "maybe" | "no";

export type PostRunProofStrength = "weak" | "ok" | "strong";

export type PostRunCapture = {
  id: string;
  capturedAt: string;
  sessionId: string;
  businessNameSnapshot: string;
  businessTypeSnapshot?: string;
  /** Registry id — which proof run */
  packId: string;
  /** Snapshot of pack label at save time (human-readable) */
  packLabelSnapshot: string;
  openingMode: OpeningMode;
  offerTemplateId: string;
  /** Which offer was locked for this run, if any */
  runOfferTemplateIdSnapshot: string | null;
  offerLabelSnapshot: string;
  result: PostRunResult;
  askMade: boolean;
  askTiming: PostRunAskTiming;
  /** Did the on-screen proof feel credible */
  proofStrength: PostRunProofStrength;
  reuseSameRun: PostRunReuseIntent;
  strongestOwnerReaction: string;
  /** Which beat / moment hit hardest */
  strongestProofMoment: string;
  primaryObjection: string;
  nextStepNeeded: string;
  /** One line: what to change next visit */
  notes: string;
};
