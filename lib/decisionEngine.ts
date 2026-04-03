import type {
  BusinessConstraint,
  ConstraintKey,
  ConstraintSeverity,
  FieldEngagementDecision,
} from "@/types/session";

/** Strong opportunity signals — weighted fully */
const HIGH_SIGNAL = new Set<ConstraintKey>([
  "missed-calls",
  "no-automation",
  "weak-reviews",
  "no-booking",
  "slow-follow-up",
  "poor-lead-handling",
  "no-nurture",
  "no-reactivation",
]);

/** Secondary signals — half weight */
const SUPPORT_SIGNAL = new Set<ConstraintKey>([
  "weak-online-presence",
  "inconsistent-pipeline",
  "owner-too-busy",
  "poor-retention",
  "no-clear-offer",
  "low-trust",
]);

function severityWeight(s: ConstraintSeverity): number {
  switch (s) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function topConstraint(constraints: BusinessConstraint[]): BusinessConstraint | null {
  if (constraints.length === 0) return null;
  const rank = (c: BusinessConstraint) =>
    severityWeight(c.severity) * (HIGH_SIGNAL.has(c.key) ? 2 : SUPPORT_SIGNAL.has(c.key) ? 1 : 0);
  return [...constraints].sort((a, b) => rank(b) - rank(a))[0] ?? null;
}

function labelForKey(key: ConstraintKey): string {
  const map: Partial<Record<ConstraintKey, string>> = {
    "missed-calls": "missed calls and voicemail debt",
    "no-automation": "manual follow-up with no automation",
    "weak-reviews": "review and reputation risk",
    "no-booking": "leakage before the calendar",
    "slow-follow-up": "slow follow-up on inbound leads",
    "poor-lead-handling": "inconsistent lead handling at the desk",
    "no-nurture": "no nurture or reactivation path",
    "no-reactivation": "dormant leads sitting idle",
    "weak-online-presence": "thin or inconsistent online presence",
    "inconsistent-pipeline": "uneven pipeline and follow-through",
    "owner-too-busy": "owner bandwidth as a bottleneck",
    "poor-retention": "retention and repeat business gaps",
    "no-clear-offer": "unclear offer or next step for prospects",
    "low-trust": "trust or proof gaps in the first touch",
  };
  return map[key] ?? key.replace(/-/g, " ");
}

/**
 * Deterministic pre-brief gate: no AI. Uses captured constraints + industry label (business type).
 */
export function computeEngagementDecision(
  constraints: BusinessConstraint[],
  industryProfile: string
): FieldEngagementDecision {
  const industry = industryProfile.trim();
  let score = 0;

  for (const c of constraints) {
    const w = severityWeight(c.severity);
    if (HIGH_SIGNAL.has(c.key)) score += w;
    else if (SUPPORT_SIGNAL.has(c.key)) score += w * 0.5;
  }

  const total = Math.round(score);
  const top = topConstraint(constraints);
  const topLabel = top ? labelForKey(top.key) : "";

  let decision: FieldEngagementDecision["decision"];
  if (total >= 8) decision = "GO";
  else if (total >= 4) decision = "SOFT_GO";
  else decision = "WALK";

  let confidence: number;
  if (decision === "GO") {
    confidence = clamp(78 + Math.min(19, (total - 8) * 2 + (industry ? 4 : 0)), 72, 97);
  } else if (decision === "SOFT_GO") {
    confidence = clamp(58 + (total - 4) * 3 + (industry ? 3 : 0), 52, 88);
  } else {
    confidence = clamp(38 + total * 4 + (industry ? 2 : 0), 32, 62);
  }

  let reason: string;
  let primaryAngle: string;

  if (decision === "WALK") {
    reason =
      total === 0
        ? "No operational pain signals are tagged yet — opportunity is unclear."
        : "Signals are thin or fragmented relative to a strong walk-in wedge.";
    primaryAngle = industry
      ? `Qualify fast: confirm how ${industry} leads are handled before investing rapport.`
      : "Qualify fast: confirm how leads are handled and who owns follow-up before investing rapport.";
  } else if (decision === "SOFT_GO") {
    reason = top
      ? `Mixed floor: ${topLabel} is visible but the picture isn't one-sided yet.`
      : "Mixed floor — enough to open a conversation, not enough to assume a laydown.";
    primaryAngle = top
      ? `Anchor on ${topLabel}, then tighten with one proof question before any pitch.`
      : "Anchor on the sharpest operational leak you can verify in the first 60 seconds.";
  } else {
    reason = top
      ? `Strong wedge: ${topLabel} is a credible hook for this visit.`
      : "Multiple high-signal constraints — good floor to engage with a tight operational frame.";
    primaryAngle = top
      ? `Open directly on ${topLabel} and tie every line to revenue they are already losing.`
      : "Lead with the highest-severity leak you can validate on the floor, then narrow.";
  }

  return { decision, confidence, reason, primaryAngle };
}
