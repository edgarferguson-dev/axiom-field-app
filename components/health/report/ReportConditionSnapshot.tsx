"use client";

import { parseScoutRating, parseScoutReviewCount } from "@/lib/field/gapDiagnosis";
import { cn } from "@/lib/utils/cn";

/** Rating / reviews row for health report — calm fallbacks when sparse. */
export function ReportConditionSnapshot({
  ratingRaw,
  reviewCountRaw,
  className,
}: {
  ratingRaw?: string;
  reviewCountRaw?: string;
  className?: string;
}) {
  const rating = parseScoutRating(ratingRaw);
  const reviewCount = parseScoutReviewCount(reviewCountRaw);
  const target = 4.5;
  const behind = rating != null && rating < target;
  const barPct = rating != null ? Math.min(100, (rating / 5) * 100) : 0;

  return (
    <div className={cn("rounded-xl border border-white/[0.08] bg-black/35 px-4 py-4", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/85">Google presence</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-black tabular-nums text-white sm:text-3xl">
            {rating != null ? `${rating.toFixed(1)}★` : "—"}
          </p>
          <p className="mt-1 text-xs text-white/55">
            {reviewCount != null ? `${reviewCount} reviews` : "Review count not on file — not a penalty, just incomplete signal."}
          </p>
        </div>
        {rating != null ? (
          behind ? (
            <span className="rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-[10px] font-semibold text-amber-100">
              Below {target}★ bar many owners watch
            </span>
          ) : (
            <span className="rounded-lg bg-teal-500/15 px-2.5 py-1.5 text-[10px] font-semibold text-teal-100">
              Solid side of local
            </span>
          )
        ) : (
          <span className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white/45">
            Add rating in scout for a fuller picture
          </span>
        )}
      </div>
      {rating != null ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-teal-400"
            style={{ width: `${barPct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
