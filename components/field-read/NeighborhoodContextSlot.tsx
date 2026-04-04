"use client";

import type { NeighborhoodComparisonState } from "@/types/scoutIntel";
import { neighborhoodPosterPayload } from "@/types/scoutIntel";
import { NeighborhoodComparePoster } from "@/components/presentation/controlled/DiagnosisVisuals";
import { cn } from "@/lib/utils/cn";

/**
 * Optional Maps-backed nearby snapshot — supportive context only.
 * Branches on `NeighborhoodComparisonState` so consumers avoid loose null checks.
 */
export function NeighborhoodContextSlot({
  context,
  className,
  posterClassName,
}: {
  context: NeighborhoodComparisonState;
  className?: string;
  posterClassName?: string;
}) {
  if (context.status === "idle") return null;

  if (context.status === "loading") {
    return (
      <div
        className={cn(
          "flex min-h-[120px] flex-col justify-center rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-white",
          className
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/90">Nearby context</p>
        <p className="mt-2 text-sm text-white/70">Pulling similar businesses from Maps…</p>
      </div>
    );
  }

  const poster = neighborhoodPosterPayload(context);
  if (poster) {
    return <NeighborhoodComparePoster data={poster} className={posterClassName} />;
  }

  if (context.status === "empty" || context.status === "error") {
    return (
      <div className={cn("rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white", className)}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/90">Nearby context</p>
        <p className="mt-2 text-xs leading-relaxed text-white/60">
          {context.detail ??
            (context.status === "empty"
              ? "No similar listings in this search radius — optional snapshot."
              : "Couldn’t load area comparison — your diagnosis above is unchanged.")}
        </p>
      </div>
    );
  }

  return null;
}
