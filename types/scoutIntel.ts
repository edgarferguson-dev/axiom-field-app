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

export type NeighborhoodComparison = {
  totalNearby: number;
  withBooking: number;
  withHighRating: number;
  avgRating: number;
  avgReviews: number;
};

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
