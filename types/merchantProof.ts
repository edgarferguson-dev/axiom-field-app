/**
 * Phase 7B/C — Conversation-led merchant proof (appointment + inquiry runs).
 * Cues are config/registry only — not duplicated in Zustand.
 */

/** Phase 7C — structured next-move hint (not a branching engine) */
export type MerchantTransitionIntent =
  | "continue_proof"
  | "ask_question"
  | "hold_silence"
  | "move_to_ask"
  | "answer_concern";

export type MerchantProofBeatCue = {
  beatId: string;
  /** What belief this beat is trying to land (rep-facing) */
  proofPurpose: string;
  /** Short question to open — owner talks */
  openingQuestion: string;
  /** After they respond — one follow-up */
  reactionProbe: string;
  /** When to stop talking */
  silenceCue: string;
  /** Compact tactical line for the rep */
  privateCoachCue: string;
  /** Owner leaning in — optional; listed in `merchantProofCueRevision.ts` */
  positiveSignalCue?: string;
  /** Owner stalling / unsure — optional */
  hesitationCue?: string;
  /** Pushback — optional; folds into adaptive coaching when set */
  objectionCue?: string;
  /** Literal ask line when it should differ from openingQuestion (e.g. pricing beat) */
  askWording?: string;
  /** Human-readable watch condition */
  transitionTrigger: string;
  /** Clearer rep navigation — see transitionIntentLabel() (optional for older persisted slides) */
  transitionIntent?: MerchantTransitionIntent;
};

/** Drives which realistic mock surface `ProofLedBeat` renders */
export type MerchantVisualSurface =
  | "sms-booking-thread"
  | "compare-no-show-vs-booked"
  | "booking-automation-flow"
  | "stat-no-shows"
  | "web-form-lead"
  | "compare-response-times"
  | "routing-automation-flow"
  | "stat-missed-leads"
  | "decision-bridge"
  | "simple-ask"
  | "next-step";
