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
};

export function BusinessLookupPanel({ form, onChange, onDirectoryApply, businessTypes }: BusinessLookupPanelProps) {
  const [placesSearchQuery, setPlacesSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<BusinessLookupMatch[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const runSearch = useCallback(async () => {
    const q = form.name.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    try {
      const r = await searchBusinesses(q);
      setResults(r);
    } finally {
      setSearching(false);
    }
  }, [form.name]);

  const handleGoogleSearch = useCallback(async () => {
    const q = placesSearchQuery.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    try {
      const r = await searchBusinesses(q);
      setResults(r);
    } finally {
      setSearching(false);
    }
  }, [placesSearchQuery]);

  const applyMatch = useCallback(
    async (m: BusinessLookupMatch) => {
      setEnriching(true);
      try {
        let enriched: BusinessLookupMatch = m;
        if (m.placeId) {
          const details = await fetchPlaceDetails(m.placeId);
          if (details) enriched = { ...m, ...details, name: details.name || m.name };
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
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Account</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Who you&apos;re visiting</h3>
        <p className="mt-1 text-sm text-muted">Search Google (Brooklyn-biased), pick a row — form fills + gap scan runs.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border/80 bg-card/40 p-3">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
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
