"use client";

import { cn } from "@/lib/utils/cn";
import type { CloseOutcomeType } from "@/types/session";
import {
  CLOSE_OUTCOMES,
  CLOSE_FOLLOW_UP_REASONS,
  CLOSE_FOLLOW_UP_TIMINGS,
  CLOSE_LOSS_REASONS,
  CLOSE_PACKAGES,
} from "@/lib/close/closeOptions";

export type CloseStageSurfaceProps = {
  businessName: string;
  selected: CloseOutcomeType | null;
  onSelectOutcome: (type: CloseOutcomeType | null) => void;
  packageSelected: string;
  onPackageSelected: (p: string) => void;
  proposalRecipient: string;
  onProposalRecipientChange: (v: string) => void;
  decisionMakerName: string;
  onDecisionMakerNameChange: (v: string) => void;
  followUpReason: string;
  onFollowUpReasonChange: (v: string) => void;
  followUpTiming: string;
  onFollowUpTimingChange: (v: string) => void;
  lossReason: string;
  onLossReasonChange: (v: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  canFinalize: boolean;
  onFinalize: () => void;
};

export function CloseStageSurface({
  businessName,
  selected,
  onSelectOutcome,
  packageSelected,
  onPackageSelected,
  proposalRecipient,
  onProposalRecipientChange,
  decisionMakerName,
  onDecisionMakerNameChange,
  followUpReason,
  onFollowUpReasonChange,
  followUpTiming,
  onFollowUpTimingChange,
  lossReason,
  onLossReasonChange,
  notes,
  onNotesChange,
  canFinalize,
  onFinalize,
}: CloseStageSurfaceProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Phase 5 · Close</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">What happened?</h2>
        <p className="mt-1 text-sm text-muted">
          {businessName} · Select the outcome and capture next steps.
        </p>
      </div>

      <div className="space-y-2">
        {CLOSE_OUTCOMES.map((o) => {
          const isActive = selected === o.type;
          return (
            <button
              key={o.type}
              type="button"
              onClick={() => onSelectOutcome(isActive ? null : o.type)}
              className={cn(
                "w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-150",
                isActive ? o.activeColor : o.color
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{o.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{o.sub}</p>
                </div>
                <div
                  className={cn(
                    "h-4 w-4 flex-shrink-0 rounded-full border-2 transition-all",
                    isActive ? "border-accent bg-accent" : "border-border"
                  )}
                />
              </div>

              {isActive && (
                <div
                  className="mt-4 space-y-3 border-t border-border/40 pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(o.type === "start-now" || o.type === "send-proposal" || o.type === "book-setup-call") && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Package
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_PACKAGES.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => onPackageSelected(p)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                              packageSelected === p
                                ? "border-accent bg-accent text-white"
                                : "border-border text-muted hover:border-accent/40 hover:text-foreground"
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {o.type === "send-proposal" && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Send to (name / email)
                      </label>
                      <input
                        type="text"
                        value={proposalRecipient}
                        onChange={(e) => onProposalRecipientChange(e.target.value)}
                        placeholder="Owner name or email…"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                      />
                    </div>
                  )}

                  {o.type === "need-decision-maker" && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Decision-Maker Name (if known)
                      </label>
                      <input
                        type="text"
                        value={decisionMakerName}
                        onChange={(e) => onDecisionMakerNameChange(e.target.value)}
                        placeholder="Owner / manager name…"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                      />
                    </div>
                  )}

                  {(o.type === "follow-up-later" || o.type === "need-decision-maker") && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Reason
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_FOLLOW_UP_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onFollowUpReasonChange(r)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                              followUpReason === r
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-muted hover:border-accent/30 hover:text-foreground"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(o.type === "follow-up-later" || o.type === "need-decision-maker") && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Follow Up In
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_FOLLOW_UP_TIMINGS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => onFollowUpTimingChange(t)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                              followUpTiming === t
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-muted hover:border-accent/30 hover:text-foreground"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(o.type === "not-interested" || o.type === "not-a-fit") && (
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Loss Reason
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_LOSS_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onLossReasonChange(r)}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                              lossReason === r
                                ? "border-signal-red/50 bg-signal-red/10 text-signal-red"
                                : "border-border text-muted hover:border-signal-red/30 hover:text-foreground"
                            )}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => onNotesChange(e.target.value)}
                      rows={2}
                      placeholder="Anything else worth capturing…"
                      className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onFinalize}
        disabled={!canFinalize}
        className="w-full rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
      >
        Finalize Session →
      </button>
    </div>
  );
}
