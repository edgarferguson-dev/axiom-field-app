"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { runDisposition } from "@/lib/flows/dispositionEngine";
import { calculateScore } from "@/lib/flows/scoringEngine";
import { SessionShell } from "@/components/layout/session-shell";
import { cn } from "@/lib/utils/cn";

const OUTCOME_STYLES: Record<string, { badge: string; label: string }> = {
  closed: { badge: "border-signal-green/20 bg-signal-green/10 text-signal-green", label: "Closed" },
  "follow-up": { badge: "border-signal-yellow/20 bg-signal-yellow/10 text-signal-yellow", label: "Follow-Up" },
  "not-interested": { badge: "border-signal-red/20 bg-signal-red/10 text-signal-red", label: "Not Interested" },
  "not-fit": { badge: "border-signal-red/20 bg-signal-red/10 text-signal-red", label: "Not a Fit" },
  "no-decision": { badge: "border-border bg-surface text-muted", label: "No Decision" },
};

const TREND_COLOR: Record<string, string> = {
  improving: "text-signal-green",
  declining: "text-signal-red",
  mixed: "text-signal-yellow",
  neutral: "text-muted",
};

export default function DispositionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setScore = useSessionStore((s) => s.setScore);
  const setDisposition = useSessionStore((s) => s.setDisposition);
  const setPhase = useSessionStore((s) => s.setPhase);
  const markCompleted = useSessionStore((s) => s.markCompleted);

  const result = useMemo(() => (session ? runDisposition(session) : null), [session]);
  const score = useMemo(() => (session ? calculateScore(session) : null), [session]);

  useEffect(() => {
    if (!session) return;
    setPhase("disposition");
  }, [session, setPhase]);

  if (!session || !result || !score) {
    return (
      <SessionShell>
        <div className="text-sm text-muted">No active session found.</div>
      </SessionShell>
    );
  }

  const outcomeStyle = OUTCOME_STYLES[result.outcome] ?? OUTCOME_STYLES["no-decision"];
  const signals = session.signals;

  const handleFinalize = () => {
    markCompleted();
    setScore(score);
    setDisposition(result);
    setPhase("recap");
    router.push(`/session/${params.sessionId}/recap`);
  };

  return (
    <SessionShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Disposition
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Session Outcome</h2>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Outcome</p>
              <div className="mt-2">
                <span className={cn("rounded-full border px-3 py-1 text-sm font-medium", outcomeStyle.badge)}>
                  {outcomeStyle.label}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Confidence</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-semibold tabular-nums">{result.confidence}%</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Signal Trend</p>
              <div className={cn("mt-2 flex items-center gap-2 text-sm font-medium", TREND_COLOR[result.signalTrend])}>
                {result.signalTrend.charAt(0).toUpperCase() + result.signalTrend.slice(1)}
                <div className="flex items-center gap-1">
                  {signals.slice(-5).map((s, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        s === "green" ? "bg-signal-green" : s === "yellow" ? "bg-signal-yellow" : "bg-signal-red"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Objection Coverage</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums">{result.coverageScore}%</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      result.coverageScore >= 75 ? "bg-signal-green" : result.coverageScore >= 50 ? "bg-signal-yellow" : "bg-signal-red"
                    )}
                    style={{ width: `${result.coverageScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Summary</p>
              <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
            </div>

            {session.repNotes.trim().length > 0 && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Rep notes</p>
                <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed">
                  {session.repNotes.trim()}
                </p>
              </div>
            )}

            {result.presentation && (
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  Presentation Context
                </p>
                <div className="mt-2 grid gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">Proof engaged</span>
                    <span className="font-medium text-foreground">
                      {result.presentation.interactiveProofEngaged ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">Pricing response</span>
                    <span className="font-medium text-foreground">
                      {result.presentation.pricingResponse ?? "unknown"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">Pricing accepted</span>
                    <span className="font-medium text-foreground">
                      {result.presentation.pricingAccepted ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">Tier selected</span>
                    <span className="font-medium text-foreground">
                      {result.presentation.pricingTierSelected ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted">Open account started</span>
                    <span className="font-medium text-foreground">
                      {result.presentation.openAccountStarted ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Hidden Objection</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{result.hiddenObjection}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Next Action</p>
              <p className="mt-2 text-sm font-medium text-accent">{result.nextAction}</p>
            </div>
          </div>
        </div>

        {result.repMistake && (
          <div className="rounded-2xl border border-signal-red/20 bg-signal-red/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal-red">
              Rep Mistake Detected
            </p>
            <p className="mt-2 text-sm leading-relaxed text-signal-red/80">{result.repMistake}</p>
          </div>
        )}

        <button
          onClick={handleFinalize}
          className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Finalize and Generate Performance Score
        </button>
      </div>
    </SessionShell>
  );
}
