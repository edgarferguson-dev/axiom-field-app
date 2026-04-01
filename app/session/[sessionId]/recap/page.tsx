"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import type { PerformanceScore } from "@/types/session";

// ── Score gauge (SVG arc, 270° sweep) ─────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const r = 52;
  const cx = 64;
  const cy = 64;
  const sweep = 270; // degrees
  const circumference = 2 * Math.PI * r;
  const arcLen = (sweep / 360) * circumference;
  const filled = (score / 100) * arcLen;
  const rotation = 135; // start at bottom-left

  const color =
    score >= 75 ? "#22C55E" : score >= 50 ? "#EAB308" : "#EF4444";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128">
        {/* Background arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1F2A3A"
          strokeWidth="8"
          strokeDasharray={`${arcLen} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        {/* Filled arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 0.8s ease-out" }}
        />
      </svg>
      {/* Score text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted">/ 100</span>
      </div>
    </div>
  );
}

// ── Sub-score bar ──────────────────────────────────────────────────────────
function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 75 ? "bg-signal-green" : value >= 50 ? "bg-signal-yellow" : "bg-signal-red";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-foreground">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function RecapPage() {
  const router = useRouter();
  const { session, setScore, clearSession, setPhase } = useSessionStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localScore, setLocalScore] = useState<PerformanceScore | null>(
    session?.score ?? null
  );

  useEffect(() => {
    if (!session) return;
    setPhase("recap");
  }, [session, setPhase]);

  useEffect(() => {
    if (!session || localScore) return;

    async function fetchScore() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
        });

        if (!res.ok) throw new Error("API error");

        const data = (await res.json()) as PerformanceScore;
        setScore(data);
        setLocalScore(data);
      } catch {
        setError("Unable to generate score. Check your API key.");
      } finally {
        setLoading(false);
      }
    }

    fetchScore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const durationMs =
    session?.completedAt && session?.startedAt
      ? session.completedAt - session.startedAt
      : 0;
  const durationMin = Math.round(durationMs / 60000);

  return (
    <SessionShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Phase 3 · Post-Call Debrief
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Session Complete
          </h2>
          {session && (
            <p className="mt-1 text-sm text-muted">
              {session.repName} · {session.business?.name ?? "Unknown business"}
              {durationMin > 0 && ` · ${durationMin} min`}
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 shadow-soft">
            <svg
              className="h-8 w-8 animate-spin text-accent"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
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

        {/* Score display */}
        {localScore && !loading && (
          <div className="space-y-4 animate-slide-up">
            {/* Overall score card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <ScoreGauge score={localScore.overall} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Overall Performance
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground">
                    {localScore.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                Score Breakdown
              </p>
              <div className="space-y-4">
                <ScoreBar label="Discovery" value={localScore.breakdown.discovery} />
                <ScoreBar label="Positioning" value={localScore.breakdown.positioning} />
                <ScoreBar
                  label="Objection Handling"
                  value={localScore.breakdown.objectionHandling}
                />
                <ScoreBar label="Closing" value={localScore.breakdown.closing} />
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-signal-green/20 bg-signal-green/5 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-signal-green">
                  Strengths
                </p>
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
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-signal-yellow">
                  Improvements
                </p>
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

            {session?.repNotes?.trim() ? (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  Rep notes
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {session.repNotes.trim()}
                </p>
              </div>
            ) : null}

            {/* Session metadata */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                Session Data
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xl font-semibold">
                    {session?.coachingPrompts.length ?? 0}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Coaching Prompts</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">{durationMin || "—"}</p>
                  <p className="mt-0.5 text-xs text-muted">Minutes</p>
                </div>
                <div>
                  <p className="text-xl font-semibold">
                    {session?.preCallIntel ? "Yes" : "No"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Pre-Call Done</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  clearSession();
                  router.push("/");
                }}
                className="flex-1 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
              >
                New Session
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:border-accent/40 hover:text-foreground"
              >
                Export
              </button>
            </div>
          </div>
        )}
      </div>
    </SessionShell>
  );
}
