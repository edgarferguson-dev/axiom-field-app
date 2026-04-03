"use client";

import { cn } from "@/lib/utils/cn";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
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

/**
 * Commitment capture — calm, decisive, not a generic form dump.
 */
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
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="space-y-6">
        <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-border">
          <div className="h-full w-full rounded-full bg-accent-dark" aria-hidden />
        </div>
        <div>
          <p className="ax-label">Same visit · Commitment · Step 2 of 2</p>
          <h1 className="ax-h1 mt-3 text-balance">Confirm what they decided</h1>
          <p className="mt-2 max-w-2xl text-base text-muted">
            {businessName} — lock the outcome while it&apos;s fresh. This flows straight into disposition and recap.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {CLOSE_OUTCOMES.map((o) => {
          const isActive = selected === o.type;
          return (
            <button
              key={o.type}
              type="button"
              onClick={() => onSelectOutcome(isActive ? null : o.type)}
              className={cn(
                "w-full rounded-xl border px-5 py-4 text-left transition-all duration-150",
                isActive ? o.activeColor : o.color
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-foreground">{o.label}</p>
                  <p className="mt-0.5 text-sm text-muted">{o.sub}</p>
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
                  className="mt-5 space-y-4 border-t border-border/50 pt-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(o.type === "start-now" || o.type === "send-proposal" || o.type === "book-setup-call") && (
                    <div>
                      <label className="mb-2 block ax-label">Package</label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_PACKAGES.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => onPackageSelected(p)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm font-medium transition",
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
                      <label className="mb-2 block ax-label">Send to (name / email)</label>
                      <input
                        type="text"
                        value={proposalRecipient}
                        onChange={(e) => onProposalRecipientChange(e.target.value)}
                        placeholder="Owner name or email…"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                      />
                    </div>
                  )}

                  {o.type === "need-decision-maker" && (
                    <div>
                      <label className="mb-2 block ax-label">Decision-maker (if known)</label>
                      <input
                        type="text"
                        value={decisionMakerName}
                        onChange={(e) => onDecisionMakerNameChange(e.target.value)}
                        placeholder="Owner / manager name…"
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                      />
                    </div>
                  )}

                  {(o.type === "follow-up-later" || o.type === "need-decision-maker") && (
                    <div>
                      <label className="mb-2 block ax-label">Reason</label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_FOLLOW_UP_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onFollowUpReasonChange(r)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm font-medium transition",
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
                      <label className="mb-2 block ax-label">Follow up in</label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_FOLLOW_UP_TIMINGS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => onFollowUpTimingChange(t)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm font-medium transition",
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
                      <label className="mb-2 block ax-label">Loss reason</label>
                      <div className="flex flex-wrap gap-2">
                        {CLOSE_LOSS_REASONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => onLossReasonChange(r)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm font-medium transition",
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
                    <label className="mb-2 block ax-label">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => onNotesChange(e.target.value)}
                      rows={2}
                      placeholder="Anything else worth capturing…"
                      className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <PrimaryButton
        type="button"
        onClick={onFinalize}
        disabled={!canFinalize}
        className="w-full py-4 text-base disabled:opacity-40"
      >
        Finalize and continue to disposition
      </PrimaryButton>
    </div>
  );
}
