"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Shared section shell for the merchant health report (aligned with proof-run ink surfaces). */
export function ReportSection({
  kicker,
  title,
  children,
  className,
  variant = "default",
}: {
  kicker: string;
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "emphasis";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border px-4 py-4 text-white sm:px-5 sm:py-5",
        variant === "emphasis"
          ? "border-teal-500/30 bg-gradient-to-b from-teal-950/40 to-ink-950 shadow-[0_12px_40px_rgb(0_0_0/0.25)]"
          : "border-ink-border bg-ink-900 shadow-[0_10px_32px_rgb(0_0_0/0.18)]",
        className
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400/90">{kicker}</p>
      {title ? <h2 className="mt-2 text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2> : null}
      <div className={title ? "mt-4" : "mt-3"}>{children}</div>
    </section>
  );
}
