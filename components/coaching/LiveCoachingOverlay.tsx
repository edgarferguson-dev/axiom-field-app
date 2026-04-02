"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { inferCoachingOverlaySignalOnly } from "@/lib/coaching/inferCoachingOverlaySignalOnly";
import { cn } from "@/lib/utils/cn";

const SIGNAL_META = {
  green:  { label: "Momentum", dotClass: "bg-signal-green", badgeClass: "bg-signal-green/15 text-signal-green", borderClass: "border-signal-green/30" },
  yellow: { label: "Redirect",  dotClass: "bg-signal-yellow", badgeClass: "bg-signal-yellow/15 text-signal-yellow", borderClass: "border-signal-yellow/30" },
  red:    { label: "Objection", dotClass: "bg-signal-red",   badgeClass: "bg-signal-red/15 text-signal-red",     borderClass: "border-signal-red/30" },
} as const;

/**
 * Cross-stage coaching **signal** layer: compact status when a prompt exists.
 * In signal-only contexts (e.g. live demo), does not repeat script — tactical copy
 * stays in `DemoCoachingPanel`. Those contexts also skip auto-expand so the pill
 * stays lightweight. Elsewhere, new prompts auto-expand the full cue card when needed.
 */
export type LiveCoachingOverlayProps = {
  /**
   * - `auto` (default): signal-only on live-demo phase or `/session/.../demo` route.
   * - `signal-only`: never duplicate script in the overlay (tactical column owns lines).
   * - `full-cue`: always show full say-this / next-move when expanded.
   */
  variant?: "auto" | "signal-only" | "full-cue";
};

export function LiveCoachingOverlay({ variant = "auto" }: LiveCoachingOverlayProps = {}) {
  const pathname = usePathname();
  const phase = useSessionStore((s) => s.session?.phase);
  const latest = useSessionStore((s) => s.session?.coachingPrompts?.at(-1));
  const promptCount = useSessionStore((s) => s.session?.coachingPrompts?.length ?? 0);

  const inferredSignalOnly = inferCoachingOverlaySignalOnly(pathname, phase);
  const signalOnly =
    variant === "auto" ? inferredSignalOnly : variant === "signal-only";

  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand on new prompt only when the overlay may show full cues (non–signal-only).
  // On demo (signal-only), stay collapsed so the rep column stays the tactical surface.
  useEffect(() => {
    if (signalOnly) return;
    const id = latest?.id ?? null;
    if (id && id !== dismissedId) {
      setIsExpanded(true);
    }
  }, [latest?.id, signalOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!latest || latest.id === dismissedId) return null;

  const signalKey =
    latest.signal === "green" || latest.signal === "yellow" || latest.signal === "red"
      ? latest.signal
      : "yellow";
  const meta = SIGNAL_META[signalKey];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-auto min-w-[180px] max-w-[320px]">
      {isExpanded ? (
        signalOnly ? (
          // Signal-only: status — tactical lines stay in DemoCoachingPanel on demo.
          <div
            className={cn(
              "w-[260px] animate-fade-in rounded-2xl border bg-card/95 p-3 shadow-soft backdrop-blur-xl",
              meta.borderClass
            )}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", meta.dotClass)} />
                <span className="text-xs font-medium text-muted">Coaching signal</span>
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
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-1 text-muted transition hover:text-foreground"
                  aria-label="Collapse"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
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
            <p className="text-[11px] leading-snug text-muted">
              Lines & next moves: <span className="font-medium text-foreground/90">For you</span> column (not on main
              screen).
            </p>
          </div>
        ) : (
          // Non-demo stages: full cue card (often the only surface showing the latest prompt).
          <div
            className={cn(
              "w-[320px] animate-fade-in rounded-2xl border bg-card/95 p-4 shadow-soft backdrop-blur-xl",
              meta.borderClass
            )}
          >
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
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-1 text-muted transition hover:text-foreground"
                  aria-label="Collapse"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
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

            {latest.buySignal && (
              <div className="mb-3 rounded-xl border border-signal-green/20 bg-signal-green/10 px-3 py-2">
                <p className="text-xs font-medium text-signal-green">Buy Signal Detected</p>
                <p className="mt-0.5 text-xs text-foreground">{latest.buySignal}</p>
              </div>
            )}

            <div className="mb-2">
              <p className="mb-0.5 text-[10px] font-medium text-muted">Say this now</p>
              <p className="text-sm font-medium leading-snug text-foreground">
                &ldquo;{latest.audioCue}&rdquo;
              </p>
            </div>

            <div>
              <p className="mb-0.5 text-[10px] font-medium text-muted">Next move</p>
              <p className="text-xs leading-relaxed text-muted">{latest.nextMove}</p>
            </div>
          </div>
        )
      ) : (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={cn(
            "flex items-center gap-2.5 rounded-full border bg-card/95 px-4 py-2.5 shadow-soft backdrop-blur-xl transition hover:shadow-md",
            meta.borderClass
          )}
          aria-label={
            signalOnly
              ? "Coaching signal — full lines in the For you column"
              : "Expand live coaching"
          }
        >
          <span className={cn("h-2 w-2 flex-shrink-0 rounded-full animate-pulse", meta.dotClass)} />
          <span className="text-xs font-medium text-muted">
            {signalOnly ? "Signal" : "Coaching"}
          </span>
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
