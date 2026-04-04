"use client";

import type { GapDiagnosis, NeighborhoodComparison } from "@/types/scoutIntel";
import { cn } from "@/lib/utils/cn";

/** Horizontal “poster” bar — leakage vs implied cap (visual only). */
export function LeakageBarPoster({
  monthlyLeakage,
  className,
}: {
  monthlyLeakage: number;
  className?: string;
}) {
  const cap = Math.max(monthlyLeakage * 1.25, 5000);
  const pct = Math.min(100, Math.round((monthlyLeakage / cap) * 100));
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white",
        className
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">
        Estimated monthly leakage
      </p>
      <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-white">
        ~${monthlyLeakage.toLocaleString()}
      </p>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-white/50">Directional estimate — not a guarantee.</p>
    </div>
  );
}

/** Three-row comparison vs nearby set (structured counts only). */
export function NeighborhoodComparePoster({
  data,
  className,
}: {
  data: NeighborhoodComparison;
  className?: string;
}) {
  const rows = [
    { label: "Similar nearby", value: data.totalNearby, max: Math.max(data.totalNearby, 1) },
    { label: "Website link on Google", value: data.withBooking, max: Math.max(data.totalNearby, 1) },
    { label: "4.5+ stars", value: data.withHighRating, max: Math.max(data.totalNearby, 1) },
  ];
  return (
    <div
      className={cn("rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white", className)}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">
        Similar businesses nearby (~½ mi)
      </p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => {
          const w = Math.round((r.value / r.max) * 100);
          return (
            <li key={r.label}>
              <div className="flex justify-between text-xs font-medium text-white/90">
                <span>{r.label}</span>
                <span className="tabular-nums text-teal-300">{r.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-teal-500/80" style={{ width: `${w}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-white/45">
        Local set averages about {data.avgRating.toFixed(1)}★ · ~{Math.round(data.avgReviews)} reviews
      </p>
    </div>
  );
}

/** Rating vs target band — deterministic, no external charts lib. */
export function RatingGapStrip({
  rating,
  reviewCount,
  className,
}: {
  rating: number | null;
  reviewCount: number | null;
  className?: string;
}) {
  const target = 4.5;
  const r = rating ?? 0;
  const barPct = rating != null ? Math.min(100, (r / 5) * 100) : 0;
  const behind = rating != null && r < target;
  return (
    <div className={cn("rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">
        Google reputation
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-xl font-bold tabular-nums">{rating != null ? `${r.toFixed(1)}★` : "—"}</p>
          <p className="text-xs text-white/55">{reviewCount != null ? `${reviewCount} reviews` : "Reviews unknown"}</p>
        </div>
        {behind ? (
          <span className="rounded-lg bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-200">
            Below {target}★ bar many owners use
          </span>
        ) : rating != null ? (
          <span className="rounded-lg bg-teal-500/20 px-2 py-1 text-[10px] font-semibold text-teal-200">
            Strong side of local
          </span>
        ) : null}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-teal-400" style={{ width: `${barPct}%` }} />
      </div>
    </div>
  );
}

/** Top diagnosed gaps as compact chips with severity tint. */
export function GapChipList({ diagnosis, className }: { diagnosis: GapDiagnosis; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {diagnosis.gaps.slice(0, 5).map((g) => (
        <li
          key={g.type}
          className={cn(
            "rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
            g.severity === "high"
              ? "border-red-400/40 bg-red-500/15 text-red-100"
              : "border-amber-400/35 bg-amber-500/10 text-amber-100"
          )}
        >
          {g.label}
        </li>
      ))}
    </ul>
  );
}
