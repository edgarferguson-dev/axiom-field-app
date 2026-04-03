/**
 * RFC 6 — Directory search → scout form merge (normalized, non-destructive to manual fields).
 * Pre-call AI always receives the current edited `BusinessProfile` from the form / session.
 */

import type { BusinessLookupMatch } from "@/lib/data/businessLookup/types";
import { matchToPrefill } from "@/lib/data/businessLookup/prefill";
import type { BusinessProfile } from "@/types/session";

/** Trim string fields for stable API / AI input. */
export function normalizeScoutBusinessProfile(b: BusinessProfile): BusinessProfile {
  const t = (s?: string) => (s == null ? "" : String(s).trim());
  return {
    name: t(b.name),
    type: t(b.type),
    currentSystem: t(b.currentSystem),
    leadSource: t(b.leadSource),
    notes: b.notes?.trim() || undefined,
    capturedConstraintLabels: b.capturedConstraintLabels,
    website: b.website?.trim() || undefined,
    rating: b.rating?.trim() || undefined,
    reviewCount: b.reviewCount?.trim() || undefined,
    address: b.address?.trim() || undefined,
    social: b.social?.trim() || undefined,
    ownerName: b.ownerName?.trim() || undefined,
    contactPhone: b.contactPhone?.trim() || undefined,
    contactEmail: b.contactEmail?.trim() || undefined,
  };
}

/**
 * Merge directory/places match into the current form.
 * Preserves fields the directory does not set (`currentSystem`, `leadSource`, etc.)
 * unless the patch overwrites them (directory only sends name, type, address, phone, ratings, website).
 */
export function mergeFormWithDirectoryMatch(
  form: BusinessProfile,
  match: BusinessLookupMatch,
  businessTypes: readonly string[]
): BusinessProfile {
  const patch = matchToPrefill(match, businessTypes);
  return normalizeScoutBusinessProfile({ ...form, ...patch });
}
