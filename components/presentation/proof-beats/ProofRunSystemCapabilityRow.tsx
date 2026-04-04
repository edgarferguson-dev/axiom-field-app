"use client";

import { cn } from "@/lib/utils/cn";

/** Single operational row for Full System (beat-4) and similar proof-run surfaces. */
export function ProofRunSystemCapabilityRow({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-white/[0.08] bg-black/35 px-4 py-3.5 sm:min-h-[52px] sm:items-center",
        className
      )}
    >
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-400 sm:mt-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-[15px] font-semibold leading-snug text-white sm:text-base">{title}</p>
        {hint ? <p className="mt-1 text-xs leading-snug text-white/50">{hint}</p> : null}
      </div>
    </div>
  );
}
