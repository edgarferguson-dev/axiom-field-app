/** Scout enrichment: gap diagnosis + neighborhood stats (local session only). */

export type GapSeverity = "high" | "medium";

export type GapItem = {
  type: string;
  label: string;
  severity: GapSeverity;
};

export type GapDiagnosis = {
  gaps: GapItem[];
  primaryGap: string;
  estimatedMonthlyLeakage: number;
  avgTicket: number;
};

/** Aggregate counts from Places nearby search — supportive context only, not gap diagnosis. */
export type NeighborhoodComparison = {
  totalNearby: number;
  withBooking: number;
  withHighRating: number;
  avgRating: number;
  avgReviews: number;
};

/** Explicit lifecycle for optional neighborhood enrichment (separate from `GapDiagnosis`). */
export type NeighborhoodComparisonStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

export type NeighborhoodComparisonState = {
  status: NeighborhoodComparisonStatus;
  /** Present when `status === "success"` and counts are usable for UI. */
  data?: NeighborhoodComparison;
  /** Optional neutral note for rep (empty / error), not shown to owner as blame. */
  detail?: string;
};

export const NEIGHBORHOOD_CONTEXT_IDLE: NeighborhoodComparisonState = { status: "idle" };

export function neighborhoodDataIsUseful(d: NeighborhoodComparison | undefined | null): boolean {
  return typeof d?.totalNearby === "number" && Number.isFinite(d.totalNearby) && d.totalNearby > 0;
}

/** Use in pre-call / intel templates only when Maps-backed counts exist. */
export function neighborhoodIntelPayload(ctx: NeighborhoodComparisonState): NeighborhoodComparison | null {
  if (ctx.status !== "success" || !ctx.data || !neighborhoodDataIsUseful(ctx.data)) return null;
  return ctx.data;
}

/** Poster / chart consumers — same gating as intel. */
export function neighborhoodPosterPayload(ctx: NeighborhoodComparisonState): NeighborhoodComparison | null {
  return neighborhoodIntelPayload(ctx);
}

export type FieldRepCard = {
  displayName: string;
  org: string;
  phone: string;
  email: string;
};

export const DEFAULT_FIELD_REP_CARD: FieldRepCard = {
  displayName: "Edgar",
  org: "Axiom Bedford",
  phone: "",
  email: "",
};

/** Pain-template fields not in `PreCallIntel` — shown on scout brief UI. */
export type PainBriefExtras = {
  openingQuestion: string;
  openingStatement: string;
  followUpProbe: string;
  listenFor: string[];
  firstBeatNote: string;
  /** Short label for coaching / backup (e.g. top high-severity gap). */
  primaryGapShortLabel?: string;
  /** One-line diagnosis headline for the pain card. */
  primaryPainHeadline?: string;
};
