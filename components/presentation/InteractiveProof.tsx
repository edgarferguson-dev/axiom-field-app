"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import type {
  InteractiveDemoEvent,
  InteractiveDemoState,
} from "@/lib/flows/interactiveDemoEngine";

type InteractiveProofProps = {
  state: InteractiveDemoState;
  onDispatch: (event: InteractiveDemoEvent) => void;
};

/**
 * Single-column proof sequence — evidence, not a product playground.
 */
export function InteractiveProof({ state, onDispatch }: InteractiveProofProps) {
  const status = useMemo(() => {
    if (state.step === "phone") return { label: "Ready", tone: "text-muted" };
    if (state.step === "sending") return { label: "Sending", tone: "text-signal-yellow" };
    if (state.step === "ai-reply") return { label: "Response", tone: "text-foreground" };
    if (state.step === "scheduling") return { label: "Scheduling", tone: "text-foreground" };
    return { label: "Complete", tone: "text-signal-green" };
  }, [state.step]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-3">
        <p className="ax-label">Sequence</p>
        <span className={cn("text-xs font-medium tabular-nums", status.tone)}>{status.label}</span>
      </div>

      <div className="space-y-3">
        <label className="block ax-label">Customer phone</label>
        <input
          value={state.phone}
          onChange={(e) => onDispatch({ type: "SET_PHONE", phone: e.target.value })}
          disabled={state.step !== "phone"}
          placeholder="(555) 123-4567"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/15 disabled:opacity-50"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onDispatch({ type: "START" })}
            disabled={state.step !== "phone" || !state.phone.trim()}
            className={cn(
              "min-h-[44px] flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            Run sequence
          </button>
          <button
            type="button"
            onClick={() => onDispatch({ type: "RESET" })}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </div>

      {state.transcript.length > 0 && (
        <div className="space-y-0 divide-y divide-border/60 rounded-lg border border-border/80 bg-background/50">
          {state.transcript.map((m, i) => (
            <div key={i} className="px-4 py-3 text-sm leading-relaxed text-foreground">
              <span className="text-xs font-medium text-muted">
                {m.from === "ai" ? "System" : "Contact"}
                {" · "}
              </span>
              {m.text}
            </div>
          ))}
        </div>
      )}

      {state.transcript.length === 0 && state.step === "phone" && (
        <p className="text-center text-xs text-muted">Run the sequence to show a realistic exchange.</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-foreground">
          <span className="text-muted">Booking: </span>
          {state.booking ? (
            <span className="font-medium">{`${state.booking.dateLabel} · ${state.booking.timeLabel}`}</span>
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDispatch({ type: "ADVANCE" })}
          disabled={!["sending", "ai-reply", "scheduling"].includes(state.step)}
          className="rounded-lg border border-accent/35 bg-accent/[0.06] px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-35"
        >
          Next beat
        </button>
      </div>

      {state.step === "confirmed" && (
        <p className="rounded-lg border border-signal-green/25 bg-emerald-50/60 px-4 py-3 text-sm text-foreground">
          <span className="font-medium text-signal-green">Confirmed.</span> Move on when the buyer agrees this outcome is what they want.
        </p>
      )}
    </div>
  );
}
