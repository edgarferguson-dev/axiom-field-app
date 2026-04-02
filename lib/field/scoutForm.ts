import type { BusinessProfile, BusinessConstraint, ConstraintKey, ConstraintSeverity } from "@/types/session";

export function emptyScoutProfile(): BusinessProfile {
  return {
    name: "",
    type: "",
    currentSystem: "",
    leadSource: "",
  };
}

export function constraintsFromMap(
  map: Map<ConstraintKey, ConstraintSeverity>
): BusinessConstraint[] {
  return Array.from(map.entries()).map(([key, severity]) => ({ key, severity }));
}
