"use client";

import { cn } from "@/lib/utils/cn";

type AxiomFieldLogoProps = {
  compact?: boolean;
  className?: string;
};

export function AxiomFieldLogo({ compact = false, className }: AxiomFieldLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-11 w-11 items-center justify-center rounded-[18px] border border-border bg-surface shadow-sm ring-1 ring-slate-900/5">
        <div className="absolute inset-0 rounded-[18px] bg-[radial-gradient(circle,rgba(37,99,235,0.15),transparent_65%)]" />
        <div className="relative h-3 w-3 rounded-full bg-accent shadow-[0_0_14px_rgba(37,99,235,0.5)]" />
      </div>

      {!compact && (
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted">Axiom</div>
          <div className="text-lg font-semibold tracking-tight text-foreground">Field</div>
        </div>
      )}
    </div>
  );
}
