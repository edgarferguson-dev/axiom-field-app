/**
 * RFC 5 — timing / readiness signals and thresholds (close engine).
 * `TimingQuality` maps to `CloseTimingQuality` on `CloseAssessment` for rep UI compatibility.
 */

export type TimingQuality = "premature" | "well_timed" | "late" | "misaligned";

export interface ReadinessThresholds {
  softCommitThreshold: number;
  directCommitThreshold: number;
  trustFloor: number;
  urgencyFloor: number;
  ambiguityTolerance: number;
}

export interface TimingSignals {
  readinessScore: number;
  proofConfidence: number;
  trustGapPresent: boolean;
  urgencyStrength: number;
  valueClarityStrength: number;
  recentReactionStrength: number;
}
