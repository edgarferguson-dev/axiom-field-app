import type { DemoCloseState, FieldEngagementDecision, PreCallIntel } from "@/types/session";

export type CloseTacticalBlock = {
  focus: string;
  whatToDo: string;
  whatToAvoid: string;
  nextMove: string;
};

function short(s: string, max = 96): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * One screen of tactical lines per guided-close step — deterministic, field‑ready.
 */
export function getCloseTacticalBlock(
  state: DemoCloseState,
  intel: PreCallIntel | null | undefined,
  primaryCTA: string,
  backupCTA: string,
  decision: FieldEngagementDecision | null | undefined
): CloseTacticalBlock {
  const d = decision?.decision ?? "SOFT_GO";
  const angle = intel?.recommendedAngle ? short(intel.recommendedAngle, 80) : "their lead path";
  const leak = intel?.painPattern ? short(intel.painPattern, 80) : "the operational leak";

  if (d === "WALK") {
    const walk: Record<DemoCloseState, CloseTacticalBlock> = {
      hook: {
        focus: "30 seconds max — no pitch stack.",
        whatToDo: "One relevant line, then ask to continue or bounce.",
        whatToAvoid: "Demo before they admit pain.",
        nextMove: "Cold? Card, go.",
      },
      pain: {
        focus: "Light triage only.",
        whatToDo: "How do missed leads get handled today?",
        whatToAvoid: "Audit tone; problem stacking.",
        nextMove: "No pain? Soft exit.",
      },
      proof: {
        focus: "Proof only if they lean in.",
        whatToDo: "One number or screen — then silence.",
        whatToAvoid: "Feature tour.",
        nextMove: "Interest? Book follow‑up. If not, out.",
      },
      ask: {
        focus: "Soft ask.",
        whatToDo: short(primaryCTA, 96),
        whatToAvoid: "Hard close; unprompted discount.",
        nextMove: short(backupCTA, 96),
      },
      close: {
        focus: "Clean exit.",
        whatToDo: "Confirm follow‑up only if they want it.",
        whatToAvoid: "Talking past a no.",
        nextMove: "Leave.",
      },
    };
    return walk[state];
  }

  const blocks: Record<DemoCloseState, CloseTacticalBlock> = {
    hook: {
      focus: "Sound like ops — not sales.",
      whatToDo: `Lead: ${angle}`,
      whatToAvoid: "Pitch or demo before buy‑in.",
      nextMove: "They name the leak in one line.",
    },
    pain: {
      focus: "Make the leak cost real.",
      whatToDo: `Tie to: ${leak}`,
      whatToAvoid: "Feature stacking in silence.",
      nextMove: "One proof point — “match your floor?”",
    },
    proof: {
      focus: "One proof — then stop.",
      whatToDo: "Smallest proof you fix the leak.",
      whatToAvoid: "Price before belief.",
      nextMove: "“Fair?” → Ask.",
    },
    ask: {
      focus: d === "GO" ? "Ask for the yes." : "Ask for a test or date.",
      whatToDo: short(primaryCTA, 96),
      whatToAvoid: "Talking over their answer.",
      nextMove: short(backupCTA, 96),
    },
    close: {
      focus: "Lock one concrete next step.",
      whatToDo: "Calendar, pay, or owner — pick one.",
      whatToAvoid: "“Think about it” with no date.",
      nextMove: "Repeat‑back + confirm today.",
    },
  };

  return blocks[state];
}
