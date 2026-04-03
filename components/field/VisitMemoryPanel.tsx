"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import type { PostRunCapture } from "@/types/postRunCapture";
import {
  formatVisitDate,
  lastVisitForBusiness,
  nextVisitGuidanceLines,
  normalizeVisitBusinessKey,
  POST_RUN_RESULT_LABEL,
} from "@/lib/field/visitMemory";

function VisitCard({ c, dense }: { c: PostRunCapture; dense?: boolean }) {
  const date = formatVisitDate(c.capturedAt);
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/80 px-3 py-2.5",
        dense && "py-2"
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <p className="text-sm font-semibold text-foreground">{c.businessNameSnapshot}</p>
        {date ? <span className="text-[10px] font-medium uppercase tracking-wide text-muted">{date}</span> : null}
      </div>
      {c.businessTypeSnapshot ? (
        <p className="mt-0.5 text-[11px] text-muted">{c.businessTypeSnapshot}</p>
      ) : null}
      <p className="mt-1.5 text-[11px] leading-snug text-foreground/90">
        <span className="font-semibold text-accent">{c.packLabelSnapshot}</span>
        <span className="text-border"> · </span>
        <span>{c.offerLabelSnapshot}</span>
        <span className="text-border"> · </span>
        <span>{POST_RUN_RESULT_LABEL[c.result]}</span>
      </p>
      <dl className="mt-2 grid gap-1 text-[11px] text-muted">
        <div className="flex flex-wrap gap-x-1">
          <dt className="font-semibold text-foreground/70">Reaction</dt>
          <dd>{c.strongestOwnerReaction}</dd>
        </div>
        <div className="flex flex-wrap gap-x-1">
          <dt className="font-semibold text-foreground/70">Objection</dt>
          <dd>{c.primaryObjection}</dd>
        </div>
        <div className="flex flex-wrap gap-x-1">
          <dt className="font-semibold text-foreground/70">Ask</dt>
          <dd>
            {c.askMade
              ? c.askTiming === "too_early"
                ? "Too early"
                : c.askTiming === "too_late"
                  ? "Too late"
                  : c.askTiming === "on_time"
                    ? "On time"
                    : "—"
              : "Not made"}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-1">
          <dt className="font-semibold text-foreground/70">Same run again?</dt>
          <dd className="capitalize">{c.reuseSameRun}</dd>
        </div>
        {c.notes.trim() ? (
          <div className="flex flex-wrap gap-x-1">
            <dt className="font-semibold text-foreground/70">Next time</dt>
            <dd className="text-foreground/85">{c.notes.trim()}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

type VisitMemoryPanelProps = {
  /** Current form or session business name — used to match last visit */
  businessNameHint: string;
  /** Max rows in recent list */
  recentLimit?: number;
  /** Tighter spacing on demo private rail */
  compact?: boolean;
};

/**
 * Local visit memory: last time at this business + collapsible recent log.
 * Rep-facing only — not shown on public demo.
 */
export function VisitMemoryPanel({
  businessNameHint,
  recentLimit = 8,
  compact,
}: VisitMemoryPanelProps) {
  const captures = useSessionStore((s) => s.postRunCaptures);
  const [recentOpen, setRecentOpen] = useState(false);

  const lastHere = useMemo(
    () => lastVisitForBusiness(captures, businessNameHint),
    [captures, businessNameHint]
  );

  const recent = useMemo(() => captures.slice(0, recentLimit), [captures, recentLimit]);

  const showLastBlock =
    !!lastHere && normalizeVisitBusinessKey(businessNameHint).length >= 2;

  /** Avoid duplicating the “last here” card in the global recent list. */
  const recentToList = useMemo(() => {
    if (!lastHere || !showLastBlock) return recent;
    return recent.filter((c) => c.id !== lastHere.id);
  }, [recent, lastHere, showLastBlock]);

  const guidance = useMemo(
    () => (lastHere ? nextVisitGuidanceLines(lastHere) : []),
    [lastHere]
  );

  if (!captures.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card px-3 py-3 shadow-soft ring-1 ring-foreground/[0.06]",
        compact && "px-2.5 py-2.5"
      )}
      aria-label="Visit memory"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Visit memory</p>
          <p className="mt-0.5 text-xs text-muted">Local only — quick recall before you pitch.</p>
        </div>
      </div>

      {showLastBlock ? (
        <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Last time here</p>
          {lastHere ? <VisitCard c={lastHere} dense={compact} /> : null}
          {guidance.length ? (
            <div className="rounded-xl border border-accent/20 bg-accent/[0.06] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-accent">Next visit</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-[11px] leading-snug text-foreground/90">
                {guidance.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : normalizeVisitBusinessKey(businessNameHint).length >= 2 ? (
        <p className="mt-3 border-t border-border/50 pt-3 text-[11px] text-muted">
          No saved visit for this business name yet — log one after your run.
        </p>
      ) : null}

      {recentToList.length > 0 ? (
        <div className="mt-3 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={() => setRecentOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left"
            aria-expanded={recentOpen}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
              Recent visits ({recentToList.length})
            </span>
            <span className="text-xs font-semibold text-accent">{recentOpen ? "Hide" : "Show"}</span>
          </button>
          {recentOpen ? (
            <div className="mt-2 space-y-2">
              {recentToList.map((c) => (
                <VisitCard key={c.id} c={c} dense />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
