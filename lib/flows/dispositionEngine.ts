import { Session, getSignalTrend, getObjectionCoverage } from "@/types/session";
import { DispositionResult } from "@/types/disposition";
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

export function runDisposition(session: Session): DispositionResult {
  const signals = session.signals;
  const objections = session.objections;
  const lastSignal = signals.at(-1);
  const signalTrend = resolveSignalTrend(session);
  const coverageScore = Math.round(getObjectionCoverage(session) * 100);

  let outcome: DispositionResult["outcome"] = "no-decision";
  let nextAction: DispositionResult["nextAction"] = "send-recap";

  if (lastSignal === "green" && signalTrend !== "declining") {
    outcome = "closed";
    nextAction = "retry-close";
  } else if (lastSignal === "green" && signalTrend === "declining") {
    outcome = "follow-up";
    nextAction = "book-follow-up";
  } else if (lastSignal === "yellow" || signalTrend === "improving") {
    outcome = "follow-up";
    nextAction = "book-follow-up";
  } else if (lastSignal === "red" && signalTrend === "declining") {
    outcome = "not-interested";
    nextAction = "disqualify";
  } else if (lastSignal === "red") {
    outcome = "not-fit";
    nextAction = "disqualify";
  }

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
    : "No dominant objection pattern detected. The core blocker was not fully surfaced in this session.";

  const repMistake =
    lastSignal === "red" && signalTrend === "declining"
      ? "The rep did not regain frame control after resistance mounted. The conversation closed on the prospect's terms."
      : lastSignal === "red"
      ? "The rep let the conversation end on a red signal without a reframe or soft reset attempt."
      : coverageScore < 60
      ? "Objections were raised but not fully worked through before the conversation moved on."
      : undefined;

  const greenCount = signals.filter((s) => s === "green").length;
  const redCount = signals.filter((s) => s === "red").length;
  const trendBonus =
    signalTrend === "improving" ? 8 : signalTrend === "declining" ? -10 : 0;
  const coverageBonus = Math.round((coverageScore - 50) * 0.15);
  const confidenceBase = 70 + greenCount * 5 - redCount * 6 + trendBonus + coverageBonus;

  const outcomeSummary: Record<DispositionResult["outcome"], string> = {
    closed:
      "Session closed with positive signal momentum. The rep maintained control and moved to commitment with structured intent.",
    "follow-up":
      "The prospect showed interest but did not fully commit. A targeted follow-up on the unresolved objection is the right move.",
    "not-interested":
      "The session ended with the prospect disengaged. The resistance was not reframed in time to change direction.",
    "not-fit":
      "The lead did not show the buying signals needed to proceed. Qualification criteria were not met.",
    "no-decision":
      "The session concluded without a clear outcome. Another touchpoint is needed before a path forward is visible.",
  };

  const ctx = dispositionContextFromSession(session);

  const presentationLine =
    ctx && (ctx.presentedSlideTypes?.length || ctx.proofStepShown || ctx.pricingTierSelected)
      ? `Presented: ${ctx.presentedSlideTypes?.join(" → ") ?? "—"}. Proof: ${
          ctx.interactiveProofEngaged ? "engaged" : ctx.proofStepShown ? "shown" : "not shown"
        }. Pricing tier: ${
          ctx.pricingTierSelected ?? "none"
        } (accepted: ${ctx.pricingAccepted ? "yes" : "no"}). Account started: ${
          ctx.openAccountStarted ? "yes" : "no"
        }.`
      : undefined;

  const baseSummary = presentationLine
    ? `${outcomeSummary[outcome]} ${presentationLine}`
    : outcomeSummary[outcome];

  return {
    outcome,
    summary: baseSummary,
    hiddenObjection,
    repMistake,
    nextAction,
    confidence: clamp(confidenceBase, 52, 96),
    signalTrend,
    coverageScore,
    presentation: ctx,
  };
}
