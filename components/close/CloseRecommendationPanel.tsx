"use client";

import { useSessionStore } from "@/store/session-store";
import type { CloseReadinessState } from "@/types/close";
import { formatClosePathLabel } from "@/lib/flows/closeEngine";
import { cn } from "@/lib/utils/cn";

const READINESS_LABEL: Record<CloseReadinessState, string> = {
  not_ready: "Not yet",
  advance_ready: "Keep building",
  soft_commit_ready: "Light ask",
  commit_ready: "Clear ask",
  recover_required: "Stabilize first",
};

/**
 * Rep-only RFC 2 panel: reads `closeAssessment` only; logs events — not pricing or deal execution.
 */
export function CloseRecommendationPanel() {
  const assessment = useSessionStore((s) => s.session?.closeAssessment);
  const markAttempted = useSessionStore((s) => s.markCloseAttempted);
  const markDeferred = useSessionStore((s) => s.markCloseDeferred);
  const markBlocked = useSessionStore((s) => s.markCloseBlocked);

  const rec = assessment?.recommendation;
  if (!assessment || !rec) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-3 py-3 text-xs text-muted">
        Close guidance appears once proof is initialized and moments are in sync.
      </div>
    );
  }

  return (
    <section
      className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-soft ring-1 ring-foreground/[0.06] sm:p-3.5"
      aria-label="Close guidance"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Close</p>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            rec.state === "commit_ready"
              ? "border-signal-green/40 bg-signal-green/10 text-signal-green"
              : rec.state === "recover_required" || rec.state === "not_ready"
                ? "border-signal-yellow/40 bg-signal-yellow/10 text-signal-yellow"
                : "border-border bg-surface text-muted"
          )}
        >
          {READINESS_LABEL[rec.state]}
        </span>
      </div>

      <p className="text-[11px] font-medium uppercase tracking-wide text-muted/90">
        {formatClosePathLabel(rec.path)}
      </p>

      <p className="text-xs leading-relaxed text-muted">{rec.rationale}</p>
      <p className="text-sm font-semibold leading-snug text-foreground">{rec.nextMoveLabel}</p>

      {rec.blockingIssue && (
        <p className="rounded-lg border border-signal-yellow/25 bg-signal-yellow/5 px-2.5 py-1.5 text-[11px] leading-snug text-foreground">
          <span className="font-semibold text-signal-yellow">Watch: </span>
          {rec.blockingIssue}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border/50 pt-2.5">
        <button
          type="button"
          onClick={() => markAttempted()}
          className="min-h-[40px] flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 sm:min-h-0 sm:flex-none"
        >
          Tried close
        </button>
        <button
          type="button"
          onClick={() => markDeferred()}
          className="min-h-[40px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent/35 hover:text-foreground sm:min-h-0 sm:flex-none"
        >
          Deferred
        </button>
        <button
          type="button"
          onClick={() => markBlocked()}
          className="min-h-[40px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent/35 hover:text-foreground sm:min-h-0 sm:flex-none"
        >
          Blocked
        </button>
      </div>
    </section>
  );
}
