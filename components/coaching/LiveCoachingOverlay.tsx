"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { inferCoachingOverlaySignalOnly } from "@/lib/coaching/inferCoachingOverlaySignalOnly";
import { cn } from "@/lib/utils/cn";

const RAIL_PREF_KEY = "axiom-coaching-rail-pref";

const SIGNAL_META = {
  green: { label: "Momentum", dotClass: "bg-signal-green", badgeClass: "bg-signal-green/15 text-signal-green", borderClass: "border-signal-green/30" },
  yellow: { label: "Redirect", dotClass: "bg-signal-yellow", badgeClass: "bg-signal-yellow/15 text-signal-yellow", borderClass: "border-signal-yellow/30" },
  red: { label: "Objection", dotClass: "bg-signal-red", badgeClass: "bg-signal-red/15 text-signal-red", borderClass: "border-signal-red/30" },
} as const;

/**
 * Cross-stage coaching signal layer. Right-edge drawer (not bottom overlay) so it
 * stays clear of the demo buyer column.
 */
export type LiveCoachingOverlayProps = {
  variant?: "auto" | "signal-only" | "full-cue";
};

export function LiveCoachingOverlay({ variant = "auto" }: LiveCoachingOverlayProps = {}) {
  const pathname = usePathname();
  const skipOnDemo = pathname?.includes("/demo");

  const phase = useSessionStore((s) => s.session?.phase);
  const preCallIntel = useSessionStore((s) => s.session?.preCallIntel);
  const latest = useSessionStore((s) => s.session?.coachingPrompts?.at(-1));
  const promptCount = useSessionStore((s) => s.session?.coachingPrompts?.length ?? 0);

  const inferredSignalOnly = inferCoachingOverlaySignalOnly(pathname ?? undefined, phase);
  const signalOnly = variant === "auto" ? inferredSignalOnly : variant === "signal-only";

  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [railOpen, setRailOpen] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(RAIL_PREF_KEY);
      if (v === "closed") setRailOpen(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(RAIL_PREF_KEY, railOpen ? "open" : "closed");
    } catch {
      /* ignore */
    }
  }, [railOpen]);

  useEffect(() => {
    if (signalOnly) return;
    const id = latest?.id ?? null;
    if (id && id !== dismissedId) {
      setIsExpanded(true);
    }
  }, [latest?.id, signalOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasIntel = !!preCallIntel;
  const showPrompt = !!(latest && latest.id !== dismissedId);
  const hasRail = hasIntel || showPrompt;

  if (skipOnDemo) return null;
  if (!hasRail) return null;

  const signalKey =
    showPrompt && (latest.signal === "green" || latest.signal === "yellow" || latest.signal === "red")
      ? latest.signal
      : "yellow";
  const meta = SIGNAL_META[signalKey];

  const header = (
    <div className={cn("flex items-center justify-between border-b border-border/40 px-3 py-2")}>
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", meta.dotClass)} />
        <span className="text-xs font-medium text-muted">{signalOnly ? "Signal" : "Live coaching"}</span>
        {promptCount > 1 && (
          <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] text-muted">{promptCount}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {showPrompt && (
          <>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.badgeClass)}>
              {meta.label.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded((e) => !e)}
              className="rounded-lg p-1 text-muted transition hover:text-foreground"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                setDismissedId(latest.id);
                setIsExpanded(false);
              }}
              className="rounded-lg p-1 text-muted transition hover:text-foreground"
              aria-label="Dismiss"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );

  const promptBody =
    showPrompt && isExpanded ? (
      signalOnly ? (
        <div className={cn("rounded-xl border bg-card/95 p-3", meta.borderClass)}>
          <p className="text-[11px] leading-snug text-muted">
            Lines & next moves: <span className="font-medium text-foreground/90">For you</span> column (not on main
            screen).
          </p>
        </div>
      ) : (
        <div className={cn("rounded-xl border bg-card/95 p-4", meta.borderClass)}>
          {latest.buySignal && (
            <div className="mb-3 rounded-xl border border-signal-green/20 bg-signal-green/10 px-3 py-2">
              <p className="text-xs font-medium text-signal-green">Buy signal</p>
              <p className="mt-0.5 text-xs text-foreground">{latest.buySignal}</p>
            </div>
          )}
          <div className="mb-2">
            <p className="mb-0.5 text-[10px] font-medium text-muted">Say this</p>
            <p className="text-sm font-medium leading-snug text-foreground">&ldquo;{latest.audioCue}&rdquo;</p>
          </div>
          <div>
            <p className="mb-0.5 text-[10px] font-medium text-muted">Next</p>
            <p className="text-xs leading-relaxed text-muted">{latest.nextMove}</p>
          </div>
        </div>
      )
    ) : showPrompt && !isExpanded ? (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border bg-card/95 px-3 py-2.5 text-left shadow-soft transition hover:shadow-md",
          meta.borderClass
        )}
        aria-label={signalOnly ? "Expand signal" : "Expand coaching"}
      >
        <span className={cn("h-2 w-2 flex-shrink-0 rounded-full animate-pulse", meta.dotClass)} />
        <span className="text-xs font-medium text-muted">{signalOnly ? "Signal" : "Coaching"}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.badgeClass)}>{meta.label}</span>
      </button>
    ) : (
      <p className="text-[11px] leading-snug text-muted">
        Scout intel ready. Prompts appear here — tactics stay in the rep column.
      </p>
    );

  return (
    <div
      className={cn(
        "fixed right-0 top-20 bottom-10 z-[46] flex w-[min(100vw-1rem,320px)] flex-col border-l border-border/80 bg-card/95 shadow-soft backdrop-blur-xl transition-transform duration-300 ease-out",
        railOpen ? "translate-x-0" : "translate-x-[calc(100%-2.75rem)]"
      )}
    >
      <button
        type="button"
        onClick={() => setRailOpen((o) => !o)}
        className="absolute left-0 top-1/2 z-10 flex h-24 w-10 -translate-x-full -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-border/80 bg-card/95 text-[10px] font-semibold uppercase tracking-wider text-muted shadow-soft backdrop-blur-xl transition hover:text-foreground"
        aria-expanded={railOpen}
        aria-label={railOpen ? "Collapse coaching rail" : "Expand coaching rail"}
      >
        Coach
      </button>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{promptBody}</div>
      </div>
    </div>
  );
}
