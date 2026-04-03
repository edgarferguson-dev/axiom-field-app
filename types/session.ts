import type { SessionPresentationState } from "@/types/presentation";
import type {
  ProofAssessment,
  ProofBrief,
  ProofEvent,
  ProofSequence,
} from "@/types/proof";
import type { CloseAssessment, CloseEvent } from "@/types/close";
import type { MethodId, MethodStrategySnapshot } from "@/types/method";

// Pre-call types live in types/pre-call.ts.
// Imported here for use in the Session aggregate; re-exported for backward compat.
import type {
  RiskBand,
  TabletGuidance,
  ChannelMode,
  PreCallIntel,
  PreCallAIRaw,
  PreCallSource,
  PreCallResult,
  PreCallRequest,
} from "@/types/pre-call";
export type {
  RiskBand,
  TabletGuidance,
  ChannelMode,
  PreCallIntel,
  PreCallAIRaw,
  PreCallSource,
  PreCallResult,
  PreCallRequest,
} from "@/types/pre-call";

// Core phase flow
export type SessionPhase =
  | "pre-call"
  | "intake"
  | "field-read"
  | "constraints"
  | "live-demo"
  | "offer-fit"
  | "closing"
  | "debrief"
  | "disposition"
  | "recap";

// SignalColor is the canonical type; Signal is the V2B alias
export type SignalColor = "green" | "yellow" | "red";
export type Signal = SignalColor;

export type ObjectionType =
  | "price"
  | "busy"
  | "already-have"
  | "not-interested"
  | "timing";

// ── Field snapshot (on-site context) ─────────────────────────────────────────

export type FieldSnapshotKey =
  | "busy"
  | "moderate-traffic"
  | "empty"
  | "no-receptionist"
  | "owner-present"
  | "staff-only"
  | "active-lobby"
  | "quiet-storefront";

// ── Constraints ────────────────────────────────────────────────────────────

export type ConstraintKey =
  | "missed-calls"
  | "no-booking"
  | "weak-reviews"
  | "slow-follow-up"
  | "weak-online-presence"
  | "no-automation"
  | "poor-retention"
  | "no-reactivation"
  | "inconsistent-pipeline"
  | "no-nurture"
  | "owner-too-busy"
  | "no-clear-offer"
  | "low-trust"
  | "poor-lead-handling";

export type ConstraintSeverity = "high" | "medium" | "low";

export type BusinessConstraint = {
  key: ConstraintKey;
  severity: ConstraintSeverity;
  notes?: string;
};

// ── Close outcome ──────────────────────────────────────────────────────────

export type CloseOutcomeType =
  | "start-now"
  | "send-proposal"
  | "book-setup-call"
  | "need-decision-maker"
  | "follow-up-later"
  | "not-interested"
  | "not-a-fit"
  /** V1 disposition-aligned */
  | "follow-up-booked"
  | "interested-not-ready"
  | "price-objection"
  | "not-qualified";

export type CloseOutcome = {
  type: CloseOutcomeType;
  packageSelected?: string;
  followUpReason?: string;
  followUpTiming?: string;
  lossReason?: string;
  decisionMakerName?: string;
  proposalRecipient?: string;
  notes?: string;
};

// ── Input shapes ───────────────────────────────────────────────────────────

export type BusinessProfile = {
  name: string;
  type: string;
  currentSystem: string;
  leadSource: string;
  /** @deprecated Legacy freeform; structured capture replaces “door observations.” */
  notes?: string;
  /** Human-readable labels from Field Snapshot + constraint chips (AI + strategy). */
  capturedConstraintLabels?: string[];
  /** Stable id from directory / Places row when applied (local only, not a CRM id). */
  directoryPlaceId?: string;
  /** Rep-entered lookup hints (optional; future enrichment / APIs). */
  website?: string;
  rating?: string;
  reviewCount?: string;
  address?: string;
  social?: string;
  ownerName?: string;
  contactPhone?: string;
  contactEmail?: string;
};

// ── AI output shapes ───────────────────────────────────────────────────────

// TabletGuidance, ChannelMode, and PreCallIntel are re-exported above from types/pre-call.ts.

/** Deterministic pre-brief gate (Go / Soft-Go / Walk) — computed before StrategyBrief / pre-call AI. */
export type FieldEngagementDecision = {
  decision: "GO" | "SOFT_GO" | "WALK";
  confidence: number;
  reason: string;
  primaryAngle: string;
};

/** Guided demo close — exactly five steps, no extensions */
export type DemoCloseState = "hook" | "pain" | "proof" | "ask" | "close";

export const DEMO_CLOSE_STATES: readonly DemoCloseState[] = [
  "hook",
  "pain",
  "proof",
  "ask",
  "close",
] as const;

export type CoachingPrompt = {
  id: string;
  phase?: SessionPhase;
  signal: SignalColor;
  /** Optional: first line to open with (if different from audioCue) */
  openWith?: string;
  /** Optional: what not to lead with */
  avoidLead?: string;
  /** Optional: when to show the device */
  device?: "now" | "later";
  audioCue: string;
  nextMove: string;
  buySignal?: string;
  timestamp: number;
};

export interface SalesStep {
  objection: ObjectionType;
  rebuttal: string;
  benefit: string;
  question: string;
  close: string;
}

export type PerformanceScore = {
  overall: number;
  breakdown: {
    discovery: number;
    positioning: number;
    objectionHandling: number;
    closing: number;
  };
  strengths: string[];
  improvements: string[];
  summary: string;
};

// ── Session aggregate ──────────────────────────────────────────────────────

export type Session = {
  id: string;
  repName: string;
  createdAt: number;
  phase: SessionPhase;
  business: BusinessProfile | null;
  preCallIntel: PreCallIntel | null;
  /** RFC 6A — how the current brief was produced (AI vs rules fallback). */
  preCallIntelSource: PreCallSource | null;
  /** RFC 6 — set when Places/directory row applied; cleared on new scout. Rep edits remain authoritative. */
  directoryAutofillAt: number | null;
  /** Go / No-Go gate from constraints + industry — before strategy brief. */
  fieldEngagementDecision: FieldEngagementDecision | null;
  /** Live demo guided close rail — single source of truth for progression */
  closeState: DemoCloseState | null;
  /** CTA lines from `computeCloseCTAs` — persisted for disposition / recap */
  primaryCTA: string | null;
  backupCTA: string | null;
  /** Objection interrupt overlay was opened this session */
  objectionTriggered: boolean;
  /** On-site context captured on scout (first session page). */
  fieldSnapshot: FieldSnapshotKey[];
  constraints: BusinessConstraint[];
  closeOutcome: CloseOutcome | null;
  coachingPrompts: CoachingPrompt[];
  repNotes: string;
  startedAt: number | null;
  completedAt: number | null;
  score: PerformanceScore | null;
  /** Buyer presentation / proof / pricing milestones */
  presentation: SessionPresentationState;
  /** Highest session-flow step (1–5) the rep has reached; drives loop-back nav. */
  flowMaxStep: number;
  signals: Signal[];
  objections: ObjectionType[];
  salesSteps: SalesStep[];
  /** RFC 1 — Proof Engine (prepared field-read, executed demo, assessed disposition/recap). */
  proofBrief: ProofBrief | null;
  proofSequence: ProofSequence | null;
  currentProofBlockId: string | null;
  proofEvents: ProofEvent[];
  proofAssessment: ProofAssessment | null;
  /** RFC 2 — Close Engine (assessment embeds live `recommendation`; single source of truth). */
  closeEvents: CloseEvent[];
  closeAssessment: CloseAssessment | null;
  /** RFC 3 — persisted method selection (only DaNI is enabled; others stored for future use). */
  activeMethodId: MethodId;
  /** RFC 3 — posture snapshot for POST / analytics; optional on legacy rehydrate. */
  methodStrategy: MethodStrategySnapshot | null;
};

// ── Utility helpers ────────────────────────────────────────────────────────

export function getLastSignal(session: Session): Signal | undefined {
  return (session.signals ?? []).at(-1);
}

export function getSignalTrend(session: Session, count = 3): Signal[] {
  return (session.signals ?? []).slice(-count);
}

export function getSessionDurationMs(session: Session): number {
  return (session.completedAt ?? Date.now()) - (session.startedAt ?? Date.now());
}

export function getObjectionCoverage(session: Session): number {
  const objections = session.objections ?? [];
  const salesSteps = session.salesSteps ?? [];
  if (objections.length === 0) return 1;
  return Math.min(salesSteps.length / objections.length, 1);
}
