/**
 * Provider-agnostic business lookup — DaNI pre-call prefill.
 */

export type BusinessLookupProviderId = "google_places" | "manual";

/** One row from search — may be enriched via details call. */
export type BusinessLookupMatch = {
  provider: BusinessLookupProviderId;
  /** Google resource name e.g. places/ChIJ... */
  placeId?: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  category: string;
  rating: number | null;
  reviewCount?: number | null;
  /** Places API (New) — WGS84 */
  latitude?: number | null;
  longitude?: number | null;
  /** e.g. `barber_shop` */
  primaryType?: string | null;
};

/** Normalized prefill written into `BusinessProfile` + optional CRM. */
export type BusinessPrefill = {
  name: string;
  address: string;
  contactPhone: string;
  website: string;
  typeLabel: string;
  rating: string | null;
  placeId?: string;
};
