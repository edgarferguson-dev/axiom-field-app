import type { BuyerState } from "@/types/demo";

export type QuestionTriplet = {
  closed: string;
  open: string;
  confirm: string;
};

/** Next question only — closed → open → confirm rhythm */
const TRIPLETS: Record<BuyerState, QuestionTriplet> = {
  unknown: {
    closed: "You get steady foot traffic, right?",
    open: "What breaks first when it gets busy?",
    confirm: "So consistency is the real pain?",
  },
  skeptical: {
    closed: "You have tried fixes before, right?",
    open: "What made the last one not stick?",
    confirm: "So trust in the fix is the issue?",
  },
  price_resistant: {
    closed: "Budget matters on every decision, right?",
    open: "What number would feel fair if it worked?",
    confirm: "So we need proof before we talk price?",
  },
  distracted: {
    closed: "Still okay for two more minutes?",
    open: "What is the one outcome you want from today?",
    confirm: "So we focus only on that?",
  },
  curious: {
    closed: "You are open to a better process, right?",
    open: "What would a win look like in 30 days?",
    confirm: "So speed and clarity are what you want?",
  },
  ready_to_buy: {
    closed: "You are ready to pick a start approach, right?",
    open: "What date works for your first week live?",
    confirm: "So we lock that in and send confirmation?",
  },
  needs_reassurance: {
    closed: "You want this to feel safe, right?",
    open: "What would remove the last worry?",
    confirm: "So support after signup is what you need?",
  },
};

export type QuestionPhase = "closed" | "open" | "confirm";

export function getQuestionTriplet(buyerState: BuyerState): QuestionTriplet {
  return TRIPLETS[buyerState] ?? TRIPLETS.unknown;
}

/** Show ONE line at a time in UI — cycle with local state */
export function getNextQuestionLine(
  buyerState: BuyerState,
  phase: QuestionPhase
): string {
  const t = getQuestionTriplet(buyerState);
  return t[phase];
}
