"use client";

import type { PerformanceScore, Session } from "@/types/session";
import { ScoreGauge } from "@/components/recap/ScoreGauge";
import { ScoreBar } from "@/components/recap/ScoreBar";

export type RecapStageSurfaceProps = {
  session: Session;
  durationMin: number;
  loading: boolean;
  error: string | null;
  localScore: PerformanceScore | null;
  onNewSession: () => void;
  onExport: () => void;
};

export function RecapStageSurface({
  session,
  durationMin,
  loading,
  error,
  localScore,
  onNewSession,
  onExport,
}: RecapStageSurfaceProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Phase 3 · Post-Call Debrief</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Session Complete</h2>
        <p className="mt-1 text-sm text-muted">
          {session.repName} · {session.business?.name ?? "Unknown business"}
          {durationMin > 0 && ` · ${durationMin} min`}
        </p>
      </div>

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

      {localScore && !loading && (
        <div className="space-y-4 animate-slide-up">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <ScoreGauge score={localScore.overall} />
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Overall Performance</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{localScore.summary}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Score Breakdown</p>
            <div className="space-y-4">
              <ScoreBar label="Discovery" value={localScore.breakdown.discovery} />
              <ScoreBar label="Positioning" value={localScore.breakdown.positioning} />
              <ScoreBar label="Objection Handling" value={localScore.breakdown.objectionHandling} />
              <ScoreBar label="Closing" value={localScore.breakdown.closing} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-signal-green/20 bg-signal-green/5 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-signal-green">Strengths</p>
              <ul className="space-y-2">
                {localScore.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-signal-green" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-signal-yellow/20 bg-signal-yellow/5 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-signal-yellow">Improvements</p>
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
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Rep notes</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{session.repNotes.trim()}</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Session Data</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-semibold">{session.coachingPrompts?.length ?? 0}</p>
                <p className="mt-0.5 text-xs text-muted">Coaching Prompts</p>
              </div>
              <div>
                <p className="text-xl font-semibold">{durationMin || "—"}</p>
                <p className="mt-0.5 text-xs text-muted">Minutes</p>
              </div>
              <div>
                <p className="text-xl font-semibold">{session.preCallIntel ? "Yes" : "No"}</p>
                <p className="mt-0.5 text-xs text-muted">Pre-Call Done</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNewSession}
              className="flex-1 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              New Session
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
