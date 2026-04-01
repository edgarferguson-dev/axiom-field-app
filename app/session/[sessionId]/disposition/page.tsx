"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { runDisposition } from "@/lib/flows/dispositionEngine";
import { calculateScore } from "@/lib/flows/scoringEngine";
import { SessionShell } from "@/components/layout/session-shell";
import { cn } from "@/lib/utils/cn";
import type { DispositionStatus } from "@/types/disposition";

const STATUS_STYLES: Record<
  DispositionStatus,
  { badge: string; label: string }
> = {
  won:                   { badge: "border-signal-green/30 bg-signal-green/10 text-signal-green", label: "Won" },
  "proposal-sent":       { badge: "border-accent/30 bg-accent/10 text-accent",                  label: "Proposal Sent" },
  "follow-up-scheduled": { badge: "border-signal-yellow/30 bg-signal-yellow/10 text-signal-yellow", label: "Follow-Up Scheduled" },
  "needs-decision-maker":{ badge: "border-signal-yellow/30 bg-signal-yellow/10 text-signal-yellow", label: "Needs Decision-Maker" },
  "objection-unresolved":{ badge: "border-signal-red/20 bg-signal-red/10 text-signal-red",     label: "Objection Unresolved" },
  "no-fit":              { badge: "border-signal-red/20 bg-signal-red/10 text-signal-red",      label: "Not a Fit" },
  lost:                  { badge: "border-border bg-surface text-muted",                         label: "Lost" },
};

const TREND_COLOR: Record<string, string> = {
  improving: "text-signal-green",
  declining:  "text-signal-red",
  mixed:      "text-signal-yellow",
  neutral:    "text-muted",
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

  const result = useMemo(() => (session ? runDisposition(session) : null), [session]);
  const score = useMemo(() => (session ? calculateScore(session) : null), [session]);

  useEffect(() => {
    if (!session) return;
    setPhase("disposition");
  }, [session?.id, setPhase]);

  if (!session) {
    return (
      <SessionShell>
        <div className="space-y-3 text-sm text-muted">
          <p>No active session found.</p>
          <button type="button" onClick={() => router.push("/")} className="text-accent underline underline-offset-2">
            Return home to start a session
          </button>
        </div>
      </SessionShell>
    );
  }

  if (session.id !== params.sessionId) {
    return (
      <SessionShell>
        <div className="space-y-3 text-sm text-muted">
          <p>This URL does not match the loaded session.</p>
          <button type="button" onClick={() => router.push("/")} className="text-accent underline underline-offset-2">
            Go home
          </button>
        </div>
      </SessionShell>
    );
  }

  if (!result || !score) {
    return (
      <SessionShell>
        <div className="text-sm text-muted">Unable to compute disposition for this session.</div>
      </SessionShell>
    );
  }

  const statusStyle = STATUS_STYLES[result.status] ?? STATUS_STYLES["lost"];
  const signals = session.signals ?? [];
  const constraints = session.constraints ?? [];
  const closeOutcome = session.closeOutcome;

  const handleFinalize = () => {
    setScore(score);
    setDisposition(result);
    setPhase("recap");
    router.push(`/session/${params.sessionId}/recap`);
  };

  return (
    <SessionShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Phase 6 · Disposition
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Session Outcome</h2>
          <p className="mt-1 text-sm text-muted">
            {session.business?.name ?? "Unknown business"} · {session.repName}
          </p>
        </div>

        {/* Status + core metrics */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Status */}
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Status</p>
              <div className="mt-2">
                <span className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", statusStyle.badge)}>
                  {statusStyle.label}
                </span>
              </div>
            </div>

            {/* Confidence */}
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

            {/* Signal trend */}
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

            {/* Objection coverage */}
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

            {/* Package interest */}
            {result.packageInterest && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Package Interest</p>
                <p className="mt-2 text-sm font-medium text-foreground">{result.packageInterest}</p>
              </div>
            )}

            {/* Follow-up timing */}
            {result.followUpTiming && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Follow Up</p>
                <p className="mt-2 text-sm font-medium text-accent">{result.followUpTiming}</p>
              </div>
            )}

            {/* Summary */}
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Summary</p>
              <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </div>

        {/* Close outcome detail */}
        {closeOutcome && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Close Details</p>
            <div className="space-y-2 text-sm">
              {closeOutcome.proposalRecipient && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Proposal to</span>
                  <span className="font-medium text-foreground">{closeOutcome.proposalRecipient}</span>
                </div>
              )}
              {closeOutcome.decisionMakerName && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Decision-maker</span>
                  <span className="font-medium text-foreground">{closeOutcome.decisionMakerName}</span>
                </div>
              )}
              {closeOutcome.followUpReason && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Reason</span>
                  <span className="font-medium text-foreground">{closeOutcome.followUpReason}</span>
                </div>
              )}
              {closeOutcome.lossReason && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Loss reason</span>
                  <span className="font-medium text-signal-red">{closeOutcome.lossReason}</span>
                </div>
              )}
              {closeOutcome.notes && (
                <div className="pt-1">
                  <p className="text-muted">Notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground">{closeOutcome.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Constraints identified */}
        {constraints.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Constraints Identified</p>
            <div className="flex flex-wrap gap-2">
              {constraints.map((c) => {
                const color =
                  c.severity === "high"
                    ? "border-signal-red/30 bg-signal-red/10 text-signal-red"
                    : c.severity === "medium"
                    ? "border-signal-yellow/30 bg-signal-yellow/10 text-signal-yellow"
                    : "border-border bg-surface text-muted";
                const label = c.key.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                return (
                  <span key={c.key} className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", color)}>
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Hidden objection */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Hidden Objection</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{result.hiddenObjection}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Next Action</p>
              <p className="mt-2 text-sm font-medium text-accent">
                {result.nextAction === "retry-close" && "Confirm onboarding details and book setup call."}
                {result.nextAction === "send-proposal" && "Send proposal promptly — momentum is warm."}
                {result.nextAction === "schedule-call" && "Book the setup or strategy call now."}
                {result.nextAction === "get-decision-maker" && "Schedule a return visit with the owner present."}
                {result.nextAction === "book-follow-up" && "Reach out at the agreed time with a clear reentry."}
                {result.nextAction === "disqualify" && "Log the outcome and move to the next opportunity."}
                {result.nextAction === "send-recap" && "Send a recap and keep the door open."}
              </p>
            </div>
          </div>
        </div>

        {/* Rep mistake */}
        {result.repMistake && (
          <div className="rounded-2xl border border-signal-red/20 bg-signal-red/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal-red">
              Rep Note
            </p>
            <p className="mt-2 text-sm leading-relaxed text-signal-red/80">{result.repMistake}</p>
          </div>
        )}

        {/* Rep notes */}
        {(session.repNotes ?? "").trim().length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Rep Notes</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {session.repNotes.trim()}
            </p>
          </div>
        )}

        {/* Presentation context */}
        {result.presentation && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Demo Context</p>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Proof engaged</span>
                <span className="font-medium text-foreground">{result.presentation.interactiveProofEngaged ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Pricing response</span>
                <span className="font-medium text-foreground">{result.presentation.pricingResponse ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Pricing accepted</span>
                <span className="font-medium text-foreground">{result.presentation.pricingAccepted ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Account started</span>
                <span className="font-medium text-foreground">{result.presentation.openAccountStarted ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleFinalize}
          className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Generate Performance Score →
        </button>
      </div>
    </SessionShell>
  );
}
