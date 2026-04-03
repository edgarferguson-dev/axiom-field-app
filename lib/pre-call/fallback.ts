/**
 * Deterministic pre-call fallback (RFC 6).
 *
 * Produces a complete `PreCallIntel` from constraint + business data with no
 * AI call. Used when:
 *   - The Anthropic API is unavailable / times out
 *   - The API returns unparseable output and normalization returns null
 *   - The rep is offline
 *
 * Output quality is lower than the AI path but always structurally valid.
 */

import type {
  BusinessConstraint,
  BusinessProfile,
  ConstraintKey,
  FieldEngagementDecision,
  FieldSnapshotKey,
} from "@/types/session";
import type { PreCallIntel, RiskBand, TabletGuidance, ChannelMode } from "@/types/pre-call";

// ── Constraint label map (local copy — decisionEngine has its own) ─────────

const CONSTRAINT_LABELS: Partial<Record<ConstraintKey, string>> = {
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
  "poor-retention": "retention and repeat-business gaps",
  "no-clear-offer": "unclear offer or next step for prospects",
  "low-trust": "trust and proof gaps at first touch",
};

function labelForConstraint(key: ConstraintKey): string {
  return CONSTRAINT_LABELS[key] ?? key.replace(/-/g, " ");
}

// ── Severity scoring ───────────────────────────────────────────────────────

function severityScore(c: BusinessConstraint): number {
  return c.severity === "high" ? 3 : c.severity === "medium" ? 2 : 1;
}

function topConstraints(constraints: BusinessConstraint[], n: number): BusinessConstraint[] {
  return [...constraints].sort((a, b) => severityScore(b) - severityScore(a)).slice(0, n);
}

// ── Risk band derivation ───────────────────────────────────────────────────

function deriveRiskBand(gate: FieldEngagementDecision | null | undefined): RiskBand {
  if (!gate) return "medium";
  if (gate.decision === "GO" && gate.confidence >= 80) return "high";
  if (gate.decision === "GO") return "medium";
  if (gate.decision === "SOFT_GO") return "medium";
  return "low";
}

// ── Missed-value estimate ──────────────────────────────────────────────────

function deriveMissedValue(constraints: BusinessConstraint[]): string {
  const highCount = constraints.filter((c) => c.severity === "high").length;
  if (highCount >= 3) return "Estimated $1,500–$4,000/mo in recoverable lead and follow-up leakage.";
  if (highCount >= 1) return "Estimated $500–$1,500/mo in missed or stalled leads.";
  const medCount = constraints.filter((c) => c.severity === "medium").length;
  if (medCount >= 2) return "Estimated $200–$800/mo in friction and conversion loss.";
  return "Revenue impact unclear from on-site signals — qualify the volume first.";
}

// ── Likely objection by business type ─────────────────────────────────────

function deriveObjection(businessType: string): string {
  const type = businessType.toLowerCase();
  if (type.includes("restaurant") || type.includes("food") || type.includes("cafe")) {
    return `"We're slammed right now" — acknowledge it, then ask one question: how many calls go to voicemail on a Friday lunch rush.`;
  }
  if (type.includes("salon") || type.includes("spa") || type.includes("beauty")) {
    return `"We already use [booking tool]" — agree, then ask if it handles the gap between inquiry and booked appointment.`;
  }
  if (type.includes("medical") || type.includes("dental") || type.includes("clinic")) {
    return `"Our office manager handles that" — validate, then ask to confirm they're the right person to loop in today.`;
  }
  if (type.includes("gym") || type.includes("fitness") || type.includes("studio")) {
    return `"We can't afford it right now" — reframe: ask what a new member is worth and how many inquiries they lose monthly.`;
  }
  return `"We already have something" — agree, then ask one question: what happens when a lead comes in after hours.`;
}

// ── Tablet guidance from field snapshot ───────────────────────────────────

function deriveTabletGuidance(fieldSnapshot: FieldSnapshotKey[]): TabletGuidance {
  if (fieldSnapshot.includes("busy") || fieldSnapshot.includes("active-lobby")) return "later";
  if (fieldSnapshot.includes("quiet-storefront") || fieldSnapshot.includes("empty")) return "now";
  return "either";
}

// ── Channel mode ──────────────────────────────────────────────────────────

function deriveChannelMode(fieldSnapshot: FieldSnapshotKey[]): ChannelMode {
  if (fieldSnapshot.includes("no-receptionist")) return "phone-first";
  return "verbal-first";
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Build a complete `PreCallIntel` from on-site data — no AI required.
 * All fields are deterministic and based on constraint severity + business type.
 */
export function buildFallbackPreCallIntel(
  business: BusinessProfile,
  constraints: BusinessConstraint[],
  gate: FieldEngagementDecision | null | undefined,
  fieldSnapshot: FieldSnapshotKey[] = []
): PreCallIntel {
  const top = topConstraints(constraints, 3);
  const [first, second, third] = top;

  const topLabel = first ? labelForConstraint(first.key) : null;

  // Pain pattern
  const painPattern = topLabel
    ? `${business.name || "This business"} shows clear signs of ${topLabel}. ` +
      `${second ? `Secondary leak: ${labelForConstraint(second.key)}.` : "No secondary signal confirmed yet."}`
    : `No dominant constraint tagged — qualify the lead handling gap before pitching.`;

  // Key opportunities
  const anchor = gate?.primaryAngle
    ? gate.primaryAngle
    : topLabel
      ? `Anchor on ${topLabel} as the credibility wedge before any solution framing.`
      : `Confirm how leads are handled and who owns follow-up before going deep.`;

  const probe1 = second
    ? `Probe: how many ${labelForConstraint(second.key)} incidents happen in a typical week?`
    : `Probe: what happens to a lead that comes in after hours or on a weekend?`;

  const probe2 = third
    ? `If conversation opens: surface the ${labelForConstraint(third.key)} gap as a secondary cost.`
    : `If conversation opens: ask what the follow-up cadence looks like after a first inquiry.`;

  // Recommended angle
  const recommendedAngle = gate?.primaryAngle
    ? gate.primaryAngle
    : topLabel
      ? `Open directly on ${topLabel} and tie the first question to revenue they are already losing.`
      : `Start with a qualifying question about lead volume before mentioning any solution.`;

  return {
    painPattern,
    riskBand: deriveRiskBand(gate),
    missedValueEstimate: deriveMissedValue(constraints),
    keyOpportunities: [anchor, probe1, probe2],
    recommendedAngle,
    likelyObjection: deriveObjection(business.type),
    approachTiming:
      `First 90s: confirm who owns lead intake and what breaks when volume spikes. ` +
      `Avoid leading with: AI, automation, or pricing before they name the leak themselves.`,
    tabletGuidance: deriveTabletGuidance(fieldSnapshot),
    channelMode: deriveChannelMode(fieldSnapshot),
  };
}
