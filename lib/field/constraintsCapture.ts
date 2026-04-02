import type { ConstraintKey, FieldSnapshotKey, BusinessConstraint } from "@/types/session";

/** In-person / storefront context — what’s visible on the ground */
export const FIELD_SNAPSHOT_OPTIONS: { key: FieldSnapshotKey; label: string; hint: string }[] = [
  { key: "busy", label: "Busy", hint: "High foot traffic or phones" },
  { key: "moderate-traffic", label: "Moderate traffic", hint: "Steady but not slammed" },
  { key: "empty", label: "Empty", hint: "Quiet floor / slow period" },
  { key: "no-receptionist", label: "No receptionist", hint: "No clear front-desk coverage" },
  { key: "owner-present", label: "Owner present", hint: "Decision-maker visible" },
  { key: "staff-only", label: "Staff only", hint: "Team on floor, owner unclear" },
  { key: "active-lobby", label: "Active lobby", hint: "Movement, wait times, energy" },
  { key: "quiet-storefront", label: "Quiet storefront", hint: "Little signal from outside" },
];

/** Operational / revenue constraints — what’s likely blocking or leaking value */
export const BUSINESS_CONSTRAINT_OPTIONS: {
  key: ConstraintKey;
  label: string;
  hint: string;
}[] = [
  { key: "missed-calls", label: "Missed calls", hint: "Inquiry window slipping" },
  { key: "no-booking", label: "No booking system", hint: "Scheduling friction" },
  { key: "weak-reviews", label: "Weak reviews", hint: "Trust / social proof gap" },
  { key: "slow-follow-up", label: "Slow follow-up", hint: "Leads going cold" },
  { key: "weak-online-presence", label: "Weak online presence", hint: "Hard to find / low visibility" },
  { key: "no-automation", label: "No automation", hint: "Everything manual" },
  { key: "poor-retention", label: "Poor retention", hint: "Customers don’t return" },
  { key: "no-reactivation", label: "No reactivation", hint: "Lost customers not revived" },
  { key: "inconsistent-pipeline", label: "Inconsistent pipeline", hint: "No predictable flow" },
  { key: "no-nurture", label: "No clear nurture", hint: "No follow-through sequence" },
  { key: "owner-too-busy", label: "Owner too busy", hint: "Bottleneck at the top" },
  { key: "no-clear-offer", label: "No clear offer", hint: "Value prop muddy" },
  { key: "low-trust", label: "Low trust / proof", hint: "Credibility gap" },
  { key: "poor-lead-handling", label: "Poor lead handling", hint: "Leads dropped or mishandled" },
];

export type ConstraintSeverity = BusinessConstraint["severity"];

export const SEVERITY_CYCLE: ConstraintSeverity[] = ["high", "medium", "low"];

export function buildCapturedConstraintLabels(
  fieldKeys: FieldSnapshotKey[],
  businessConstraints: BusinessConstraint[]
): string[] {
  const fieldLabels = fieldKeys.map(
    (k) => FIELD_SNAPSHOT_OPTIONS.find((o) => o.key === k)?.label ?? k
  );
  const bizLabels = businessConstraints.map(
    (c) => BUSINESS_CONSTRAINT_OPTIONS.find((o) => o.key === c.key)?.label ?? c.key
  );
  return [...fieldLabels, ...bizLabels];
}
