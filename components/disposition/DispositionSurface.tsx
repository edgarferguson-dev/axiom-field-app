"use client";

import { cn } from "@/lib/utils/cn";
import { formatConstraintKey } from "@/lib/field/formatConstraintKey";
import { FIELD_SNAPSHOT_OPTIONS } from "@/lib/field/constraintsCapture";
import { DISPOSITION_STATUS_STYLES, DISPOSITION_TREND_COLOR } from "@/lib/disposition/dispositionStyles";
import type { Session } from "@/types/session";
import type { DispositionResult } from "@/types/disposition";

export type DispositionSurfaceProps = {
  session: Session;
  result: DispositionResult;
  onFinalize: () => void;
};

function humanizeConstraintKey(key: string): string {
  return key.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function DispositionSurface({ session, result, onFinalize }: DispositionSurfaceProps) {
  const statusStyle = DISPOSITION_STATUS_STYLES[result.status] ?? DISPOSITION_STATUS_STYLES["lost"];
  const signals = session.signals ?? [];
  const constraints = session.constraints ?? [];
  const closeOutcome = session.closeOutcome;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Phase 6 · Disposition</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Session Outcome</h2>
        <p className="mt-1 text-sm text-muted">
          {session.business?.name ?? "Unknown business"} · {session.repName}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Status</p>
            <div className="mt-2">
              <span className={cn("rounded-full border px-3 py-1.5 text-sm font-semibold", statusStyle.badge)}>
                {statusStyle.label}
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
            <div
              className={cn(
                "mt-2 flex items-center gap-2 text-sm font-medium",
                DISPOSITION_TREND_COLOR[result.signalTrend]
              )}
            >
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
                    result.coverageScore >= 75
                      ? "bg-signal-green"
                      : result.coverageScore >= 50
                        ? "bg-signal-yellow"
                        : "bg-signal-red"
                  )}
                  style={{ width: `${result.coverageScore}%` }}
                />
              </div>
            </div>
          </div>

          {result.packageInterest && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Package Interest</p>
              <p className="mt-2 text-sm font-medium text-foreground">{result.packageInterest}</p>
            </div>
          )}

          {result.followUpTiming && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Follow Up</p>
              <p className="mt-2 text-sm font-medium text-accent">{result.followUpTiming}</p>
            </div>
          )}

          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Summary</p>
            <p className="mt-2 text-sm leading-relaxed">{result.summary}</p>
          </div>
        </div>
      </div>

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

      {(session.fieldSnapshot?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Field snapshot</p>
          <div className="flex flex-wrap gap-2">
            {(session.fieldSnapshot ?? []).map((key) => {
              const label = FIELD_SNAPSHOT_OPTIONS.find((o) => o.key === key)?.label ?? key;
              return (
                <span
                  key={key}
                  className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent"
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

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
              const label = formatConstraintKey(c.key);
              return (
                <span key={c.key} className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", color)}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

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

      {result.repMistake && (
        <div className="rounded-2xl border border-signal-red/20 bg-signal-red/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal-red">Rep Note</p>
          <p className="mt-2 text-sm leading-relaxed text-signal-red/80">{result.repMistake}</p>
        </div>
      )}

      {(session.repNotes ?? "").trim().length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Rep Notes</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{session.repNotes!.trim()}</p>
        </div>
      )}

      {result.presentation && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">Demo Context</p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">Proof engaged</span>
              <span className="font-medium text-foreground">
                {result.presentation.interactiveProofEngaged ? "Yes" : "No"}
              </span>
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
        type="button"
        onClick={onFinalize}
        className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
      >
        Generate Performance Score →
      </button>
    </div>
  );
}
