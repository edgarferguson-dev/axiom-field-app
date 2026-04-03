"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { useLeadStore } from "@/store/lead-store";
import { geocodeAddress } from "@/lib/leads/geocode";
import { planNearestNeighborRoute, googleMapsDirectionsUrl, googleMapsStopUrl, type RoutableStop } from "@/lib/leads/routePlan";

export default function LeadRoutePage() {
  const leads = useLeadStore((s) => s.leads);
  const updateLead = useLeadStore((s) => s.updateLead);
  const [busy, setBusy] = useState(false);
  const [startId, setStartId] = useState<string>("");

  const withCoords = useMemo(() => leads.filter((l) => l.lat != null && l.lng != null), [leads]);

  const geocodeMissing = async () => {
    setBusy(true);
    try {
      for (const l of leads) {
        if (l.lat != null && l.lng != null) continue;
        if (!l.address?.trim()) continue;
        const loc = await geocodeAddress(l.address);
        if (loc) updateLead(l.id, { lat: loc.lat, lng: loc.lng });
      }
    } finally {
      setBusy(false);
    }
  };

  const planRoute = () => {
    if (withCoords.length < 2) return;
    const sid = startId || withCoords[0]!.id;
    const start = withCoords.find((l) => l.id === sid);
    if (!start || start.lat == null || start.lng == null) return;
    const others = withCoords.filter((l) => l.id !== sid);
    const stops: RoutableStop[] = others.map((l) => ({
      id: l.id,
      lat: l.lat!,
      lng: l.lng!,
      label: l.businessName,
    }));
    const ordered = planNearestNeighborRoute(stops, { lat: start.lat, lng: start.lng });
    updateLead(sid, { routeOrder: 0 });
    ordered.forEach((s, i) => {
      updateLead(s.id, { routeOrder: i + 1 });
    });
  };

  const orderedLeads = useMemo(() => {
    const copy = [...leads].filter((l) => l.routeOrder != null);
    copy.sort((a, b) => (a.routeOrder ?? 999) - (b.routeOrder ?? 999));
    return copy;
  }, [leads]);

  const stopsForMap: RoutableStop[] = orderedLeads
    .filter((l) => l.lat != null && l.lng != null)
    .map((l) => ({ id: l.id, lat: l.lat!, lng: l.lng!, label: l.businessName }));

  const dirUrl = googleMapsDirectionsUrl(stopsForMap);

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="ax-label mb-1 flex items-center gap-2">
            <Navigation className="h-4 w-4" aria-hidden />
            Route
          </p>
          <h1 className="ax-h1">Day route</h1>
          <p className="mt-2 max-w-lg text-sm text-muted">Geocode addresses, pick a start, order stops by nearest neighbor — open in Maps when you roll.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/leads/import"
            className="min-h-[44px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30"
          >
            Import
          </Link>
          <Link
            href="/leads"
            className="min-h-[44px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-accent/30"
          >
            Leads
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => void geocodeMissing()}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-accent bg-accent/10 px-4 text-sm font-semibold text-accent transition hover:bg-accent/15 disabled:opacity-40"
        >
          <MapPin className="h-4 w-4" aria-hidden />
          {busy ? "Geocoding…" : "Geocode missing addresses"}
        </button>
      </div>

      {withCoords.length > 1 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted">Start location</label>
          <select
            value={startId || withCoords[0]!.id}
            onChange={(e) => setStartId(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {withCoords.map((l) => (
              <option key={l.id} value={l.id}>
                {l.businessName || "Untitled"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={planRoute}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Sequence stops from start
          </button>
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-border bg-surface/50 p-4 text-sm text-muted">
          Need at least two leads with coordinates. Geocode first, or add addresses on lead records.
        </p>
      )}

      {orderedLeads.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Stop order</h2>
            {stopsForMap.length > 0 ? (
              <a
                href={dirUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-wide text-accent"
              >
                Open in Google Maps
              </a>
            ) : null}
          </div>
          <ol className="space-y-2">
            {orderedLeads.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm text-foreground">
                  <span className="mr-2 font-mono text-xs text-accent">{l.routeOrder ?? "—"}</span>
                  {l.businessName}
                </span>
                {l.lat != null && l.lng != null ? (
                  <a
                    href={googleMapsStopUrl({ id: l.id, lat: l.lat, lng: l.lng })}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-muted underline-offset-2 hover:text-accent hover:underline"
                  >
                    Pin
                  </a>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
