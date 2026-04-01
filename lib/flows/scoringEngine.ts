import { Session, PerformanceScore, getObjectionCoverage } from "@/types/session";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateScore(session: Session): PerformanceScore {
  const signals = session.signals ?? [];
  const objections = session.objections ?? [];
  const salesSteps = session.salesSteps ?? [];
  const coachingPrompts = session.coachingPrompts ?? [];

  const greenCount = signals.filter((s) => s === "green").length;
  const yellowCount = signals.filter((s) => s === "yellow").length;
  const redCount = signals.filter((s) => s === "red").length;
  const objectionCount = objections.length;
  const stepCount = salesSteps.length;
  const promptCount = coachingPrompts.length;
  const coverageRatio = getObjectionCoverage(session);

  const uncoveredPenalty = Math.max(0, objectionCount - stepCount) * 6;
  const coachingLoad = Math.max(0, promptCount - stepCount) * 3;

  const discovery = clamp(62 + greenCount * 9 - redCount * 6 + yellowCount * 2);
  const positioning = clamp(66 + stepCount * 5 - redCount * 5 + Math.round(coverageRatio * 10));
  const objectionHandling = clamp(
    70 + stepCount * 4 - redCount * 8 - uncoveredPenalty - coachingLoad + Math.round(coverageRatio * 12)
  );
  const closing = clamp(58 + greenCount * 12 + yellowCount * 3 - redCount * 8);

  const overall = Math.round(
    discovery * 0.25 + positioning * 0.25 + objectionHandling * 0.25 + closing * 0.25
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (discovery >= 78) strengths.push("Strong discovery — kept the conversation diagnostic and consultative.");
  if (positioning >= 78) strengths.push("Clean value positioning with benefit framing anchored to their context.");
  if (objectionHandling >= 78) strengths.push("Worked through resistance with structure — rebuttal, benefit, question, close.");
  if (closing >= 78) strengths.push("Moved toward commitment with clear intent and healthy timing.");

  if (discovery < 68) improvements.push("Lead with sharper diagnostic questions to surface pain before pitching.");
  if (positioning < 68) improvements.push("Connect the product benefit directly to lost revenue — not features.");
  if (objectionHandling < 68) improvements.push("Tighten rebuttal → benefit → question → close sequencing under pressure.");
  if (closing < 68) improvements.push("Move to the close sooner once the prospect shows positive engagement.");
  if (coverageRatio < 0.75 && objectionCount > 0)
    improvements.push("Some objections were not fully worked through before the conversation moved on.");

  if (strengths.length === 0) strengths.push("Maintained enough structure to keep the session trackable and measurable.");
  if (improvements.length === 0) improvements.push("Continue sharpening close timing and tightening the transition after objections.");

  const summary =
    overall >= 82
      ? "Strong session. Clear control, structured objection handling, and credible close momentum throughout."
      : overall >= 68
      ? "Solid session with room to grow. The structure was there — sharpen objection sequencing and close timing."
      : "Developing session. Objection coverage and close momentum both need work.";

  return {
    overall,
    breakdown: { discovery, positioning, objectionHandling, closing },
    strengths,
    improvements,
    summary,
  };
}
