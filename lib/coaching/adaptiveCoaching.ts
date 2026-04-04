import type { BuyerState, CoachingMomentum } from "@/types/demo";
import type { SessionPhase } from "@/types/session";
import type { SignalColor } from "@/types/session";
import type { MerchantProofBeatCue } from "@/types/merchantProof";
import { transitionIntentLabel } from "@/lib/presentation/merchantTransitionLabels";

/** One spoken line + eyes/hands cue — no paragraphs. */
export type CoachingLine = {
  line: string;
  cue: string;
};

/** Optional scout/diagnosis lines — bounded overlay on beat cues, not open generation. */
export type DiagnosisCoachingHints = {
  openingQuestion?: string;
  followUpProbe?: string;
  primaryGapLabel?: string;
};

export type AdaptiveCoachingInput = {
  buyerState: BuyerState;
  signal: SignalColor;
  momentum: CoachingMomentum;
  phase: SessionPhase;
  currentStep: string | null;
  /** When set (proof beat with cues), aligns the five-move rail with MerchantProofCoachRail doctrine */
  merchantProofBeat?: MerchantProofBeatCue | null;
  diagnosisHints?: DiagnosisCoachingHints;
};

export type AdaptiveCoachingOutput = {
  nextMove: CoachingLine;
  sayThis: CoachingLine;
  question: CoachingLine;
  rebuttals: CoachingLine[];
  backup: CoachingLine;
};

function L(line: string, cue: string): CoachingLine {
  return { line, cue };
}

/**
 * DaNI — Deal Activation & New Income. Rule-based, one line each, in-room only.
 */
function merchantProofCoachingOverlay(
  beat: MerchantProofBeatCue,
  buyerState: BuyerState,
  signal: SignalColor,
  momentum: CoachingMomentum,
  hints?: DiagnosisCoachingHints
): AdaptiveCoachingOutput {
  const intent = beat.transitionIntent ?? "continue_proof";
  const room = matrix(buyerState, signal, momentum);
  const mom =
    momentum === "up"
      ? "Short clauses — don’t stack proof on proof."
      : momentum === "down"
        ? "Add one calm breath before you speak."
        : "Steady shoulders — let the beat finish.";

  const firstPushback = beat.objectionCue
    ? L(beat.objectionCue, "One sentence — then hush.")
    : L(
        room.rebuttals[0]?.line ?? "If they hedge, name what you heard in six words.",
        room.rebuttals[0]?.cue ?? "Still hands."
      );

  const sayLine = hints?.openingQuestion?.trim() || beat.openingQuestion;
  const probeLine = hints?.followUpProbe?.trim() || beat.reactionProbe;
  const backupLine = hints?.primaryGapLabel?.trim()
    ? `${beat.privateCoachCue} · Pin: ${hints.primaryGapLabel.trim()}`
    : beat.privateCoachCue;

  return {
    nextMove: L(transitionIntentLabel(intent), beat.transitionTrigger),
    sayThis: L(sayLine, "Ask once — then turn the screen, not your mouth."),
    question: L(probeLine, "After they answer — don’t rescue with features."),
    rebuttals: [
      firstPushback,
      L(beat.silenceCue, "Quiet is part of the close — protect it."),
      ...(beat.hesitationCue
        ? [L(beat.hesitationCue, "Stall isn’t no — breathe once, then one line.")]
        : []),
    ],
    backup: L(backupLine, mom),
  };
}

export function getAdaptiveCoaching(input: AdaptiveCoachingInput): AdaptiveCoachingOutput {
  const { buyerState, signal, momentum, phase, currentStep, merchantProofBeat, diagnosisHints } = input;
  const phaseBoost = phase === "offer-fit" || phase === "closing";

  if (merchantProofBeat && !phaseBoost) {
    return merchantProofCoachingOverlay(merchantProofBeat, buyerState, signal, momentum, diagnosisHints);
  }

  const core = matrix(buyerState, signal, momentum);
  const step = stepBoost(currentStep);

  const nextMove = phaseBoost
    ? L("Tie offer to pain they already named.", "Hold eye contact — nod once.")
    : L(step.nextMove || core.nextMove.line, step.nextCue || core.nextMove.cue);

  const sayThis = phaseBoost
    ? L("Does this level match what you need?", "Open palm toward screen, still.")
    : L(step.sayThis || core.sayThis.line, step.sayCue || core.sayThis.cue);

  const question = phaseBoost
    ? L("What’s the one thing that would make today a yes?", "Lean in slightly, then wait.")
    : L(core.question.line, core.question.cue);

  const rebuttals = phaseBoost
    ? [
        L("Fair — want the lighter tier first?", "Relax shoulders."),
        L("What number were you hoping for?", "Pause — let them answer."),
      ]
    : core.rebuttals;

  const backup = L(step.backup || core.backup.line, step.backupCue || core.backup.cue);

  return { nextMove, sayThis, question, rebuttals, backup };
}

type MatrixRow = {
  nextMove: CoachingLine;
  sayThis: CoachingLine;
  question: CoachingLine;
  rebuttals: CoachingLine[];
  backup: CoachingLine;
};

function matrix(buyer: BuyerState, signal: SignalColor, m: CoachingMomentum): MatrixRow {
  const mom =
    m === "up" ? "Energy up — shorten everything." : m === "down" ? "Slow pace — one beat longer." : "Steady tone.";

  const tables: Record<BuyerState, Record<SignalColor, MatrixRow>> = {
    unknown: {
      green: {
        nextMove: L("Lock a next step while they’re warm.", mom),
        sayThis: L("Want to map setup to your first busy week?", "Chin level — easy smile."),
        question: L("Is fixing this a priority this month?", "Hold silence after."),
        rebuttals: [
          L("Totally — what would make timing work?", "Soft nod."),
          L("Could we book 15 minutes to start?", "Phone away."),
        ],
        backup: L("I’ll text a one-liner you can skim.", "Glance at notes, back to them."),
      },
      yellow: {
        nextMove: L("Name the doubt in one word.", mom),
        sayThis: L("What would you need to see to feel sure?", "Still hands."),
        question: L("Is it trust, timing, or price first?", "Wait."),
        rebuttals: [
          L("Makes sense — one proof, then decide?", "Eyebrow neutral."),
          L("Want a smaller start to test it?", "Unclench jaw."),
        ],
        backup: L("No rush — pick a day to revisit.", "Open posture."),
      },
      red: {
        nextMove: L("Diagnose before you pitch.", mom),
        sayThis: L("What felt off just now?", "Lean back half an inch."),
        question: L("Should we pause and pick a calmer time?", "Slow blink."),
        rebuttals: [
          L("I hear you — what would earn another look?", "Hands visible."),
          L("Fair walk — one recap only?", "No forward lean."),
        ],
        backup: L("I’ll leave a one-pager, no chase.", "Close notepad slowly."),
      },
    },
    skeptical: {
      green: {
        nextMove: L("Anchor on one fact they agreed to.", mom),
        sayThis: L("You said consistency breaks first — still true?", "Point to air, not them."),
        question: L("What proof would flip this for you?", "Hold eye contact."),
        rebuttals: [
          L("Pilot one week — review together?", "Palms up."),
          L("What claim do you want tested first?", "Still face."),
        ],
        backup: L("We can keep it to a written recap.", "Relax jaw."),
      },
      yellow: {
        nextMove: L("Trade claims for one tiny proof ask.", mom),
        sayThis: L("If we proved X in 7 days, would you look?", "Short sentence."),
        question: L("What proof actually moves you?", "Pause."),
        rebuttals: [
          L("Fair skepticism — what rebuilds trust?", "Nod once."),
          L("Want a reference call, not slides?", "Phone down."),
        ],
        backup: L("Pause here — no pressure close.", "Shoulders down."),
      },
      red: {
        nextMove: L("Validate — don’t push close.", mom),
        sayThis: L("Sounds like trust is the gap — fair?", "Soften voice."),
        question: L("What would rebuild it one step?", "Wait."),
        rebuttals: [
          L("Want a one-page, no meeting?", "Hands on table."),
          L("Should we stop and revisit later?", "Neutral face."),
        ],
        backup: L("I’m one text if anything shifts.", "Small close."),
      },
    },
    price_resistant: {
      green: {
        nextMove: L("Separate price from outcome.", mom),
        sayThis: L("If this saved one job a month, does math work?", "Calm tone."),
        question: L("Which tier feels least risky to try?", "Pause after."),
        rebuttals: [
          L("Start lighter — upgrade later?", "No wince."),
          L("What number were you anchoring?", "Listen."),
        ],
        backup: L("I’ll send two options side by side.", "Glance away, back."),
      },
      yellow: {
        nextMove: L("Cost of staying put first.", mom),
        sayThis: L("Before price — is the pain cost clear?", "Slow pace."),
        question: L("What budget line were you protecting?", "Still."),
        rebuttals: [
          L("Want net terms or smaller scope?", "Matter-of-fact."),
          L("Should we trim features, not outcome?", "Open hands."),
        ],
        backup: L("I’ll follow up with a lighter path.", "Nod."),
      },
      red: {
        nextMove: L("Pause numbers — return to pain.", mom),
        sayThis: L("Forget price — is the pain weekly?", "Soft volume."),
        question: L("Budget frozen or timing frozen?", "Wait."),
        rebuttals: [
          L("Want me to email numbers only?", "No lean-in."),
          L("Book a numbers pass for next week?", "Check time."),
        ],
        backup: L("I’ll step back until you’re ready.", "Neutral exit."),
      },
    },
    distracted: {
      green: {
        nextMove: L("One question, one answer.", mom),
        sayThis: L("Still a priority this month?", "Short."),
        question: L("Want me to text a one-liner later?", "Already reaching for door? Stop."),
        rebuttals: [
          L("Ten seconds — fair?", "Raise one finger."),
          L("Bad time — when’s calmer?", "Step back."),
        ],
        backup: L("I’ll vanish — ping when ready.", "Small wave."),
      },
      yellow: {
        nextMove: L("One headline benefit only.", mom),
        sayThis: L("Bottom line: faster response — matter here?", "One breath."),
        question: L("Want the 30-second version?", "Phone away."),
        rebuttals: [
          L("Should I come back another day?", "Scan room."),
          L("Who else needs this in the room?", "Chin toward door."),
        ],
        backup: L("I’ll leave a card — no deck.", "Hand card, pause."),
      },
      red: {
        nextMove: L("Stop the deck — re-earn attention.", mom),
        sayThis: L("Reschedule for 10 focused minutes?", "Soften."),
        question: L("What day is calmer?", "Notebook ready."),
        rebuttals: [
          L("Want me out of your hair now?", "Half step back."),
          L("Text me a better window?", "Eye contact, smile."),
        ],
        backup: L("No hard feelings — I’ll follow up light.", "Nod, leave."),
      },
    },
    curious: {
      green: {
        nextMove: L("Turn curiosity into a small trial.", mom),
        sayThis: L("Try first step next week?", "Forward lean."),
        question: L("What detail would make this feel safe?", "Wait."),
        rebuttals: [
          L("Want a sandbox week first?", "Palms up."),
          L("What’s the worry under the question?", "Tilt head."),
        ],
        backup: L("We can book setup and adjust day one.", "Confident nod."),
      },
      yellow: {
        nextMove: L("Answer one, then confirm direction.", mom),
        sayThis: L("Does that hit the worry, or something else?", "Still."),
        question: L("What single detail unlocks you?", "Silence."),
        rebuttals: [
          L("Want it in writing before you move?", "Matter-of-fact."),
          L("Who else should hear this?", "Glance around."),
        ],
        backup: L("I’ll send a tight FAQ.", "Small smile."),
      },
      red: {
        nextMove: L("Name the real question.", mom),
        sayThis: L("What would you need before a step?", "Slow."),
        question: L("Is it risk, time, or trust?", "Hold."),
        rebuttals: [
          L("Want a short written answer first?", "Nod."),
          L("Should we loop in the owner?", "Chin up."),
        ],
        backup: L("I’ll follow up with one paragraph.", "Close notebook."),
      },
    },
    ready_to_buy: {
      green: {
        nextMove: L("Ask plainly for the decision.", mom),
        sayThis: L("Start today?", "Steady eyes."),
        question: L("Paperwork or payment first for you?", "Pen ready."),
        rebuttals: [
          L("What’s the last friction?", "Lean in."),
          L("Want me to hold the slot while you check?", "Pause."),
        ],
        backup: L("What date works if not today?", "Calendar tone."),
      },
      yellow: {
        nextMove: L("Remove last friction.", mom),
        sayThis: L("What’s the one thing in the way?", "Open posture."),
        question: L("Is it sign-off or timing?", "Wait."),
        rebuttals: [
          L("Soft start date instead?", "Softer voice."),
          L("Deposit vs full — preference?", "Neutral."),
        ],
        backup: L("I’ll hold terms until tomorrow.", "Nod."),
      },
      red: {
        nextMove: L("Surface the hidden blocker.", mom),
        sayThis: L("You sounded ready — what shifted?", "Concerned brow."),
        question: L("Want to pause until tomorrow?", "Give space."),
        rebuttals: [
          L("Did something new land?", "Still."),
          L("Should we bring someone else in?", "Glance around."),
        ],
        backup: L("No pressure — pick this up fresh.", "Relax shoulders."),
      },
    },
    needs_reassurance: {
      green: {
        nextMove: L("State the safe path clearly.", mom),
        sayThis: L("We stay with you the first two weeks.", "Calm certainty."),
        question: L("What would reassurance look like — check-ins?", "Listen."),
        rebuttals: [
          L("Start small, expand after results?", "Nod."),
          L("Want training spelled out in writing?", "Note it."),
        ],
        backup: L("Many owners start on the light tier.", "Reassuring tone."),
      },
      yellow: {
        nextMove: L("Offer one concrete safety rail.", mom),
        sayThis: L("Training plus weekly check-in — enough?", "Eye contact."),
        question: L("What would feel safe enough to try?", "Pause."),
        rebuttals: [
          L("Written SLA on response time?", "Matter-of-fact."),
          L("Pilot one location first?", "Open hand."),
        ],
        backup: L("I’ll send the support map in one page.", "Small smile."),
      },
      red: {
        nextMove: L("Acknowledge risk — lower exposure.", mom),
        sayThis: L("Fair to be cautious — recap in writing first?", "Softer."),
        question: L("Trial window that feels safe?", "Wait."),
        rebuttals: [
          L("No auto-charge until you approve?", "Clear."),
          L("Walk away clause in writing?", "Nod slowly."),
        ],
        backup: L("One location before full rollout?", "Palms up."),
      },
    },
  };

  return tables[buyer]?.[signal] ?? tables.unknown[signal];
}

function stepBoost(step: string | null): {
  nextMove?: string;
  nextCue?: string;
  sayThis?: string;
  sayCue?: string;
  backup?: string;
  backupCue?: string;
} {
  switch (step) {
    case "pain":
      return {
        nextMove: "Lock one weekly pain.",
        nextCue: "One eyebrow raise.",
        sayThis: "Where does it hit first — leads or retention?",
        sayCue: "Finger count: one, two.",
      };
    case "cost-roi":
      return {
        sayThis: "If nothing changes, monthly cost in one number?",
        sayCue: "Let them think — no fill-in.",
      };
    case "proof":
    case "interactive-proof":
    case "proof-snapshot":
    case "mock-flow":
    case "comparison-proof":
    case "impact-stat":
    case "decision-next":
      return {
        nextMove: "Let them confirm the story fits.",
        nextCue: "Point at proof, not at them.",
        sayThis: "Match what you see on busy days?",
        sayCue: "Nod when they speak.",
      };
    case "pricing":
      return {
        nextMove: "Match tier to what they said matters.",
        nextCue: "Screen forward, you beside them.",
        sayThis: "Which one fits how you want to run it?",
        sayCue: "Silence after question.",
      };
    default:
      return {};
  }
}
