import { Session, getSignalTrend, getObjectionCoverage } from "@/types/session";
import type { CloseOutcomeType } from "@/types/session";
import { DispositionResult, DispositionStatus, NextAction } from "@/types/disposition";
import { createEmptyPresentation } from "@/types/presentation";

export type DispositionContext = NonNullable<DispositionResult["presentation"]>;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function resolveSignalTrend(session: Session): DispositionResult["signalTrend"] {
  const trend = getSignalTrend(session, 3);
  if (trend.length < 2) return "neutral";
  const greenCount = trend.filter((s) => s === "green").length;
  const redCount = trend.filter((s) => s === "red").length;
  if (greenCount >= 2) return "improving";
  if (redCount >= 2) return "declining";
  if (greenCount > 0 && redCount > 0) return "mixed";
  return "neutral";
}

function dispositionContextFromSession(session: Session): DispositionContext | undefined {
  const p = session.presentation ?? createEmptyPresentation();
  if (!p.generatedSlides?.length) return undefined;

  return {
    presentedSlideTypes: p.generatedSlides.map((s) => s.type),
    proofStepShown: p.generatedSlides.some((s) => s.type === "interactive-proof"),
    interactiveProofEngaged: p.interactiveProof.step === "confirmed",
    pricingTierSelected: p.pricingTierId,
    pricingAccepted: p.pricingAccepted,
    pricingResponse:
      p.pricingResponse === null || p.pricingResponse === undefined
        ? "unknown"
        : p.pricingResponse,
    openAccountStarted: p.openAccountStarted,
  };
}

/** Map CloseOutcomeType → DispositionStatus + outcome + nextAction */
function closeOutcomeToDisposition(type: CloseOutcomeType): {
  status: DispositionStatus;
  outcome: DispositionResult["outcome"];
  nextAction: NextAction;
} {
  switch (type) {
    case "start-now":
      return { status: "won", outcome: "closed", nextAction: "retry-close" };
    case "send-proposal":
      return { status: "proposal-sent", outcome: "follow-up", nextAction: "send-proposal" };
    case "book-setup-call":
      return { status: "follow-up-scheduled", outcome: "follow-up", nextAction: "schedule-call" };
    case "need-decision-maker":
      return { status: "needs-decision-maker", outcome: "follow-up", nextAction: "get-decision-maker" };
    case "follow-up-later":
      return { status: "follow-up-scheduled", outcome: "follow-up", nextAction: "book-follow-up" };
    case "not-interested":
      return { status: "lost", outcome: "not-interested", nextAction: "disqualify" };
    case "not-a-fit":
      return { status: "no-fit", outcome: "not-fit", nextAction: "disqualify" };
  }
}

function buildStatusSummary(
  status: DispositionStatus,
  session: Session,
  coverageScore: number
): string {
  const biz = session.business?.name ?? "the business";
  const pkg = session.closeOutcome?.packageSelected;
  const timing = session.closeOutcome?.followUpTiming;
  const lossReason = session.closeOutcome?.lossReason;

  switch (status) {
    case "won":
      return pkg
        ? `${biz} committed to the ${pkg}. Move to onboarding and confirm setup.`
        : `${biz} committed to start. Confirm the package and move to onboarding.`;
    case "proposal-sent":
      return `${biz} requested a proposal before committing. Send it promptly — momentum is warm right now.`;
    case "follow-up-scheduled":
      return timing
        ? `${biz} is interested but not ready today. Follow up in ${timing.toLowerCase()} — the conversation was positioned.`
        : `${biz} is interested but not ready today. A targeted follow-up is the right next move.`;
    case "needs-decision-maker":
      return `The decision-maker was not present. Reconnect with the owner directly — do not restart the pitch, reference this conversation.`;
    case "objection-unresolved":
      return `${biz} had objections that were not fully resolved. Objection coverage: ${coverageScore}%. Identify the root concern before re-engaging.`;
    case "no-fit":
      return lossReason
        ? `${biz} was not a fit. Logged reason: ${lossReason}.`
        : `${biz} did not meet the qualification criteria for this solution.`;
    case "lost":
      return lossReason
        ? `${biz} passed. Loss reason: ${lossReason}. Capture and move on.`
        : `${biz} was not interested at this time. Note the reason and close the loop.`;
  }
}

export function runDisposition(session: Session): DispositionResult {
  const signals = session.signals ?? [];
  const objections = session.objections ?? [];
  const constraints = session.constraints ?? [];
  const closeOutcome = session.closeOutcome;
  const signalTrend = resolveSignalTrend(session);
  const coverageScore = Math.round(getObjectionCoverage(session) * 100);
  const lastSignal = signals.at(-1);

  // ── Resolve status / outcome / nextAction ──────────────────────────────
  let status: DispositionStatus;
  let outcome: DispositionResult["outcome"];
  let nextAction: NextAction;

  if (closeOutcome) {
    ({ status, outcome, nextAction } = closeOutcomeToDisposition(closeOutcome.type));
  } else {
    // Fallback: signal-based (no close screen data)
    if (lastSignal === "green" && signalTrend !== "declining") {
      status = "won"; outcome = "closed"; nextAction = "retry-close";
    } else if (lastSignal === "green" || lastSignal === "yellow" || signalTrend === "improving") {
      status = "follow-up-scheduled"; outcome = "follow-up"; nextAction = "book-follow-up";
    } else if (lastSignal === "red" && signalTrend === "declining") {
      status = "lost"; outcome = "not-interested"; nextAction = "disqualify";
    } else if (lastSignal === "red") {
      status = "no-fit"; outcome = "not-fit"; nextAction = "disqualify";
    } else {
      status = coverageScore < 60 ? "objection-unresolved" : "follow-up-scheduled";
      outcome = "no-decision";
      nextAction = "send-recap";
    }
  }

  // ── Main constraint ────────────────────────────────────────────────────
  const sortedConstraints = [...constraints].sort((a, b) => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
  const mainConstraint = sortedConstraints[0]?.key;

  // ── Hidden objection ───────────────────────────────────────────────────
  const hiddenObjection = objections.includes("price")
    ? "Price sensitivity is likely stronger than stated. The prospect may be masking a budget ceiling."
    : objections.includes("already-have")
    ? "Comfort with the status quo is the real barrier — the risk of change feels higher than the benefit."
    : objections.includes("busy")
    ? "Time pressure is being used to delay a decision. The underlying blocker was not surfaced."
    : objections.includes("timing")
    ? "Agreement on value is probably present, but commitment risk is keeping the prospect in a holding pattern."
    : objections.includes("not-interested")
    ? "The prospect disengaged before the core value exchange could land. Something earlier triggered resistance."
    : constraints.length > 0
    ? `Key constraint identified: ${mainConstraint?.replace(/-/g, " ")}. Ensure this was clearly connected to the solution before closing.`
    : "No dominant objection pattern detected. The core blocker was not fully surfaced in this session.";

  // ── Rep mistake ────────────────────────────────────────────────────────
  const repMistake =
    status === "lost" && signalTrend === "declining"
      ? "The rep did not regain frame control after resistance mounted. The conversation closed on the prospect's terms."
      : status === "lost"
      ? "The rep let the conversation end without a reframe or soft reset attempt."
      : coverageScore < 60 && objections.length > 0
      ? "Objections were raised but not fully worked through before the conversation moved on."
      : undefined;

  // ── Confidence ────────────────────────────────────────────────────────
  const greenCount = signals.filter((s) => s === "green").length;
  const redCount = signals.filter((s) => s === "red").length;
  const trendBonus = signalTrend === "improving" ? 8 : signalTrend === "declining" ? -10 : 0;
  const coverageBonus = Math.round((coverageScore - 50) * 0.15);
  const closeBonus = closeOutcome?.type === "start-now" ? 15 : closeOutcome?.type === "not-interested" ? -10 : 0;
  const confidenceBase = 70 + greenCount * 5 - redCount * 6 + trendBonus + coverageBonus + closeBonus;

  // ── Summary ───────────────────────────────────────────────────────────
  const summary = buildStatusSummary(status, session, coverageScore);

  // ── Presentation context ──────────────────────────────────────────────
  const ctx = dispositionContextFromSession(session);

  return {
    outcome,
    status,
    summary,
    hiddenObjection,
    repMistake,
    nextAction,
    confidence: clamp(confidenceBase, 50, 97),
    signalTrend,
    coverageScore,
    mainConstraint,
    packageInterest: closeOutcome?.packageSelected,
    followUpTiming: closeOutcome?.followUpTiming,
    reasonCode: closeOutcome?.lossReason ?? closeOutcome?.followUpReason,
    presentation: ctx,
  };
}
