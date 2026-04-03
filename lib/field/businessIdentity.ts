import type { BusinessProfile } from "@/types/session";

/** Normalize business name for local visit matching (not fuzzy search). */
export function normalizeVisitBusinessKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Digits only — for last-10 matching. */
export function normalizePhoneDigits(raw?: string): string {
  if (!raw?.trim()) return "";
  return raw.replace(/\D/g, "");
}

/** Lowercase hostname without www — local matching only. */
export function normalizeWebsiteHost(raw?: string): string {
  if (!raw?.trim()) return "";
  try {
    const trimmed = raw.trim();
    const withProto = /^[a-z]+:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

/** Collapsed lowercase address hint for pairing with name (not geocoding). */
export function normalizeAddressKey(raw?: string): string {
  if (!raw?.trim()) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function isStrongIdentityKey(key: string): boolean {
  return (
    key.startsWith("place:") ||
    key.startsWith("tel:") ||
    key.startsWith("web:") ||
    key.startsWith("loc:")
  );
}

/**
 * Single local fingerprint for repeat-visit matching (no backend ids).
 * Priority: directory place → phone (last 10) → website host → name+address → name.
 */
export function computeLocalBusinessIdentityKey(profile: Partial<BusinessProfile>): string {
  const place = profile.directoryPlaceId?.trim();
  if (place) return `place:${place}`;

  const digits = normalizePhoneDigits(profile.contactPhone);
  if (digits.length >= 10) return `tel:${digits.slice(-10)}`;

  const host = normalizeWebsiteHost(profile.website);
  if (host) return `web:${host}`;

  const name = normalizeVisitBusinessKey(profile.name ?? "");
  const addr = normalizeAddressKey(profile.address);
  if (name.length >= 2 && addr.length >= 8) return `loc:${name}|${addr}`;

  if (name.length >= 2) return `name:${name}`;
  return "";
}

export function legacyIdentityKeyFromBusinessNameSnapshot(businessNameSnapshot: string): string {
  return `name:${normalizeVisitBusinessKey(businessNameSnapshot)}`;
}

/**
 * Whether a saved capture likely refers to the same business as the current profile.
 * Strong keys (place/phone/web/loc) only match on equality; weak name keys avoid
 * crossing into a strong id on the other side to reduce same-name collisions.
 */
export function captureMatchesBusinessProfile(
  capture: { identityKey?: string; businessNameSnapshot: string },
  profile: Partial<BusinessProfile>
): boolean {
  const curKey = computeLocalBusinessIdentityKey(profile);
  if (!curKey) return false;

  const capKey =
    typeof capture.identityKey === "string" && capture.identityKey.trim()
      ? capture.identityKey.trim()
      : legacyIdentityKeyFromBusinessNameSnapshot(capture.businessNameSnapshot);

  if (curKey === capKey) return true;

  const nameCur = normalizeVisitBusinessKey(profile.name ?? "");
  const nameCap = normalizeVisitBusinessKey(capture.businessNameSnapshot);
  if (nameCur.length < 2 || nameCap.length < 2 || nameCur !== nameCap) return false;

  const curStrong = isStrongIdentityKey(curKey);
  const capStrong = isStrongIdentityKey(capKey);
  if (curStrong || capStrong) return false;
  return true;
}
