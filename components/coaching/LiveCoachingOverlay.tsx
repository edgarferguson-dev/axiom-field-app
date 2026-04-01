"use client";

import { useState, useEffect } from "react";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

const SIGNAL_META = {
  green:  { label: "Momentum", dotClass: "bg-signal-green", badgeClass: "bg-signal-green/15 text-signal-green", borderClass: "border-signal-green/30" },
  yellow: { label: "Redirect",  dotClass: "bg-signal-yellow", badgeClass: "bg-signal-yellow/15 text-signal-yellow", borderClass: "border-signal-yellow/30" },
  red:    { label: "Objection", dotClass: "bg-signal-red",   badgeClass: "bg-signal-red/15 text-signal-red",     borderClass: "border-signal-red/30" },
} as const;

export function LiveCoachingOverlay() {
  const latest = useSessionStore((s) => s.session?.coachingPrompts?.at(-1));
  const promptCount = useSessionStore((s) => s.session?.coachingPrompts?.length ?? 0);

  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when a new prompt arrives
  useEffect(() => {
    const id = latest?.id ?? null;
    if (id && id !== dismissedId) {
      setIsExpanded(true);
    }
  }, [latest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!latest || latest.id === dismissedId) return null;

  const signalKey =
    latest.signal === "green" || latest.signal === "yellow" || latest.signal === "red"
      ? latest.signal
      : "yellow";
  const meta = SIGNAL_META[signalKey];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-auto min-w-[180px] max-w-[320px]">
      {isExpanded ? (
        // ── Expanded panel ───────────────────────────────────────────────
        <div
          className={cn(
            "w-[320px] animate-fade-in rounded-2xl border bg-card/95 p-4 shadow-soft backdrop-blur-xl",
            meta.borderClass
          )}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", meta.dotClass)} />
              <span className="text-xs font-medium text-muted">Live Coaching</span>
              {promptCount > 1 && (
                <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] text-muted">
                  {promptCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.badgeClass)}>
                {meta.label.toUpperCase()}
              </span>
              {/* Collapse */}
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-lg p-1 text-muted transition hover:text-foreground"
                aria-label="Collapse"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dismiss */}
              <button
                onClick={() => { setDismissedId(latest.id); setIsExpanded(false); }}
                className="rounded-lg p-1 text-muted transition hover:text-foreground"
                aria-label="Dismiss"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Buy signal */}
          {latest.buySignal && (
            <div className="mb-3 rounded-xl border border-signal-green/20 bg-signal-green/10 px-3 py-2">
              <p className="text-xs font-medium text-signal-green">Buy Signal Detected</p>
              <p className="mt-0.5 text-xs text-foreground">{latest.buySignal}</p>
            </div>
          )}

          {/* Audio cue */}
          <div className="mb-2">
            <p className="mb-0.5 text-[10px] font-medium text-muted">Say this now</p>
            <p className="text-sm font-medium leading-snug text-foreground">
              &ldquo;{latest.audioCue}&rdquo;
            </p>
          </div>

          {/* Next move */}
          <div>
            <p className="mb-0.5 text-[10px] font-medium text-muted">Next move</p>
            <p className="text-xs leading-relaxed text-muted">{latest.nextMove}</p>
          </div>
        </div>
      ) : (
        // ── Collapsed pill ───────────────────────────────────────────────
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={cn(
            "flex items-center gap-2.5 rounded-full border bg-card/95 px-4 py-2.5 shadow-soft backdrop-blur-xl transition hover:shadow-md",
            meta.borderClass
          )}
        >
          <span className={cn("h-2 w-2 flex-shrink-0 rounded-full animate-pulse", meta.dotClass)} />
          <span className="text-xs font-medium text-muted">Coaching</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.badgeClass)}>
            {meta.label}
          </span>
          <svg className="h-3 w-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
