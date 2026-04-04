"use client";

import { useState, useCallback } from "react";
import type { BusinessProfile } from "@/types/session";
import { FormSelect } from "@/components/field-read/FormSelect";
import {
  searchBusinesses,
  fetchPlaceDetails,
  type BusinessLookupMatch,
} from "@/lib/data/businessLookup";
import type { PlacesApplyMeta } from "@/lib/data/businessLookup/placesMeta";
import { mergeFormWithDirectoryMatch } from "@/lib/field/directoryAutofill";

const EXTRA_FIELDS: {
  key: keyof Pick<
    BusinessProfile,
    "website" | "reviewCount" | "social" | "ownerName" | "contactEmail"
  >;
  label: string;
  placeholder: string;
}[] = [
  { key: "website", label: "Website", placeholder: "https://…" },
  { key: "reviewCount", label: "Review count", placeholder: "From Places" },
  { key: "social", label: "Social", placeholder: "Handle" },
  { key: "ownerName", label: "Owner / contact", placeholder: "Name" },
  { key: "contactEmail", label: "Email", placeholder: "@" },
];

type BusinessLookupPanelProps = {
  form: BusinessProfile;
  onChange: (patch: Partial<BusinessProfile>) => void;
  /**
   * RFC 6 — Fired after Places search row + optional details fetch.
   * `meta` carries lat/lng/type for gap + neighborhood pipeline.
   */
  onDirectoryApply?: (merged: BusinessProfile, meta?: PlacesApplyMeta) => void;
  businessTypes: string[];
  /** Bias text search toward last pinned scout location (from a prior Places selection). */
  searchLocationBias?: { lat: number; lng: number } | null;
};

export function BusinessLookupPanel({
  form,
  onChange,
  onDirectoryApply,
  businessTypes,
  searchLocationBias,
}: BusinessLookupPanelProps) {
  const [placesSearchQuery, setPlacesSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<BusinessLookupMatch[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const searchOpts = useCallback(() => {
    if (
      searchLocationBias &&
      Number.isFinite(searchLocationBias.lat) &&
      Number.isFinite(searchLocationBias.lng)
    ) {
      return {
        latitude: searchLocationBias.lat,
        longitude: searchLocationBias.lng,
        radiusMeters: 15_000,
      };
    }
    return undefined;
  }, [searchLocationBias]);

  const runSearch = useCallback(async () => {
    const q = form.name.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    setResults([]);
    try {
      const r = await searchBusinesses(q, searchOpts());
      setResults(r.matches);
      if (r.error) setSearchError("Search unavailable — enter details manually or try again.");
    } finally {
      setSearching(false);
    }
  }, [form.name, searchOpts]);

  const handleGoogleSearch = useCallback(async () => {
    const q = placesSearchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    setResults([]);
    try {
      const r = await searchBusinesses(q, searchOpts());
      setResults(r.matches);
      if (r.error) setSearchError("Search unavailable — enter details manually or try again.");
    } finally {
      setSearching(false);
    }
  }, [placesSearchQuery, searchOpts]);

  const applyMatch = useCallback(
    async (m: BusinessLookupMatch) => {
      setEnriching(true);
      setDetailsError(null);
      try {
        let enriched: BusinessLookupMatch = m;
        if (m.placeId) {
          const details = await fetchPlaceDetails(m.placeId);
          if (details) enriched = { ...m, ...details, name: details.name || m.name };
          else setDetailsError("Could not load full place details — profile may be incomplete. Edit fields as needed.");
        }
        const merged = mergeFormWithDirectoryMatch(form, enriched, businessTypes);
        const meta: PlacesApplyMeta = {
          latitude: enriched.latitude ?? null,
          longitude: enriched.longitude ?? null,
          primaryType: enriched.primaryType ?? null,
        };
        if (onDirectoryApply) {
          onDirectoryApply(merged, meta);
        } else {
          onChange({
            name: merged.name,
            type: merged.type,
            address: merged.address,
            contactPhone: merged.contactPhone,
            website: merged.website,
            rating: merged.rating,
            reviewCount: merged.reviewCount,
            directoryPlaceId: merged.directoryPlaceId,
          });
        }
        setResults([]);
        setPlacesSearchQuery("");
      } finally {
        setEnriching(false);
      }
    },
    [businessTypes, form, onChange, onDirectoryApply]
  );

  return (
    <section className="space-y-4 border-b border-border/55 pb-6">
      <div className="mb-1">
        <p className="proof-phase-eyebrow text-accent">Scout</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Merchant snapshot</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Search, tap a match — profile and gap scan populate. Edit anything before you lock the brief.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border/80 bg-card/50 p-4 ring-1 ring-foreground/[0.03]">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Google Places
          </label>
          <input
            type="text"
            placeholder="Search business name…"
            value={placesSearchQuery}
            onChange={(e) => setPlacesSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleGoogleSearch()}
            className="mb-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="button"
            onClick={() => void handleGoogleSearch()}
            disabled={searching || !placesSearchQuery.trim()}
            className="btn-primary"
          >
            {searching ? "Searching…" : "Search Google"}
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Business name (manual)
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Business name"
              required
              className="min-h-[48px] w-full flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-base font-medium text-foreground transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={searching || !form.name.trim()}
              className="min-h-[48px] shrink-0 rounded-xl border border-accent bg-accent px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {searching ? "…" : "Search"}
            </button>
          </div>
        </div>

        {searchError ? (
          <p className="rounded-lg border border-signal-yellow/30 bg-signal-yellow/5 px-3 py-2 text-xs font-medium text-foreground">
            {searchError}
          </p>
        ) : null}

        {results.length > 0 && (
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border bg-card p-2">
            {results.map((r, i) => (
              <li key={r.placeId ?? `${r.name}-${i}`}>
                <button
                  type="button"
                  disabled={enriching}
                  onClick={() => void applyMatch(r)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-accent/10 disabled:opacity-50"
                >
                  <span className="font-semibold text-foreground">{r.name}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {r.address}
                    {r.rating != null ? ` · ${r.rating}★` : ""} · {r.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {enriching ? (
          <p className="text-xs font-medium text-accent">Loading place details…</p>
        ) : null}

        {detailsError ? (
          <p className="text-xs font-medium text-signal-yellow">{detailsError}</p>
        ) : null}

        <FormSelect
          label="Business type"
          options={businessTypes}
          value={form.type}
          onChange={(v) => onChange({ type: v })}
          placeholder="Select type…"
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">Phone</label>
            <input
              value={form.contactPhone ?? ""}
              onChange={(e) => onChange({ contactPhone: e.target.value })}
              placeholder="Main line"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">Address</label>
            <input
              value={form.address ?? ""}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="Street, city"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">Rating</label>
            <input
              value={form.rating ?? ""}
              onChange={(e) => onChange({ rating: e.target.value })}
              placeholder="e.g. 4.5"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          className="text-xs font-semibold uppercase tracking-wide text-accent"
        >
          {showMore ? "Hide extra fields" : "More fields (website, owner, email…)"}
        </button>

        {showMore && (
          <div className="grid gap-3 sm:grid-cols-2">
            {EXTRA_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted">{label}</label>
                <input
                  value={form[key] ?? ""}
                  onChange={(e) => onChange({ [key]: e.target.value } as Partial<BusinessProfile>)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
