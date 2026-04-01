export type DispositionOutcome =
  | "closed"
  | "follow-up"
  | "not-interested"
  | "not-fit"
  | "no-decision";

export type NextAction =
  | "send-recap"
  | "book-follow-up"
  | "retry-close"
  | "disqualify";

export interface DispositionResult {
  outcome: DispositionOutcome;
  summary: string;
  hiddenObjection: string;
  repMistake?: string;
  nextAction: NextAction;
  confidence: number;
  signalTrend: "improving" | "declining" | "mixed" | "neutral";
  coverageScore: number;

  // Optional dual-layer context (passed from presentation flow; not required).
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
