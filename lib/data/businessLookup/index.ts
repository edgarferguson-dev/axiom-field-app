/**
 * DaNI — Business lookup (provider-first). Default: Google Places via API routes.
 */

import type { BusinessLookupMatch } from "./types";
import { mapSearchResults } from "./providers/googlePlacesClient";

export type { BusinessLookupMatch, BusinessLookupProviderId, BusinessPrefill } from "./types";
export { mapSearchResults } from "./providers/googlePlacesClient";
export { matchToPrefill } from "./prefill";

export type SearchBusinessesOptions = {
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
};

/** Search businesses — uses active provider (Google when configured). */
export async function searchBusinesses(
  query: string,
  opts?: SearchBusinessesOptions
): Promise<BusinessLookupMatch[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const locationBias =
      opts?.latitude != null && opts?.longitude != null
        ? {
            circle: {
              center: { latitude: opts.latitude, longitude: opts.longitude },
              radius: opts.radiusMeters ?? 15000,
            },
          }
        : undefined;

    const res = await fetch("/api/places/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, locationBias }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return mapSearchResults(data);
  } catch {
    return [];
  }
}

/** Enrich a place (website, uri, extra fields) after selection. */
export async function fetchPlaceDetails(placeId: string): Promise<BusinessLookupMatch | null> {
  const id = placeId.trim();
  if (!id) return null;

  try {
    const res = await fetch("/api/places/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId: id }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { match?: BusinessLookupMatch };
    return data.match ?? null;
  } catch {
    return null;
  }
}

/** @deprecated Use `searchBusinesses` */
export async function searchBusiness(query: string) {
  return searchBusinesses(query);
}
