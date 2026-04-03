import type { BusinessLookupMatch } from "./types";
import type { BusinessProfile } from "@/types/session";

/**
 * Maps a selected match (+ optional details) into session business fields.
 */
export function matchToPrefill(
  match: BusinessLookupMatch,
  businessTypes: readonly string[]
): Partial<BusinessProfile> {
  const typeMatch = businessTypes.find(
    (t) =>
      t.toLowerCase().includes(match.category.toLowerCase().slice(0, 8)) ||
      match.category.toLowerCase().includes(t.toLowerCase().slice(0, 6))
  );

  return {
    name: match.name.trim(),
    address: match.address.trim(),
    contactPhone: match.phone?.trim() || undefined,
    website: match.website?.trim() || undefined,
    rating: match.rating != null ? String(match.rating) : undefined,
    reviewCount: match.reviewCount != null ? String(match.reviewCount) : undefined,
    type: typeMatch ?? "",
  };
}
