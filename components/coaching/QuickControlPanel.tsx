"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { AdaptiveCoachingOutput, CoachingLine } from "@/lib/coaching/adaptiveCoaching";

const FALLBACK_REBUTTAL: CoachingLine = {
  line: "Name the hang-up in one word.",
  cue: "Still hands — let them answer.",
};

function LineBlock({ step, label, item }: { step: number; label: string; item: CoachingLine }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border bg-surface px-3 py-3 sm:px-4 sm:py-3.5",
        step === 1 ? "border-accent/40 shadow-sm ring-1 ring-accent-dark/15" : "border-border/80"
      )}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-xs font-bold tabular-nums text-accent"
        aria-hidden
      >
        {step}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">{label}</p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug tracking-tight text-foreground">{item.line}</p>
        {item.cue ? (
          <p className="mt-1.5 text-xs leading-snug text-muted">({item.cue})</p>
        ) : null}
      </div>
    </div>
  );
}

export type CoachingPanelVariant = "classic" | "merchantRhythm";

export type QuickControlPanelProps = {
  coaching: AdaptiveCoachingOutput;
  className?: string;
  /** merchantRhythm: labels match proof-beat doctrine (ask / probe / wait) */
  variant?: CoachingPanelVariant;
};

const RHYTHM_LABELS = ["Then / next", "Ask", "Probe", "Wait / if pushback", "Coach"] as const;

/**
 * DaNI private glance — five priority lines, body language in parentheses.
 */
export function QuickControlPanel({ coaching, className, variant = "classic" }: QuickControlPanelProps) {
  const [openRebuttals, setOpenRebuttals] = useState(false);
  const quickRebuttal = coaching.rebuttals[0] ?? FALLBACK_REBUTTAL;
  const moreRebuttals = coaching.rebuttals.slice(1);
  const labels =
    variant === "merchantRhythm"
      ? RHYTHM_LABELS
      : (["Next Move", "Say This", "Quick Question", "Quick Rebuttal", "Backup Move"] as const);

  return (
    <div className={cn("flex flex-col gap-2.5 sm:gap-3", className)}>
      <LineBlock step={1} label={labels[0]} item={coaching.nextMove} />
      <LineBlock step={2} label={labels[1]} item={coaching.sayThis} />
      <LineBlock step={3} label={labels[2]} item={coaching.question} />
      <LineBlock step={4} label={labels[3]} item={quickRebuttal} />
      <LineBlock step={5} label={labels[4]} item={coaching.backup} />

      {moreRebuttals.length > 0 ? (
        <div className="mt-1 rounded-xl border border-dashed border-border/90 bg-card/50">
          <button
            type="button"
            onClick={() => setOpenRebuttals((o) => !o)}
            className="flex w-full min-h-[48px] items-center justify-between px-3 py-3 text-left sm:px-4"
            aria-expanded={openRebuttals}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
              Extra rebuttals ({moreRebuttals.length})
            </span>
            <span className="text-sm font-medium text-muted">{openRebuttals ? "−" : "+"}</span>
          </button>
          {openRebuttals ? (
            <div className="space-y-2.5 border-t border-border/50 px-3 py-3 sm:px-4">
              {moreRebuttals.map((r, i) => (
                <div key={i} className="border-l-2 border-accent/25 pl-3">
                  <p className="text-sm font-semibold leading-snug text-foreground">{r.line}</p>
                  {r.cue ? <p className="mt-1 text-xs leading-snug text-muted">({r.cue})</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
