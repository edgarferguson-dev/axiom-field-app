import type { OpeningMode } from "@/types/presentationPack";

/** Field visit log — fast taps, local-first (Phase 7G commitment path). */
export type PostRunResult =
  | "no_interest"
  | "interested_not_now"
  | "follow_up_needed"
  | "wants_info_sent"
  | "book_follow_up"
  | "soft_commit"
  | "hard_commit";

/** Logged only when an ask was attempted; otherwise `n_a` on save. */
export type PostRunAskTiming = "too_early" | "on_time" | "too_late" | "n_a";

export type PostRunReuseIntent = "yes" | "maybe" | "no";

export type PostRunProofStrength = "weak" | "ok" | "strong";

/** Field-sprint — relationship to merchant. */
export type PostRunRelationship = "stranger" | "acquaintance" | "friend-family";

/** Field-sprint — coaching cue usefulness. */
export type PostRunCoachingCueUsed = "helped" | "wrong" | "ignored" | "not-needed";

/** Field-sprint — device in room. */
export type PostRunPhoneFormFactor = "fine" | "awkward" | "screen-too-small" | "other";

/** Field-sprint — would use app again. */
export type PostRunWouldReuse = "yes" | "yes-with-changes" | "no";

/** Target wedge for reporting (orthogonal to free-text scout `type`). */
export type PostRunMerchantCategory =
  | "barbershop"
  | "salon-beauty"
  | "trainer-fitness"
  | "cpa-tax"
  | "contractor"
  | "other-merchant";

const POST_RUN_RESULTS: readonly PostRunResult[] = [
  "no_interest",
  "interested_not_now",
  "follow_up_needed",
  "wants_info_sent",
  "book_follow_up",
  "soft_commit",
  "hard_commit",
] as const;

const POST_RUN_RELATIONSHIPS: readonly PostRunRelationship[] = [
  "stranger",
  "acquaintance",
  "friend-family",
] as const;

const POST_RUN_COACHING_CUES: readonly PostRunCoachingCueUsed[] = [
  "helped",
  "wrong",
  "ignored",
  "not-needed",
] as const;

const POST_RUN_PHONE_FORM: readonly PostRunPhoneFormFactor[] = [
  "fine",
  "awkward",
  "screen-too-small",
  "other",
] as const;

const POST_RUN_WOULD_REUSE: readonly PostRunWouldReuse[] = [
  "yes",
  "yes-with-changes",
  "no",
] as const;

const POST_RUN_MERCHANT: readonly PostRunMerchantCategory[] = [
  "barbershop",
  "salon-beauty",
  "trainer-fitness",
  "cpa-tax",
  "contractor",
  "other-merchant",
] as const;

/** Migrate legacy persisted values (Phase 7F → 7G). */
export function coercePostRunResult(raw: unknown): PostRunResult {
  if (raw === "interested") return "interested_not_now";
  if (raw === "follow_up") return "follow_up_needed";
  if (typeof raw === "string" && (POST_RUN_RESULTS as readonly string[]).includes(raw)) {
    return raw as PostRunResult;
  }
  return "follow_up_needed";
}

export function coercePostRunRelationship(raw: unknown): PostRunRelationship {
  if (typeof raw === "string" && (POST_RUN_RELATIONSHIPS as readonly string[]).includes(raw)) {
    return raw as PostRunRelationship;
  }
  return "stranger";
}

export function coercePostRunReachedAsk(raw: unknown, askMadeFallback: boolean): boolean {
  if (typeof raw === "boolean") return raw;
  return askMadeFallback;
}

export function coercePostRunBeatId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length ? t : null;
}

export function coercePostRunCoachingCueUsed(raw: unknown): PostRunCoachingCueUsed | null {
  if (typeof raw === "string" && (POST_RUN_COACHING_CUES as readonly string[]).includes(raw)) {
    return raw as PostRunCoachingCueUsed;
  }
  return null;
}

export function coercePostRunSurpriseNote(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  return t.length > 500 ? t.slice(0, 500) : t;
}

export function coercePostRunInteractionMinutes(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  return null;
}

export function coercePostRunPhoneFormFactor(raw: unknown): PostRunPhoneFormFactor | null {
  if (typeof raw === "string" && (POST_RUN_PHONE_FORM as readonly string[]).includes(raw)) {
    return raw as PostRunPhoneFormFactor;
  }
  return null;
}

export function coercePostRunWouldReuse(
  raw: unknown,
  reuseSameRun: PostRunReuseIntent
): PostRunWouldReuse {
  if (typeof raw === "string" && (POST_RUN_WOULD_REUSE as readonly string[]).includes(raw)) {
    return raw as PostRunWouldReuse;
  }
  if (reuseSameRun === "yes") return "yes";
  if (reuseSameRun === "maybe") return "yes-with-changes";
  return "no";
}

export function coercePostRunMerchantCategory(raw: unknown): PostRunMerchantCategory | null {
  if (typeof raw === "string" && (POST_RUN_MERCHANT as readonly string[]).includes(raw)) {
    return raw as PostRunMerchantCategory;
  }
  return null;
}

export type PostRunCapture = {
  id: string;
  capturedAt: string;
  sessionId: string;
  /** Phase 7G — local fingerprint (place / phone / web / loc / name). */
  identityKey: string;
  businessNameSnapshot: string;
  businessTypeSnapshot?: string;
  /** Field-sprint — wedge category for reporting (optional). */
  merchantCategory: PostRunMerchantCategory | null;
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
  /** One line: opening angle for the next visit */
  leadWithNextVisit: string;
  /** One line: what to change next visit */
  notes: string;

  /** Field-sprint — rep ↔ merchant relationship */
  relationship: PostRunRelationship;
  /** Field-sprint — reached the ask moment */
  reachedAsk: boolean;
  /** Proof sequence block id — best reaction */
  strongestBeat: string | null;
  /** Proof sequence block id — weak / skipped; null = N/A */
  weakestBeat: string | null;
  coachingCueUsed: PostRunCoachingCueUsed | null;
  surpriseNote: string | null;
  interactionMinutes: number | null;
  phoneFormFactor: PostRunPhoneFormFactor | null;
  wouldReuse: PostRunWouldReuse;
};
