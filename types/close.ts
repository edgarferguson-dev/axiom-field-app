import type { TimingQuality } from "@/types/timing";

/**
 * RFC 2 — Close Engine domain contracts.
 * Scope: recommendation, event telemetry, assessment, recap/disposition coaching — rule-based and proof-grounded.
 * Not: pricing, checkout, proposals, contracts, CRM stages, or method packs (keep those out of this module).
 * `CloseReadinessState` avoids collision with session `closeState` (demo rail / DemoCloseState).
 */

export type CloseReadinessState =
  | "not_ready"
  | "advance_ready"
  | "soft_commit_ready"
  | "commit_ready"
  | "recover_required";

/** Spec alias — readiness for commitment, not the demo rail `closeState`. */
export type CloseState = CloseReadinessState;

export type ClosePath =
  | "clarify_value"
  | "re-anchor_pain"
  | "restate_outcome"
  | "credibility_recovery"
  | "micro_commitment"
  | "direct_commitment"
  | "schedule_followup";

export interface CloseRecommendation {
  state: CloseReadinessState;
  path: ClosePath;
  rationale: string;
  nextMoveLabel: string;
  repGuidance: string;
  blockingIssue?: string;
  confidence: number;
}

export interface CloseEvent {
  type: "prompted" | "attempted" | "deferred" | "blocked" | "advanced";
  closePath: ClosePath;
  note?: string;
  timestamp: string;
}

/** How logged close attempts line up with readiness — for recap coaching only (private). */
export type CloseTimingQuality = "aligned" | "early" | "late" | "unclear";

/**
 * Canonical close snapshot for private demo, disposition, and recap.
 * `recommendation` is always produced alongside the scored fields — one derivation, no drift.
 */
export interface CloseAssessment {
  finalState: CloseReadinessState;
  recommendedPath: ClosePath;
  strongestCloseDriver?: string;
  primaryBlocker?: string;
  readinessScore: number;
  /** Paths the rep logged during demo (deduped order). */
  attemptedPaths: ClosePath[];
  /** Same moment as the tactical line below — never recomputed elsewhere. */
  recommendation: CloseRecommendation;
  timingQuality: CloseTimingQuality;
  /** RFC 5 — internal timing classification; maps to `timingQuality` for recap copy. */
  timingQualityDetail?: TimingQuality;
  timingCoaching?: string;
}
