/**
 * RFC 3 — Method Engine: resolves effective method postures for engines and session state.
 * Only DaNI is enabled; other MethodIds are typed placeholders (same effective behavior as DaNI today).
 */
import type {
  ClosePosture,
  ClosePostureRules,
  MethodContext,
  MethodDefinition,
  MethodId,
  MethodStrategySnapshot,
  ProofPosture,
  ProofPostureWeights,
} from "@/types/method";
import { isValidMethodId } from "@/types/method";
import type { Session } from "@/types/session";
import type { ReadinessThresholds } from "@/types/timing";

export const DEFAULT_METHOD_ID: MethodId = "dani";

/** DaNI / evidence_arc — numerically matches pre-RFC4 proof confidence (all weights 1, sensitivities 1). */
const PROOF_WEIGHTS_EVIDENCE_ARC: ProofPostureWeights = {
  contextWeight: 1,
  painWeight: 1,
  mechanismWeight: 1,
  outcomeWeight: 1,
  credibilityWeight: 1,
  actionWeight: 1,
  trustSensitivity: 1,
  urgencySensitivity: 1,
};

/** Placeholder tuning — not reachable while only DaNI is enabled (effective method falls back). */
const PROOF_WEIGHTS_DIAGNOSTIC_TRUST: ProofPostureWeights = {
  contextWeight: 1.08,
  painWeight: 1.05,
  mechanismWeight: 0.98,
  outcomeWeight: 1,
  credibilityWeight: 1.12,
  actionWeight: 0.98,
  trustSensitivity: 1.08,
  urgencySensitivity: 0.98,
};

const PROOF_WEIGHTS_CHALLENGE_REFRAME: ProofPostureWeights = {
  contextWeight: 0.98,
  painWeight: 1.12,
  mechanismWeight: 1.04,
  outcomeWeight: 1.06,
  credibilityWeight: 1.04,
  actionWeight: 1,
  trustSensitivity: 0.95,
  urgencySensitivity: 1.1,
};

const PROOF_WEIGHTS_DIRECT_CONVICTION: ProofPostureWeights = {
  contextWeight: 0.95,
  painWeight: 1.02,
  mechanismWeight: 1,
  outcomeWeight: 1.1,
  credibilityWeight: 1,
  actionWeight: 1.12,
  trustSensitivity: 0.92,
  urgencySensitivity: 1.15,
};

/** DaNI / earned_commitment — matches legacy close thresholds (bias fields 0). */
const CLOSE_RULES_EARNED_COMMITMENT: ClosePostureRules = {
  directCommitThreshold: 78,
  softCommitThreshold: 58,
  trustRecoveryBias: 0,
  urgencyBias: 0,
  followupBias: 0,
};

/** Placeholder — for when guided_discovery ships. */
const CLOSE_RULES_GUIDED_DISCOVERY: ClosePostureRules = {
  directCommitThreshold: 80,
  softCommitThreshold: 62,
  trustRecoveryBias: -0.02,
  urgencyBias: -1,
  followupBias: 2,
};

const CLOSE_RULES_CONSTRUCTIVE_TENSION: ClosePostureRules = {
  directCommitThreshold: 76,
  softCommitThreshold: 56,
  trustRecoveryBias: 0.03,
  urgencyBias: 1,
  followupBias: 0,
};

const CLOSE_RULES_DIRECT_ASK: ClosePostureRules = {
  directCommitThreshold: 74,
  softCommitThreshold: 55,
  trustRecoveryBias: -0.03,
  urgencyBias: 2,
  followupBias: -1,
};

/**
 * Proof weighting by posture. Disabled methods resolve to DaNI postures before engines run.
 */
export function getProofPostureWeights(posture: ProofPosture): ProofPostureWeights {
  switch (posture) {
    case "evidence_arc":
      return PROOF_WEIGHTS_EVIDENCE_ARC;
    case "diagnostic_trust":
      return PROOF_WEIGHTS_DIAGNOSTIC_TRUST;
    case "challenge_reframe":
      return PROOF_WEIGHTS_CHALLENGE_REFRAME;
    case "direct_conviction":
      return PROOF_WEIGHTS_DIRECT_CONVICTION;
    default:
      return PROOF_WEIGHTS_EVIDENCE_ARC;
  }
}

export function getClosePostureRules(posture: ClosePosture): ClosePostureRules {
  switch (posture) {
    case "earned_commitment":
      return CLOSE_RULES_EARNED_COMMITMENT;
    case "guided_discovery":
      return CLOSE_RULES_GUIDED_DISCOVERY;
    case "constructive_tension":
      return CLOSE_RULES_CONSTRUCTIVE_TENSION;
    case "direct_ask":
      return CLOSE_RULES_DIRECT_ASK;
    default:
      return CLOSE_RULES_EARNED_COMMITMENT;
  }
}

/** Aligns with close-engine not-ready neg ratio base (RFC 4–5). */
const READINESS_AMBIGUITY_BASE = 0.28;

/**
 * RFC 5 — readiness floors derived from close posture + RFC 4 rule offsets.
 * DaNI (`earned_commitment`) matches legacy implicit floors when biases are 0.
 */
export function getReadinessThresholds(posture: ClosePosture): ReadinessThresholds {
  const r = getClosePostureRules(posture);
  return {
    softCommitThreshold: r.softCommitThreshold,
    directCommitThreshold: r.directCommitThreshold,
    trustFloor: 55 + r.trustRecoveryBias,
    urgencyFloor: r.softCommitThreshold,
    ambiguityTolerance: READINESS_AMBIGUITY_BASE + r.trustRecoveryBias * 0.5,
  };
}

/**
 * RFC 5 — how much rep close confidence vs proof confidence feeds readiness score.
 * DaNI keeps the historical 0.55 / 0.45 split.
 */
export function getReadinessScoreBlend(posture: ClosePosture): { recWeight: number; proofWeight: number } {
  switch (posture) {
    case "earned_commitment":
      return { recWeight: 0.55, proofWeight: 0.45 };
    case "guided_discovery":
      return { recWeight: 0.5, proofWeight: 0.5 };
    case "constructive_tension":
      return { recWeight: 0.52, proofWeight: 0.48 };
    case "direct_ask":
      return { recWeight: 0.58, proofWeight: 0.42 };
    default:
      return { recWeight: 0.55, proofWeight: 0.45 };
  }
}

const METHOD_REGISTRY: Record<MethodId, MethodDefinition> = {
  dani: {
    id: "dani",
    label: "DaNI",
    visibility: "neutralized_public",
    proofPosture: "evidence_arc",
    closePosture: "earned_commitment",
    description:
      "Deal Activation & New Income — tablet-first, in-person B2B sales execution: proof-driven demo, real-time rep intelligence, post-call improvement.",
    internalGuidanceTone: "Disciplined, evidence-first, one clear next step.",
    publicNeutralityRequired: true,
    enabled: true,
  },
  consultative: {
    id: "consultative",
    label: "Consultative",
    visibility: "internal_only",
    proofPosture: "diagnostic_trust",
    closePosture: "guided_discovery",
    description: "Placeholder — not implemented.",
    internalGuidanceTone: "Reserved.",
    publicNeutralityRequired: true,
    enabled: false,
  },
  challenger: {
    id: "challenger",
    label: "Challenger",
    visibility: "internal_only",
    proofPosture: "challenge_reframe",
    closePosture: "constructive_tension",
    description: "Placeholder — not implemented.",
    internalGuidanceTone: "Reserved.",
    publicNeutralityRequired: true,
    enabled: false,
  },
  aggressive: {
    id: "aggressive",
    label: "Aggressive / direct",
    visibility: "internal_only",
    proofPosture: "direct_conviction",
    closePosture: "direct_ask",
    description: "Placeholder — not implemented.",
    internalGuidanceTone: "Reserved.",
    publicNeutralityRequired: true,
    enabled: false,
  },
};

export function getMethodDefinition(id: MethodId): MethodDefinition {
  return METHOD_REGISTRY[id];
}

/**
 * Stored method id → effective id for engines. Disabled methods resolve to DaNI until implemented.
 */
export function resolveEffectiveMethodId(stored: MethodId | undefined | null): MethodId {
  const raw = stored && isValidMethodId(stored) ? stored : DEFAULT_METHOD_ID;
  const def = METHOD_REGISTRY[raw];
  if (def?.enabled) return raw;
  return DEFAULT_METHOD_ID;
}

export function buildMethodContext(storedMethodId: MethodId | undefined | null): MethodContext {
  const activeMethodId = resolveEffectiveMethodId(storedMethodId);
  const def = getMethodDefinition(activeMethodId);
  return {
    activeMethodId,
    proofPosture: def.proofPosture,
    closePosture: def.closePosture,
    visibility: def.visibility,
  };
}

export function getMethodContextForSession(session: Session | null | undefined): MethodContext {
  return buildMethodContext(session?.activeMethodId ?? undefined);
}

export function createMethodStrategySnapshot(ctx: MethodContext): MethodStrategySnapshot {
  return {
    methodId: ctx.activeMethodId,
    proofPosture: ctx.proofPosture,
    closePosture: ctx.closePosture,
    generatedAt: new Date().toISOString(),
  };
}

export function createInitialMethodStrategySnapshot(): MethodStrategySnapshot {
  return createMethodStrategySnapshot(buildMethodContext(DEFAULT_METHOD_ID));
}
