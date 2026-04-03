/**
 * RFC 2 — Close Engine (deterministic, serializable).
 * Inputs: proof state (via `buildSessionForCloseEngine` + RFC 1), live signal, buyer mode, close events.
 * Does not implement pricing workflows, deal objects, or execution — only guidance + assessment + timing coaching.
 */
import type { Session, SignalColor } from "@/types/session";
import type { ClosePosture, MethodContext } from "@/types/method";
import type { ProofAssessment, ProofType } from "@/types/proof";
import type { BuyerState } from "@/types/demo";
import type {
  CloseAssessment,
  CloseEvent,
  ClosePath,
  CloseReadinessState,
  CloseRecommendation,
  CloseTimingQuality,
} from "@/types/close";
import {
  deriveProofAssessment,
  getBlockById,
  normalizeCurrentProofBlockId,
} from "@/lib/flows/proofEngine";
import {
  getClosePostureRules,
  getReadinessScoreBlend,
  getReadinessThresholds,
} from "@/lib/flows/methodEngine";
import type { ReadinessThresholds, TimingQuality } from "@/types/timing";

export type CloseEngineInput = {
  session: Session;
  liveSignal: SignalColor;
  buyerState: BuyerState;
  /** RFC 3–5 — posture context (single runtime method input for close/timing). */
  methodContext?: MethodContext;
};

export type CloseAssessmentInput = {
  session: Session;
  liveSignal: SignalColor;
  buyerState: BuyerState;
  closeEvents: CloseEvent[];
  /** RFC 3–5 — posture context (single runtime method input for close/timing). */
  methodContext?: MethodContext;
};

const ARC_PROGRESS_GATE = 0.38;
const ARC_PENALTY_BASE = 12;
const RECOVER_NEG_RATIO_BASE = 0.45;
const NOT_READY_NEG_RATIO_BASE = 0.28;
/** `not_ready` branch uses proofConfidence < softCommitThreshold - this offset (DaNI: 58 - 20 = 38). */
const NOT_READY_PROOF_OFFSET = 20;

export function formatClosePathLabel(p: ClosePath): string {
  return p.replace(/_/g, " ").replace(/-/g, " ");
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Align session proof pointers and assessment with RFC 1 derivation (same inputs as refreshProofAssessment).
 */
export function buildSessionForCloseEngine(
  session: Session,
  methodContext?: MethodContext
): Session {
  const seq = session.proofSequence;
  const events = session.proofEvents ?? [];
  if (!seq?.blocks.length) {
    return { ...session };
  }
  const proofAssessment = deriveProofAssessment(seq, events, methodContext);
  const start = seq.recommendedStartBlockId || seq.blocks[0]?.id || "";
  const currentProofBlockId = normalizeCurrentProofBlockId(seq, session.currentProofBlockId, start);
  return {
    ...session,
    proofAssessment: proofAssessment ?? session.proofAssessment,
    currentProofBlockId,
  };
}

function proofArcProgress(session: Session): number {
  const seq = session.proofSequence;
  if (!seq?.blocks.length) return 1;
  const id = session.currentProofBlockId;
  if (!id) return 0;
  const i = seq.blocks.findIndex((b) => b.id === id);
  if (i < 0) return 0;
  return (i + 1) / seq.blocks.length;
}

function weakestProofType(session: Session): ProofType | null {
  const id = session.proofAssessment?.weakestProofBlockId;
  if (!id || !session.proofSequence) return null;
  return getBlockById(session.proofSequence, id)?.type ?? null;
}

function requiredSkippedCount(session: Session): number {
  const seq = session.proofSequence;
  if (!seq?.blocks.length) return 0;
  const requiredIds = seq.blocks.filter((b) => b.isRequired).map((b) => b.id);
  const events = session.proofEvents ?? [];
  let n = 0;
  for (let i = 0; i < requiredIds.length; i += 1) {
    const id = requiredIds[i];
    if (events.some((e) => e.proofBlockId === id && e.status === "skipped")) n += 1;
  }
  return n;
}

/** Last N proof events scoped to the active sequence (RFC 1 orphan protection). */
function recentNegativeRatio(session: Session): number {
  const seq = session.proofSequence;
  const events = session.proofEvents ?? [];
  if (!seq?.blocks.length || events.length === 0) return 0;
  const validIds = new Set(seq.blocks.map((b) => b.id));
  const scoped = events.filter((e) => validIds.has(e.proofBlockId));
  if (scoped.length === 0) return 0;
  const tail = scoped.slice(-8);
  const neg = tail.filter((e) => e.buyerReaction === "negative").length;
  const unclear = tail.filter((e) => e.buyerReaction === "unclear").length;
  return (neg * 1 + unclear * 0.35) / Math.max(1, tail.length);
}

function mapTimingDetailToLegacy(detail: TimingQuality): CloseTimingQuality {
  switch (detail) {
    case "premature":
      return "early";
    case "well_timed":
      return "aligned";
    case "late":
      return "late";
    case "misaligned":
      return "unclear";
  }
}

/**
 * RFC 5 — posture-aware close timing. `TimingQuality` is stored as `timingQualityDetail`;
 * `CloseTimingQuality` stays recap-compatible. DaNI (`earned_commitment`) preserves legacy branch outcomes.
 */
function deriveTimingQuality(
  rec: CloseRecommendation,
  closeEvents: CloseEvent[],
  ctx: { closePosture: ClosePosture }
): { timingQuality: CloseTimingQuality; timingQualityDetail: TimingQuality; timingCoaching?: string } {
  const attempted = closeEvents.filter((e) => e.type === "attempted").length;
  const deferred = closeEvents.filter((e) => e.type === "deferred").length;
  const blocked = closeEvents.filter((e) => e.type === "blocked").length;
  const posture = ctx.closePosture;
  /** `direct_ask` flags “late” sooner; DaNI keeps 2. */
  const lateMinAttempts = posture === "direct_ask" ? 1 : 2;

  let detail: TimingQuality;
  let coaching: string | undefined;

  if (attempted === 0 && deferred === 0 && blocked === 0) {
    detail = "misaligned";
    coaching =
      "Log at least one close moment next time so timing feedback reflects what you actually tried.";
  } else {
    const heavy: CloseReadinessState[] = ["recover_required", "not_ready"];
    if (heavy.includes(rec.state) && attempted > 0) {
      detail = "premature";
      coaching =
        posture === "constructive_tension"
          ? "Pressure showed before belief caught up — re-anchor proof, then one calm ask."
          : "Pressure went up while proof or room still needed work — stabilize belief, then ask.";
    } else if ((rec.state === "commit_ready" || rec.state === "soft_commit_ready") && attempted > 0) {
      detail = "well_timed";
      coaching =
        posture === "guided_discovery"
          ? "Your ask matched the room’s pace — discovery and commitment stayed in sync."
          : "Your ask tracked how strong proof and the room felt in the moment.";
    } else if (attempted === 0 && deferred > 0) {
      detail = "well_timed";
      coaching =
        posture === "direct_ask"
          ? "You held until the opening was real — right restraint for a direct lane."
          : "You held timing when the room wasn’t there — that protects trust.";
    } else if (
      attempted >= lateMinAttempts &&
      (rec.state === "advance_ready" || rec.state === "not_ready")
    ) {
      detail = "late";
      coaching =
        "Several tries while readiness was still building — tighten proof, then one clear ask.";
    } else {
      detail = "misaligned";
      coaching =
        "Mixed signals in the log — pick one primary ask next visit and track it.";
    }
  }

  return {
    timingQuality: mapTimingDetailToLegacy(detail),
    timingQualityDetail: detail,
    timingCoaching: coaching,
  };
}

function resolvePrimaryBlocker(
  rec: CloseRecommendation,
  pa: ProofAssessment | null | undefined,
  closeEvents: CloseEvent[],
  closePosture: ClosePosture
): string | undefined {
  const attempted = closeEvents.filter((e) => e.type === "attempted");
  const trustGap = pa?.unresolvedTrustGap?.trim();

  if (closePosture === "guided_discovery" && trustGap) {
    return trustGap;
  }
  if (closePosture === "constructive_tension" && rec.blockingIssue && trustGap) {
    return `${rec.blockingIssue} — ${trustGap}`;
  }
  if (rec.blockingIssue) return rec.blockingIssue;
  if (trustGap) return trustGap;
  if (attempted.length === 0 && closeEvents.length > 0) {
    return "Close wasn’t attempted in the log.";
  }
  return undefined;
}

function resolveStrongestCloseDriver(
  strongestTitle: string | undefined,
  proofConfidence: number | undefined,
  thresholds: ReadinessThresholds
): string | undefined {
  const floor = thresholds.directCommitThreshold - 18;
  if (strongestTitle) return strongestTitle;
  if (proofConfidence != null && proofConfidence >= floor) {
    return "Consistent proof moments";
  }
  return undefined;
}

/**
 * Rule-based close readiness and path from normalized proof + room signals.
 */
export function deriveCloseRecommendation(input: CloseEngineInput): CloseRecommendation {
  const session = buildSessionForCloseEngine(input.session, input.methodContext);
  const { liveSignal, buyerState } = input;

  const rules = input.methodContext
    ? getClosePostureRules(input.methodContext.closePosture)
    : getClosePostureRules("earned_commitment");
  const recoverNegRatio = RECOVER_NEG_RATIO_BASE + rules.trustRecoveryBias;
  const notReadyNegRatio = NOT_READY_NEG_RATIO_BASE + rules.trustRecoveryBias * 0.5;
  const redProofFloor = 60 + rules.trustRecoveryBias * 0.5;
  const coldProofFloor = 55 + rules.trustRecoveryBias;
  const notReadyProofCeiling = rules.softCommitThreshold - NOT_READY_PROOF_OFFSET;
  const arcPenalty = ARC_PENALTY_BASE + rules.urgencyBias;

  const pa = session.proofAssessment;
  const rawConfidence = pa?.proofConfidence ?? 0;
  const arcProgress = proofArcProgress(session);
  const proofConfidence =
    arcProgress > 0 && arcProgress < ARC_PROGRESS_GATE
      ? Math.max(0, rawConfidence - arcPenalty)
      : rawConfidence;

  const trustGap = pa?.unresolvedTrustGap?.trim();
  const skippedReq = requiredSkippedCount(session);
  const negRatio = recentNegativeRatio(session);
  const weakType = weakestProofType(session);

  let state: CloseReadinessState;
  let path: ClosePath;
  let rationale: string;
  let nextMoveLabel: string;
  let repGuidance: string;
  let blockingIssue: string | undefined;
  let confidence: number;

  const warmBuyer =
    buyerState === "curious" || buyerState === "ready_to_buy" || buyerState === "needs_reassurance";
  const coldBuyer = buyerState === "skeptical" || buyerState === "price_resistant";
  const splitBuyer = buyerState === "distracted";

  if (
    trustGap ||
    negRatio >= recoverNegRatio ||
    skippedReq >= 2 ||
    (liveSignal === "red" && proofConfidence < redProofFloor) ||
    (coldBuyer && proofConfidence < coldProofFloor)
  ) {
    state = "recover_required";
    if (weakType === "credibility" || trustGap?.toLowerCase().includes("trust")) {
      path = "credibility_recovery";
      rationale = "Trust or proof still needs reinforcement before a clean ask.";
      nextMoveLabel = "Bring one concrete proof point";
      repGuidance =
        "Pause the ask. Name a similar situation, show how risk was handled, then re-check agreement.";
    } else if (weakType === "pain" || weakType === "context") {
      path = "re-anchor_pain";
      rationale = "Urgency or relevance is still thin — re-anchor cost of waiting.";
      nextMoveLabel = "Re-anchor the cost";
      repGuidance = "One crisp story: what it costs to wait another month. Then pause for nod.";
    } else {
      path = "clarify_value";
      rationale = "Value is still fuzzy — clarify outcomes before commitment language.";
      nextMoveLabel = "Clarify the outcome";
      repGuidance = "Translate features into one measurable outcome they care about this quarter.";
    }
    blockingIssue = trustGap ?? (skippedReq ? "Required proof moments were skipped." : "Room resistance is elevated.");
    confidence = clamp(55 + proofConfidence * 0.25 - negRatio * 40, 15, 85);
  } else if (proofConfidence < notReadyProofCeiling || negRatio >= notReadyNegRatio) {
    state = "not_ready";
    path = weakType === "mechanism" || weakType === "outcome" ? "restate_outcome" : "clarify_value";
    rationale = "Belief isn’t strong enough yet for a hard ask.";
    nextMoveLabel = path === "restate_outcome" ? "Restate the outcome" : "Sharpen the value";
    repGuidance =
      path === "restate_outcome"
        ? "Walk one outcome scenario end-to-end in their words — no new slides."
        : "Ask what ‘success in 30 days’ looks like, then mirror it back.";
    blockingIssue = "Proof or clarity still below the bar for commitment.";
    confidence = clamp(40 + proofConfidence * 0.35, 20, 70);
  } else if (splitBuyer && liveSignal !== "green") {
    state = "advance_ready";
    path = "schedule_followup";
    rationale = "Attention is split — lock a specific follow-up rather than forcing a decision.";
    nextMoveLabel = "Book the follow-up";
    repGuidance = "Offer two time windows; keep the commitment small and calendar-specific.";
    confidence = clamp(50 + proofConfidence * 0.3 + rules.followupBias, 35, 80);
  } else if (proofConfidence < rules.softCommitThreshold || liveSignal === "yellow") {
    state = "advance_ready";
    path = weakType === "outcome" ? "restate_outcome" : "clarify_value";
    rationale = "Enough to keep the decision conversation moving — not enough for a full commit ask.";
    nextMoveLabel = weakType === "outcome" ? "Tighten the outcome" : "Check understanding";
    repGuidance = "Confirm one number or one workflow step they believe in, then advance.";
    confidence = clamp(48 + proofConfidence * 0.4, 30, 82);
  } else if (
    proofConfidence >= rules.directCommitThreshold &&
    liveSignal === "green" &&
    !trustGap &&
    warmBuyer &&
    negRatio < 0.2
  ) {
    state = "commit_ready";
    path = "direct_commitment";
    rationale = "Proof and room line up — you can ask for a clear yes on a defined next step.";
    nextMoveLabel = "Ask for the decision";
    repGuidance = "Name the step, the owner, and the timeframe in one sentence. Stay silent after.";
    confidence = clamp(62 + proofConfidence * 0.28, 55, 95);
  } else if (proofConfidence >= rules.softCommitThreshold && (warmBuyer || liveSignal === "green")) {
    state = "soft_commit_ready";
    path = "micro_commitment";
    rationale = "Belief is there — use a low-friction next step before a full commit.";
    nextMoveLabel = "Micro-commit";
    repGuidance = "Trial, pilot, or single workflow — reversible, time-boxed, easy to say yes.";
    confidence = clamp(52 + proofConfidence * 0.35, 40, 88);
  } else {
    state = "advance_ready";
    path = "restate_outcome";
    rationale = "Solid proof but room isn’t hot — restate outcome, then re-check.";
    nextMoveLabel = "Confirm the win";
    repGuidance = "Summarize what they said they want; ask if anything still feels risky.";
    confidence = clamp(45 + proofConfidence * 0.38, 32, 78);
  }

  return {
    state,
    path,
    rationale,
    nextMoveLabel,
    repGuidance,
    blockingIssue,
    confidence: Math.round(confidence),
  };
}

function uniquePaths(events: CloseEvent[]): ClosePath[] {
  const out: ClosePath[] = [];
  const seen = new Set<ClosePath>();
  for (let i = 0; i < events.length; i += 1) {
    const e = events[i];
    if (!seen.has(e.closePath)) {
      seen.add(e.closePath);
      out.push(e.closePath);
    }
  }
  return out;
}

function uniqueAttemptedPaths(events: CloseEvent[]): ClosePath[] {
  return uniquePaths(events.filter((e) => e.type === "attempted"));
}

/**
 * Skip accidental double-taps / duplicate telemetry (same type + path within window).
 */
export function shouldAppendCloseEvent(events: CloseEvent[], next: CloseEvent, debounceMs = 2000): boolean {
  const last = events[events.length - 1];
  if (!last) return true;
  if (last.type !== next.type || last.closePath !== next.closePath) return true;
  const t0 = Date.parse(last.timestamp);
  const t1 = Date.parse(next.timestamp);
  if (Number.isNaN(t0) || Number.isNaN(t1)) return true;
  return t1 - t0 >= debounceMs;
}

/**
 * Canonical close snapshot for demo, disposition, and recap — do not reassemble scores/paths in UI.
 */
export function deriveCloseAssessment(input: CloseAssessmentInput): CloseAssessment | null {
  const normalized = buildSessionForCloseEngine(input.session, input.methodContext);
  if (!normalized.proofSequence?.blocks.length) return null;

  const rec = deriveCloseRecommendation({
    session: normalized,
    liveSignal: input.liveSignal,
    buyerState: input.buyerState,
    methodContext: input.methodContext,
  });

  const pa = normalized.proofAssessment;
  const strongestTitle = pa?.strongestProofBlockId
    ? getBlockById(normalized.proofSequence, pa.strongestProofBlockId)?.title
    : undefined;

  const closePosture: ClosePosture = input.methodContext?.closePosture ?? "earned_commitment";
  const thresholds = getReadinessThresholds(closePosture);
  const blend = getReadinessScoreBlend(closePosture);

  let readinessScore = clamp(
    rec.confidence * blend.recWeight + (pa?.proofConfidence ?? 0) * blend.proofWeight,
    0,
    100
  );

  const closeEvents = input.closeEvents;
  for (let i = 0; i < closeEvents.length; i += 1) {
    const e = closeEvents[i];
    if (e.type === "attempted") readinessScore += 4;
    if (e.type === "advanced") readinessScore += 3;
    if (e.type === "deferred") readinessScore -= 5;
    if (e.type === "blocked") readinessScore -= 12;
  }
  readinessScore = Math.round(clamp(readinessScore, 0, 100));

  const primaryBlocker = resolvePrimaryBlocker(rec, pa, closeEvents, closePosture);

  const { timingQuality, timingQualityDetail, timingCoaching } = deriveTimingQuality(rec, closeEvents, {
    closePosture,
  });

  return {
    finalState: rec.state,
    recommendedPath: rec.path,
    strongestCloseDriver: resolveStrongestCloseDriver(strongestTitle, pa?.proofConfidence, thresholds),
    primaryBlocker,
    readinessScore,
    attemptedPaths: uniqueAttemptedPaths(closeEvents),
    recommendation: rec,
    timingQuality,
    timingQualityDetail,
    timingCoaching,
  };
}
