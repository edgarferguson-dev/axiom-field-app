"use client";

import { cn } from "@/lib/utils/cn";
import type { DemoViewMode } from "@/types/demo";

export type DemoModeToggleProps = {
  mode: DemoViewMode;
  onChange: (mode: DemoViewMode) => void;
  className?: string;
};

/**
 * Single visible surface at a time — two clear modes, not tabs.
 */
export function DemoModeToggle({ mode, onChange, className }: DemoModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Demo display mode"
      className={cn(
        "flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-border/80 bg-surface/90 p-2 shadow-soft sm:flex-row sm:items-stretch",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("public")}
        className={cn(
          "min-h-[52px] flex-1 rounded-xl px-4 py-3 text-left transition",
          mode === "public"
            ? "bg-accent text-white shadow-md ring-2 ring-accent/40"
            : "bg-transparent text-muted hover:bg-card hover:text-foreground"
        )}
      >
        <span className="block text-xs font-semibold uppercase tracking-[0.2em] opacity-90">Public</span>
        <span className="mt-0.5 block text-sm font-semibold">Buyer screen</span>
        <span className="mt-1 block text-xs font-normal opacity-80">Full presentation</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("private")}
        className={cn(
          "min-h-[52px] flex-1 rounded-xl px-4 py-3 text-left transition",
          mode === "private"
            ? "bg-foreground text-background shadow-md ring-2 ring-accent/40"
            : "bg-transparent text-muted hover:bg-card hover:text-foreground"
        )}
      >
        <span className="block text-xs font-semibold uppercase tracking-[0.2em] opacity-90">Private</span>
        <span className="mt-0.5 block text-sm font-semibold">Rep control</span>
        <span className="mt-1 block text-xs font-normal opacity-80">One-line coaching, glance only</span>
      </button>
    </div>
  );
}
