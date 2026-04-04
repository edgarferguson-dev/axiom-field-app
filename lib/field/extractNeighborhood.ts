/**
 * Deterministic locality label for brief copy (opening lines, headers).
 * Parses common Google-style formatted addresses without calling any API.
 *
 * Rules (in order):
 * 1. Split on commas; trim; drop empty segments.
 * 2. Drop a trailing country token (USA, US, United States).
 * 3. Drop a trailing US "ST 12345" or "ST 12345-6789" segment.
 * 4. If two or more segments remain, return the last one (usually city / borough).
 * 5. Otherwise return the first segment or "your area".
 */
const US_STATE_ZIP = /^[A-Za-z]{2}\s+\d{5}(-\d{4})?$/;
const COUNTRY_TAIL = /^(USA|US|United States)$/i;

export function extractNeighborhood(address: string | undefined | null): string {
  if (!address?.trim()) return "your area";
  let parts = address
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "your area";

  const last = parts[parts.length - 1]!;
  if (COUNTRY_TAIL.test(last)) {
    parts = parts.slice(0, -1);
  }
  if (parts.length === 0) return "your area";

  const end = parts[parts.length - 1]!;
  if (US_STATE_ZIP.test(end)) {
    parts = parts.slice(0, -1);
  }
  if (parts.length === 0) return "your area";

  if (parts.length >= 2) {
    return parts[parts.length - 1] ?? parts[0]!;
  }
  return parts[0] ?? "your area";
}
