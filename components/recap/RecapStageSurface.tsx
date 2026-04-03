"use client";

import type { CloseOutcomeType, PerformanceScore, Session } from "@/types/session";
import type { DispositionResult } from "@/types/disposition";
import { ScoreGauge } from "@/components/recap/ScoreGauge";
import { ScoreBar } from "@/components/recap/ScoreBar";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";

const CLOSE_LABEL: Partial<Record<CloseOutcomeType, string>> = {
  "start-now": "Start now",
  "send-proposal": "Send proposal",
  "book-setup-call": "Book setup call",
  "need-decision-maker": "Need decision-maker",
  "follow-up-later": "Follow up later",
  "not-interested": "Not interested",
  "not-a-fit": "Not a fit",
  "follow-up-booked": "Follow-up booked",
  "interested-not-ready": "Interested — needs review",
  "price-objection": "Price objection",
  "not-qualified": "Not qualified",
};

export type RecapStageSurfaceProps = {
  session: Session;
  durationMin: number;
  loading: boolean;
  error: string | null;
  localScore: PerformanceScore | null;
  onNewSession: () => void;
  onExport: () => void;
};

function dispositionSummary(d: DispositionResult): string {
  return d.summary?.trim() || d.status.replace(/-/g, " ");
}

export function RecapStageSurface({
  session,
  durationMin,
  loading,
  error,
  localScore,
  onNewSession,
  onExport,
}: RecapStageSurfaceProps) {
  const disposition = useSessionStore((s) => s.disposition);
  const closeLabel = session.closeOutcome?.type
    ? CLOSE_LABEL[session.closeOutcome.type] ?? session.closeOutcome.type
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-16">
      <section className="space-y-3">
        <p className="ax-label">After the visit · Performance recap</p>
        <h1 className="ax-h1">How the visit landed</h1>
        <p className="text-base text-muted">
          {session.repName} · {session.business?.name ?? "Unknown business"}
          {durationMin > 0 && ` · ${durationMin} min`}
        </p>
      </section>

      {loading && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 shadow-soft">
          <svg className="h-8 w-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-muted">Analysing session performance…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-signal-red/30 bg-signal-red/10 p-4">
          <p className="text-sm text-signal-red">{error}</p>
        </div>
      )}

      {!loading && (closeLabel || disposition) && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
          <p className="ax-label">Outcome</p>
          {closeLabel && (
            <p className="mt-2 text-sm font-medium text-foreground">
              Close: {closeLabel}
              {session.closeOutcome?.followUpTiming ? ` · ${session.closeOutcome.followUpTiming}` : ""}
            </p>
          )}
          {disposition && (
            <p className={cn("mt-2 text-sm text-muted", !closeLabel && "mt-0 text-foreground")}>
              Disposition: {dispositionSummary(disposition)}
            </p>
          )}
        </div>
      )}

      {localScore && !loading && (
        <div className="space-y-4 animate-slide-up">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <ScoreGauge score={localScore.overall} />
              <div className="flex-1 text-center sm:text-left">
                <p className="ax-label">Overall</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{localScore.summary}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
            <p className="ax-label mb-4">Breakdown</p>
            <div className="space-y-4">
              <ScoreBar label="Discovery" value={localScore.breakdown.discovery} />
              <ScoreBar label="Positioning" value={localScore.breakdown.positioning} />
              <ScoreBar label="Objection Handling" value={localScore.breakdown.objectionHandling} />
              <ScoreBar label="Closing" value={localScore.breakdown.closing} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-signal-green/20 bg-emerald-50/40 p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-signal-green">Strengths</p>
              <ul className="space-y-2">
                {localScore.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-signal-green" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-signal-yellow/25 bg-amber-50/40 p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-signal-yellow">Improvements</p>
              <ul className="space-y-2">
                {localScore.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-signal-yellow" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {session.repNotes?.trim() ? (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
              <p className="ax-label mb-3">Rep notes</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{session.repNotes.trim()}</p>
            </div>
          ) : null}

          {(session.closeState || session.primaryCTA) && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-soft">
              <p className="ax-label">Close rail</p>
              <p className="mt-2 text-sm text-foreground">
                Stage: {session.closeState ?? "—"} · Objection interrupt:{" "}
                {session.objectionTriggered ? "Yes" : "No"}
              </p>
              {session.primaryCTA ? (
                <p className="mt-1 line-clamp-2 text-xs text-muted">{session.primaryCTA}</p>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/80 bg-background/50 px-4 py-3 text-sm text-muted">
            <span>
              <span className="font-medium text-foreground">{session.coachingPrompts?.length ?? 0}</span> coaching lines
            </span>
            <span>
              <span className="font-medium text-foreground">{durationMin || "—"}</span> min
            </span>
            <span>
              Scout brief {session.preCallIntel ? "ready" : "skipped"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNewSession}
              className="flex-1 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              New visit
            </button>
            <button
              type="button"
              onClick={onExport}
              className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
            >
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
