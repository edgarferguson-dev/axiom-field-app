"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import { getAdaptiveCoaching } from "@/lib/coaching/adaptiveCoaching";
import { QuickControlPanel } from "@/components/coaching/QuickControlPanel";
import type { BuyerState } from "@/types/demo";

const BUYER_OPTIONS: { value: BuyerState; label: string }[] = [
  { value: "unknown", label: "?" },
  { value: "curious", label: "Curious" },
  { value: "skeptical", label: "Skeptic" },
  { value: "price_resistant", label: "Price" },
  { value: "distracted", label: "Split" },
  { value: "needs_reassurance", label: "Safe" },
  { value: "ready_to_buy", label: "Ready" },
];

const SIGNAL_DOT = {
  green: "bg-signal-green",
  yellow: "bg-signal-yellow",
  red: "bg-signal-red",
} as const;

/**
 * DaNI rep-facing shell: context chips + five-move coaching rail.
 */
export function DemoPrivateStage() {
  const liveSignal = useSessionStore((s) => s.signal);
  const buyerState = useSessionStore((s) => s.buyerState);
  const coachingMomentum = useSessionStore((s) => s.coachingMomentum);
  const demoSlideType = useSessionStore((s) => s.demoSlideType);
  const phase = useSessionStore((s) => s.session?.phase ?? "live-demo");
  const setBuyerState = useSessionStore((s) => s.setBuyerState);
  const setCoachingMomentum = useSessionStore((s) => s.setCoachingMomentum);

  const coaching = useMemo(
    () =>
      getAdaptiveCoaching({
        buyerState,
        signal: liveSignal,
        momentum: coachingMomentum,
        phase,
        currentStep: demoSlideType,
      }),
    [buyerState, liveSignal, coachingMomentum, phase, demoSlideType]
  );

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Rep view</p>
        <p className="text-xs text-muted">Set signal context — coaching lines refresh from there.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 shadow-soft ring-1 ring-foreground/[0.06]">
        <div className="flex items-center gap-2">
          <span className={cn("h-3 w-3 shrink-0 rounded-full", SIGNAL_DOT[liveSignal])} aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-foreground">Room</span>
        </div>
        <div className="flex max-w-[min(100%,20rem)] flex-wrap justify-end gap-1">
          {BUYER_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setBuyerState(o.value)}
              className={cn(
                "min-h-[36px] min-w-[2.25rem] rounded-lg px-2 text-xs font-semibold transition",
                buyerState === o.value
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface text-muted hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex gap-1 rounded-2xl border border-border bg-card p-2 shadow-soft ring-1 ring-foreground/[0.06]"
        role="group"
        aria-label="Momentum"
      >
        {(["up", "flat", "down"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setCoachingMomentum(v)}
            className={cn(
              "min-h-[44px] flex-1 rounded-xl text-xs font-bold uppercase tracking-[0.12em]",
              coachingMomentum === v ? "bg-accent text-white" : "text-muted hover:bg-surface"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <section
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft ring-1 ring-foreground/[0.06]"
        aria-label="In-room coaching"
      >
        <div className="border-b border-border/60 bg-surface/90 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Your next five moves</p>
          <p className="mt-0.5 text-xs text-muted">One line each — read once, eyes back on them.</p>
        </div>
        <div className="p-3 sm:p-4">
          <QuickControlPanel coaching={coaching} />
        </div>
      </section>
    </div>
  );
}
