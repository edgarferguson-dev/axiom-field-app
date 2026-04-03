import type { BusinessLookupMatch } from "../types";

/**
 * Normalizes `/api/places/*` JSON into `BusinessLookupMatch[]`.
 */
export function mapSearchResults(raw: unknown): BusinessLookupMatch[] {
  const data = raw as { results?: Partial<BusinessLookupMatch>[] };
  if (!Array.isArray(data.results)) return [];
  return data.results.map((r) => ({
    provider: "google_places",
    placeId: r.placeId,
    name: r.name ?? "",
    address: r.address ?? "",
    phone: r.phone ?? "",
    website: r.website ?? "",
    category: r.category ?? "business",
    rating: r.rating ?? null,
    reviewCount: r.reviewCount ?? null,
  }));
}
