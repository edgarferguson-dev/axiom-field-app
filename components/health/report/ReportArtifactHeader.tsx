"use client";

import { cn } from "@/lib/utils/cn";

export function ReportArtifactHeader({
  businessName,
  categoryType,
  areaContext,
  preparedLine,
  className,
}: {
  businessName: string;
  categoryType: string;
  areaContext: string;
  preparedLine: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "rounded-2xl border border-teal-500/25 bg-ink-950 px-5 py-6 text-center text-white shadow-[0_14px_44px_rgb(0_0_0/0.22)] sm:px-7 sm:py-8",
        className
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-400/95">Business health report</p>
      <h1 className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl">{businessName}</h1>
      {categoryType ? (
        <p className="mt-2 text-sm font-medium text-white/70">{categoryType}</p>
      ) : (
        <p className="mt-2 text-sm text-white/50">Business category not captured — report still reflects scout signals.</p>
      )}
      {areaContext ? <p className="mt-1.5 text-xs text-white/45">{areaContext}</p> : null}
      <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-white/38">{preparedLine}</p>
    </header>
  );
}
