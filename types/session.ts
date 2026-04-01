// Core phase flow — extended with V2B phases
export type SessionPhase =
  | "pre-call"
  | "intake"
  | "field-read"
  | "live-demo"
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

// --- Input shapes ---

export type BusinessProfile = {
  name: string;
  type: string;
  currentSystem: string;
  leadSource: string;
  notes: string;
};

// --- AI output shapes ---

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

// --- Session aggregate ---

export type Session = {
  id: string;
  repName: string;
  createdAt: number;
  phase: SessionPhase;
  business: BusinessProfile | null;
  preCallIntel: PreCallIntel | null;
  coachingPrompts: CoachingPrompt[];
  repNotes: string;
  startedAt: number | null;
  completedAt: number | null;
  score: PerformanceScore | null;
  // V2B: static demo signal tracking
  signals: Signal[];
  objections: ObjectionType[];
  salesSteps: SalesStep[];
};

// --- Utility helpers ---

export function getLastSignal(session: Session): Signal | undefined {
  return session.signals.at(-1);
}

export function getSignalTrend(session: Session, count = 3): Signal[] {
  return session.signals.slice(-count);
}

export function getSessionDurationMs(session: Session): number {
  return (session.completedAt ?? Date.now()) - (session.startedAt ?? Date.now());
}

export function getObjectionCoverage(session: Session): number {
  if (session.objections.length === 0) return 1;
  return Math.min(session.salesSteps.length / session.objections.length, 1);
}
