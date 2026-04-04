"use client";

import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import { NeighborhoodContextSlot } from "@/components/field-read/NeighborhoodContextSlot";
import { ProofRunGapRows } from "@/components/presentation/proof-beats/ProofRunGapRows";
import { NEIGHBORHOOD_CONTEXT_IDLE } from "@/types/scoutIntel";
import { parseScoutRating, parseScoutReviewCount } from "@/lib/field/gapDiagnosis";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

type Props = {
  slide: Extract<PresentationSlide, { type: "proof-snapshot" }>;
  tone?: "default" | "dani";
};

/**
 * Beat 1 — Pain Mirror. Reads scout + `gapDiagnosis` + optional neighborhood from session store only.
 */
export function PainMirrorBeat({ slide, tone = "default" }: Props) {
  const dani = tone === "dani";
  const business = useSessionStore((s) => s.session?.business);
  const gapDiagnosis = useSessionStore((s) => s.session?.gapDiagnosis);
  const neighborhoodContext = useSessionStore(
    (s) => s.session?.neighborhoodContext ?? NEIGHBORHOOD_CONTEXT_IDLE
  );

  const name = business?.name?.trim() ?? "";
  const bizType = business?.type?.trim() ?? "";
  const address = business?.address?.trim() ?? "";
  const rating = parseScoutRating(business?.rating);
  const reviewCount = parseScoutReviewCount(business?.reviewCount);

  const contextLine = [bizType || null, address || null].filter(Boolean).join(" · ");
  const showNeighborSlot = neighborhoodContext.status !== "idle";

  const titleSize = dani ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";
  const bodySize = dani ? "text-base sm:text-lg" : "text-sm sm:text-base";

  return (
    <div className={cn("space-y-4", dani && "space-y-5")}>
      <div
        className={cn(
          "rounded-2xl border border-ink-border bg-ink-900 px-4 py-4 shadow-[0_12px_40px_rgb(0_0_0/0.2)] sm:px-5 sm:py-5",
          "text-white"
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Pain mirror</p>
        {name ? (
          <h3 className={cn("mt-2 font-bold tracking-tight text-white", titleSize)}>{name}</h3>
        ) : (
          <h3 className={cn("mt-2 font-bold tracking-tight text-white/80", titleSize)}>This business</h3>
        )}
        {contextLine ? (
          <p className={cn("mt-1.5 text-white/55", dani ? "text-sm sm:text-base" : "text-xs sm:text-sm")}>
            {contextLine}
          </p>
        ) : bizType ? null : (
          <p className="mt-1.5 text-sm text-white/50">Add category and address in scout for tighter context.</p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:items-stretch">
          <div className="rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/85">Google snapshot</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-2xl font-black tabular-nums text-white sm:text-3xl">
                  {rating != null ? `${rating.toFixed(1)}★` : "—"}
                </p>
                <p className="text-xs text-white/50">
                  {reviewCount != null ? `${reviewCount} reviews` : "Rating or reviews not captured"}
                </p>
              </div>
              {rating != null && rating < 4.5 ? (
                <span className="rounded-lg bg-amber-500/15 px-2 py-1 text-[10px] font-semibold text-amber-100">
                  Below the 4.5★ bar many shops target
                </span>
              ) : rating != null ? (
                <span className="rounded-lg bg-teal-500/15 px-2 py-1 text-[10px] font-semibold text-teal-100">
                  Solid side of local
                </span>
              ) : (
                <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium text-white/45">
                  Neutral — not a knock
                </span>
              )}
            </div>
          </div>

          {gapDiagnosis != null && gapDiagnosis.estimatedMonthlyLeakage > 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/85">
                Directional leak
              </p>
              <p className="mt-2 text-xl font-black tabular-nums text-white sm:text-2xl">
                ~${gapDiagnosis.estimatedMonthlyLeakage.toLocaleString()}
                <span className="text-sm font-semibold text-white/50">/mo</span>
              </p>
              <p className="mt-1 text-[11px] leading-snug text-white/45">
                Illustrative math from scout signals — not a quote.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Leakage model</p>
              <p className="mt-2 text-sm text-white/50">Locks in once category and gaps are on the record.</p>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-ink-border bg-ink-950 px-4 py-4 shadow-[0_10px_32px_rgb(0_0_0/0.18)] sm:px-5 sm:py-5"
        )}
      >
        <ProofRunGapRows diagnosis={gapDiagnosis} />
      </div>

      {showNeighborSlot ? (
        <NeighborhoodContextSlot
          context={neighborhoodContext}
          posterClassName="rounded-2xl border border-ink-border bg-ink-900"
        />
      ) : null}

      <div className="rounded-2xl border border-teal-500/25 bg-ink-900/90 px-4 py-4 sm:px-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">Takeaway</p>
        <p className={cn("mt-2 font-semibold leading-snug text-white", bodySize)}>{slide.takeaway}</p>
        <p className={cn("mt-2 text-white/50", dani ? "text-sm" : "text-xs")}>{slide.proofLabel}</p>
      </div>
    </div>
  );
}
