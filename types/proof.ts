/**
 * RFC 1 — Proof Engine domain contracts (single source of truth).
 * Internal methodology labels stay off the public buyer surface via presentation helpers.
 */

export type ProofType =
  | "context"
  | "pain"
  | "mechanism"
  | "outcome"
  | "credibility"
  | "action";

export type BuyerReaction = "positive" | "neutral" | "negative" | "unclear";

export type ProofPriority = "primary" | "secondary" | "fallback";

export interface ProofBlock {
  id: string;
  type: ProofType;
  title: string;
  objective: string;
  buyerFacingClaim: string;
  internalReason: string;
  priority: ProofPriority;
  isRequired: boolean;
}

export interface ProofSequence {
  id: string;
  blocks: ProofBlock[];
  recommendedStartBlockId: string;
  fallbackBlockIds: string[];
}

export interface ProofEvent {
  proofBlockId: string;
  status: "shown" | "skipped" | "revisited";
  buyerReaction: BuyerReaction;
  repNote?: string;
  timestamp: string;
}

export interface ProofBrief {
  businessContext: string;
  likelyTrustBarrier: string;
  recommendedProofAngle: string;
  recommendedSequenceId: string;
  rationale: string;
}

export interface ProofAssessment {
  strongestProofBlockId?: string;
  weakestProofBlockId?: string;
  unresolvedTrustGap?: string;
  proofConfidence: number;
}
