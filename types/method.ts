/**
 * RFC 3 — Method domain contracts (internal). Public buyer surfaces stay methodology-neutral.
 */

export type MethodId = "dani" | "consultative" | "challenger" | "aggressive";

export type MethodVisibility = "internal_only" | "neutralized_public";

export type ProofPosture =
  | "evidence_arc"
  | "diagnostic_trust"
  | "challenge_reframe"
  | "direct_conviction";

export type ClosePosture =
  | "earned_commitment"
  | "guided_discovery"
  | "constructive_tension"
  | "direct_ask";

export interface MethodDefinition {
  id: MethodId;
  label: string;
  visibility: MethodVisibility;
  proofPosture: ProofPosture;
  closePosture: ClosePosture;
  description: string;
  internalGuidanceTone: string;
  publicNeutralityRequired: boolean;
  enabled: boolean;
}

export interface MethodContext {
  activeMethodId: MethodId;
  proofPosture: ProofPosture;
  closePosture: ClosePosture;
  visibility: MethodVisibility;
}

export interface MethodStrategySnapshot {
  methodId: MethodId;
  proofPosture: ProofPosture;
  closePosture: ClosePosture;
  generatedAt: string;
}

/** RFC 4 — per-proof-type emphasis + sensitivity knobs (internal; engines only). */
export interface ProofPostureWeights {
  contextWeight: number;
  painWeight: number;
  mechanismWeight: number;
  outcomeWeight: number;
  credibilityWeight: number;
  actionWeight: number;
  trustSensitivity: number;
  urgencySensitivity: number;
}

/** RFC 4 — close readiness thresholds + bias offsets (internal; engines only). */
export interface ClosePostureRules {
  directCommitThreshold: number;
  softCommitThreshold: number;
  trustRecoveryBias: number;
  urgencyBias: number;
  followupBias: number;
}

export const METHOD_IDS: readonly MethodId[] = [
  "dani",
  "consultative",
  "challenger",
  "aggressive",
] as const;

export function isValidMethodId(value: unknown): value is MethodId {
  return typeof value === "string" && (METHOD_IDS as readonly string[]).includes(value);
}
