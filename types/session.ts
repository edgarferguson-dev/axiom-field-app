import type { SessionPresentationState } from "@/types/presentation";

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

export type RiskBand = "high" | "medium" | "low";

// SignalColor is the canonical type; Signal is the V2B alias
export type SignalColor = "green" | "yellow" | "red";
export type Signal = SignalColor;

export type ObjectionType =
  | "price"
  | "busy"
  | "already-have"
  | "not-interested"
  | "timing";

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
  | "not-a-fit";

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
  notes: string;
};

// ── AI output shapes ───────────────────────────────────────────────────────

export type PreCallIntel = {
  painPattern: string;
  riskBand: RiskBand;
  missedValueEstimate: string;
  keyOpportunities: string[];
  recommendedAngle: string;
};

export type CoachingPrompt = {
  id: string;
  phase?: SessionPhase;
  signal: SignalColor;
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
  constraints: BusinessConstraint[];
  closeOutcome: CloseOutcome | null;
  coachingPrompts: CoachingPrompt[];
  repNotes: string;
  startedAt: number | null;
  completedAt: number | null;
  score: PerformanceScore | null;
  /** Buyer presentation / proof / pricing milestones */
  presentation: SessionPresentationState;
  signals: Signal[];
  objections: ObjectionType[];
  salesSteps: SalesStep[];
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
