/**
 * Formal Proof Run runtime (buyer-facing deck) — beats 1–6 + complete.
 * Distinct from RFC proof blocks (`proofSequence`); this drives presentation progression only.
 *
 * Deck ↔ phase mapping lives in `@/lib/proofRun/canonicalDeckMapping` (canonical beat ↔ slide `type`).
 */

export type ProofRunPhase =
  | "idle"
  | "beat-1"
  | "beat-2"
  | "beat-3"
  | "beat-4"
  | "beat-5"
  | "beat-6"
  | "complete";

export type ProofRunBeatId = "beat-1" | "beat-2" | "beat-3" | "beat-4" | "beat-5" | "beat-6";

export type ProofRunBeatVisit = {
  beatId: ProofRunBeatId;
  enteredAt: number;
  exitedAt: number | null;
  durationMs: number | null;
};

/** Persisted proof-run execution log + machine phase (single source with `presentation.activeSlideIndex`). */
export type ProofRunRuntimeState = {
  phase: ProofRunPhase;
  visits: ProofRunBeatVisit[];
  runStartedAt: number | null;
  runCompletedAt: number | null;
  totalDurationMs: number | null;
  reachedAsk: boolean;
  reachedReport: boolean;
  reportShared: boolean;
  reportTextedToOwner: boolean;
  exitReason: string | null;
  /** Active beat entry time (for open visit) */
  currentBeatEnteredAt: number | null;
  /** Last deck index applied (for beat-change detection on sync-index). */
  lastSlideIndex: number;
};

export type ProofRunDispatchAction =
  | { type: "start" }
  | { type: "next" }
  | { type: "back" }
  | { type: "skip-to-ask" }
  | { type: "exit"; reason: string }
  | { type: "complete" }
  /** Sync slide index from controlled deck (e.g. pricing Yes advances). */
  | { type: "sync-index"; index: number }
  | { type: "mark-report-shared" }
  | { type: "mark-report-texted" };

export function createIdleProofRun(): ProofRunRuntimeState {
  return {
    phase: "idle",
    visits: [],
    runStartedAt: null,
    runCompletedAt: null,
    totalDurationMs: null,
    reachedAsk: false,
    reachedReport: false,
    reportShared: false,
    reportTextedToOwner: false,
    exitReason: null,
    currentBeatEnteredAt: null,
    lastSlideIndex: 0,
  };
}

export function proofRunBeatIdFromPhase(phase: ProofRunPhase): ProofRunBeatId | null {
  if (phase === "idle" || phase === "complete") return null;
  return phase;
}
