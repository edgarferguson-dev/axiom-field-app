import type { BusinessLookupMatch } from "./types";
import type { BusinessProfile } from "@/types/session";
import { mapPlacesPrimaryType } from "@/lib/field/gapDiagnosis";

/**
 * Maps a selected match (+ optional details) into session business fields.
 */
export function matchToPrefill(
  match: BusinessLookupMatch,
  businessTypes: readonly string[]
): Partial<BusinessProfile> {
  const fromPrimary = match.primaryType ? mapPlacesPrimaryType(match.primaryType) : "";
  const typeMatch = businessTypes.find(
    (t) =>
      t.toLowerCase().includes(match.category.toLowerCase().slice(0, 8)) ||
      match.category.toLowerCase().includes(t.toLowerCase().slice(0, 6))
  );
  const typeFromList =
    typeMatch ??
    businessTypes.find((t) => t.toLowerCase() === fromPrimary.toLowerCase()) ??
    "";

  return {
    name: match.name.trim(),
    address: match.address.trim(),
    contactPhone: match.phone?.trim() || undefined,
    website: match.website?.trim() || undefined,
    rating: match.rating != null ? String(match.rating) : undefined,
    reviewCount: match.reviewCount != null ? String(match.reviewCount) : undefined,
    type: typeFromList || fromPrimary || "",
    directoryPlaceId: match.placeId?.trim() || undefined,
  };
}
