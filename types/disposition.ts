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
}
