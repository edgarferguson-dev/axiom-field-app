"use client";

import { cn } from "@/lib/utils/cn";

type AxiomFieldLogoProps = {
  compact?: boolean;
  /** Visual scale for dense headers (e.g. demo) vs. marketing hero. */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_STYLES = {
  sm: {
    box: "h-9 w-9 rounded-[14px]",
    axiom: "text-[10px] tracking-[0.26em]",
    field: "text-base",
    gap: "gap-2",
  },
  md: {
    box: "h-11 w-11 rounded-[18px]",
    axiom: "text-xs tracking-[0.3em]",
    field: "text-lg",
    gap: "gap-3",
  },
  lg: {
    box: "h-14 w-14 rounded-[22px]",
    axiom: "text-xs tracking-[0.3em]",
    field: "text-xl md:text-2xl",
    gap: "gap-3 sm:gap-4",
  },
} as const;

export function AxiomFieldLogo({
  compact = false,
  size = "md",
  className,
}: AxiomFieldLogoProps) {
  const s = SIZE_STYLES[size];
  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center border border-border bg-surface shadow-sm ring-1 ring-slate-900/5",
          s.box
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-[radial-gradient(circle,rgba(37,99,235,0.15),transparent_65%)]",
            size === "sm" ? "rounded-[14px]" : size === "lg" ? "rounded-[22px]" : "rounded-[18px]"
          )}
        />
        <div
          className={cn(
            "relative rounded-full bg-accent shadow-[0_0_14px_rgba(37,99,235,0.5)]",
            size === "sm" ? "h-2.5 w-2.5" : size === "lg" ? "h-4 w-4" : "h-3 w-3"
          )}
        />
      </div>

      {!compact && (
        <div className="min-w-0">
          <div className={cn("uppercase text-muted", s.axiom)}>Axiom</div>
          <div className={cn("font-semibold tracking-tight text-foreground", s.field)}>Field</div>
        </div>
      )}
    </div>
  );
}
