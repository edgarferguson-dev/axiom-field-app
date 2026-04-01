export type DispositionOutcome =
  | "closed"
  | "follow-up"
  | "not-interested"
  | "not-fit"
  | "no-decision";

/** Actionable pipeline status — maps directly from the close screen outcome. */
export type DispositionStatus =
  | "won"
  | "proposal-sent"
  | "follow-up-scheduled"
  | "needs-decision-maker"
  | "objection-unresolved"
  | "no-fit"
  | "lost";

export type NextAction =
  | "send-recap"
  | "book-follow-up"
  | "retry-close"
  | "disqualify"
  | "send-proposal"
  | "schedule-call"
  | "get-decision-maker";

export interface DispositionResult {
  outcome: DispositionOutcome;
  status: DispositionStatus;
  summary: string;
  hiddenObjection: string;
  repMistake?: string;
  nextAction: NextAction;
  confidence: number;
  signalTrend: "improving" | "declining" | "mixed" | "neutral";
  coverageScore: number;

  /** Derived from selected constraints — highest-priority constraint key. */
  mainConstraint?: string;
  /** Package the rep positioned or the prospect showed interest in. */
  packageInterest?: string;
  /** Follow-up timing from the close screen. */
  followUpTiming?: string;
  /** Loss/objection reason code. */
  reasonCode?: string;

  // Optional presentation context (from demo flow).
  presentation?: {
    presentedSlideTypes?: string[];
    proofStepShown?: boolean;
    interactiveProofEngaged?: boolean;
    pricingTierSelected?: string | null;
    pricingAccepted?: boolean;
    pricingResponse?: "accept" | "hesitate" | "reject" | "unknown";
    openAccountStarted?: boolean;
  };
}
