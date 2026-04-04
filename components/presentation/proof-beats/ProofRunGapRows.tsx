"use client";

import type { GapDiagnosis } from "@/types/scoutIntel";
import { cn } from "@/lib/utils/cn";

/**
 * Buyer-facing gap list for Pain Mirror (beat-1). Renders store `gapDiagnosis` only — no recomputation.
 */
export function ProofRunGapRows({
  diagnosis,
  className,
}: {
  diagnosis: GapDiagnosis | null | undefined;
  className?: string;
}) {
  const gaps = diagnosis?.gaps ?? [];

  if (gaps.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/[0.08] bg-black/30 px-4 py-4 text-white shadow-inner",
          className
        )}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/85">Diagnosis</p>
        <p className="mt-2 text-sm font-medium leading-snug text-white/80">
          Complete scout on this business to surface the same structured gaps you use in the brief — nothing is
          wrong with the run; we just need the capture.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400/90">Visible gaps</p>
      <ul className="space-y-2">
        {gaps.slice(0, 6).map((g) => (
          <li
            key={g.type}
            className={cn(
              "flex gap-3 rounded-xl border px-3.5 py-3.5 sm:min-h-[52px] sm:items-center",
              g.severity === "high"
                ? "border-red-500/25 bg-red-950/40"
                : "border-amber-500/20 bg-amber-950/25"
            )}
          >
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full sm:mt-0",
                g.severity === "high" ? "bg-red-400" : "bg-amber-400"
              )}
              aria-hidden
            />
            <p className="min-w-0 text-[15px] font-semibold leading-snug text-white sm:text-base">{g.label}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
