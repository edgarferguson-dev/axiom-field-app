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

export function InteractiveProof({ state, onDispatch }: InteractiveProofProps) {
  const status = useMemo(() => {
    if (state.step === "phone") return { label: "Ready", tone: "text-muted" };
    if (state.step === "sending") return { label: "Sending…", tone: "text-signal-yellow" };
    if (state.step === "ai-reply") return { label: "AI reply", tone: "text-signal-green" };
    if (state.step === "scheduling") return { label: "Scheduling", tone: "text-signal-green" };
    return { label: "Confirmed", tone: "text-signal-green" };
  }, [state.step]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Live walkthrough
          </p>
          <p className="mt-1 text-xs text-muted">
            Simulation only — connects to your stack in a later release.
          </p>
        </div>
        <span className={cn("text-xs font-semibold", status.tone)}>{status.label}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground">Widget</div>
            <div className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted">
              Preview
            </div>
          </div>

          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-muted">
            Phone number
          </label>
          <input
            value={state.phone}
            onChange={(e) => onDispatch({ type: "SET_PHONE", phone: e.target.value })}
            disabled={state.step !== "phone"}
            placeholder="(555) 123-4567"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition disabled:opacity-60"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onDispatch({ type: "START" })}
              disabled={state.step !== "phone" || !state.phone.trim()}
              className={cn(
                "flex-1 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition",
                "hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              Start
            </button>
            <button
              type="button"
              onClick={() => onDispatch({ type: "RESET" })}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Booking
            </div>
            <div className="mt-1 text-xs text-foreground">
              {state.booking ? `${state.booking.dateLabel} · ${state.booking.timeLabel}` : "—"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground">Conversation</div>
            <button
              type="button"
              onClick={() => onDispatch({ type: "ADVANCE" })}
              disabled={!["sending", "ai-reply", "scheduling"].includes(state.step)}
              className="rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/20 disabled:opacity-40"
            >
              Next step →
            </button>
          </div>

          {state.transcript.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted">
              Start the demo to generate a realistic interaction.
            </div>
          ) : (
            <div className="space-y-2">
              {state.transcript.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs leading-relaxed",
                    m.from === "ai"
                      ? "border-accent/20 bg-accent/5 text-foreground"
                      : "border-border bg-card text-foreground/90"
                  )}
                >
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {m.from === "ai" ? "Assistant" : "Contact"}
                  </div>
                  {m.text}
                </div>
              ))}
            </div>
          )}

          {state.step === "confirmed" && (
            <div className="mt-3 rounded-xl border border-signal-green/20 bg-signal-green/10 px-3 py-2 text-xs text-signal-green">
              Booking confirmed — ready for the next step.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
