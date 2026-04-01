"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import type { CloseOutcomeType, CloseOutcome } from "@/types/session";

// ── Outcome config ─────────────────────────────────────────────────────────

type OutcomeConfig = {
  type: CloseOutcomeType;
  label: string;
  sub: string;
  color: string;
  activeColor: string;
};

const OUTCOMES: OutcomeConfig[] = [
  {
    type: "start-now",
    label: "Start Now",
    sub: "They're in — confirm package and contact",
    color: "border-border bg-card hover:border-signal-green/40",
    activeColor: "border-signal-green/50 bg-signal-green/8 shadow-sm",
  },
  {
    type: "send-proposal",
    label: "Send Proposal",
    sub: "They want it in writing first",
    color: "border-border bg-card hover:border-accent/40",
    activeColor: "border-accent/50 bg-accent/8 shadow-sm",
  },
  {
    type: "book-setup-call",
    label: "Book Setup Call",
    sub: "Committed — schedule the onboarding call",
    color: "border-border bg-card hover:border-accent/40",
    activeColor: "border-accent/50 bg-accent/8 shadow-sm",
  },
  {
    type: "need-decision-maker",
    label: "Need Decision-Maker",
    sub: "Not the right person — need to get the owner",
    color: "border-border bg-card hover:border-signal-yellow/40",
    activeColor: "border-signal-yellow/50 bg-signal-yellow/8 shadow-sm",
  },
  {
    type: "follow-up-later",
    label: "Follow Up Later",
    sub: "Interested but not ready today",
    color: "border-border bg-card hover:border-signal-yellow/40",
    activeColor: "border-signal-yellow/50 bg-signal-yellow/8 shadow-sm",
  },
  {
    type: "not-interested",
    label: "Not Interested",
    sub: "Passed — choose a loss reason",
    color: "border-border bg-card hover:border-signal-red/40",
    activeColor: "border-signal-red/50 bg-signal-red/8 shadow-sm",
  },
  {
    type: "not-a-fit",
    label: "Not a Fit",
    sub: "Business doesn't qualify for this solution",
    color: "border-border bg-card hover:border-signal-red/40",
    activeColor: "border-signal-red/50 bg-signal-red/8 shadow-sm",
  },
];

const PACKAGES = ["Core Starter", "Growth System", "Scale Package"];

const FOLLOW_UP_TIMINGS = [
  "Tomorrow",
  "This week",
  "Next week",
  "2 weeks",
  "1 month",
];

const LOSS_REASONS = [
  "Price too high",
  "Already has a solution",
  "No budget right now",
  "Not the right time",
  "Couldn't see the value",
  "Wrong contact / gatekeeper",
  "Other",
];

const FOLLOW_UP_REASONS = [
  "Wants to think it over",
  "Needs to review with partner",
  "Waiting on cash flow",
  "Currently under contract",
  "Wants to see results first",
  "Other",
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function ClosePage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setCloseOutcome = useSessionStore((s) => s.setCloseOutcome);
  const markCompleted = useSessionStore((s) => s.markCompleted);
  const setPhase = useSessionStore((s) => s.setPhase);

  const [selected, setSelected] = useState<CloseOutcomeType | null>(null);
  const [packageSelected, setPackageSelected] = useState("");
  const [proposalRecipient, setProposalRecipient] = useState("");
  const [decisionMakerName, setDecisionMakerName] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");
  const [followUpTiming, setFollowUpTiming] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!session) return;
    setPhase("closing");
  }, [session?.id, setPhase]);

  if (!session) {
    return (
      <SessionShell>
        <div className="space-y-3 text-sm text-muted">
          <p>No active session found.</p>
          <button type="button" onClick={() => router.push("/")} className="text-accent underline underline-offset-2">
            Return home
          </button>
        </div>
      </SessionShell>
    );
  }

  if (session.id !== params.sessionId) {
    return (
      <SessionShell>
        <div className="space-y-3 text-sm text-muted">
          <p>Session mismatch.</p>
          <button type="button" onClick={() => router.push("/")} className="text-accent underline underline-offset-2">
            Go home
          </button>
        </div>
      </SessionShell>
    );
  }

  function handleFinalize() {
    if (!selected) return;

    const outcome: CloseOutcome = {
      type: selected,
      packageSelected: packageSelected || undefined,
      proposalRecipient: proposalRecipient || undefined,
      decisionMakerName: decisionMakerName || undefined,
      followUpReason: followUpReason || undefined,
      followUpTiming: followUpTiming || undefined,
      lossReason: lossReason || undefined,
      notes: notes || undefined,
    };

    setCloseOutcome(outcome);
    markCompleted();
    setPhase("disposition");
    router.push(`/session/${params.sessionId}/disposition`);
  }

  const canFinalize = !!selected;

  return (
    <SessionShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Phase 5 · Close
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            What happened?
          </h2>
          <p className="mt-1 text-sm text-muted">
            {session.business?.name ?? "This business"} · Select the outcome and capture next steps.
          </p>
        </div>

        {/* Outcome selection */}
        <div className="space-y-2">
          {OUTCOMES.map((o) => {
            const isActive = selected === o.type;
            return (
              <button
                key={o.type}
                type="button"
                onClick={() => setSelected(isActive ? null : o.type)}
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

                {/* Expanded detail panel */}
                {isActive && (
                  <div
                    className="mt-4 space-y-3 border-t border-border/40 pt-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Package selection (start-now, send-proposal, book-setup-call) */}
                    {(o.type === "start-now" ||
                      o.type === "send-proposal" ||
                      o.type === "book-setup-call") && (
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          Package
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {PACKAGES.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPackageSelected(p)}
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

                    {/* Proposal recipient */}
                    {o.type === "send-proposal" && (
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          Send to (name / email)
                        </label>
                        <input
                          type="text"
                          value={proposalRecipient}
                          onChange={(e) => setProposalRecipient(e.target.value)}
                          placeholder="Owner name or email…"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                        />
                      </div>
                    )}

                    {/* Decision maker */}
                    {o.type === "need-decision-maker" && (
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          Decision-Maker Name (if known)
                        </label>
                        <input
                          type="text"
                          value={decisionMakerName}
                          onChange={(e) => setDecisionMakerName(e.target.value)}
                          placeholder="Owner / manager name…"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                        />
                      </div>
                    )}

                    {/* Follow-up reason */}
                    {(o.type === "follow-up-later" || o.type === "need-decision-maker") && (
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          Reason
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {FOLLOW_UP_REASONS.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setFollowUpReason(r)}
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

                    {/* Follow-up timing */}
                    {(o.type === "follow-up-later" || o.type === "need-decision-maker") && (
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          Follow Up In
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {FOLLOW_UP_TIMINGS.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFollowUpTiming(t)}
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

                    {/* Loss reason */}
                    {(o.type === "not-interested" || o.type === "not-a-fit") && (
                      <div>
                        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          Loss Reason
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {LOSS_REASONS.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setLossReason(r)}
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

                    {/* Notes (all outcomes) */}
                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Notes (optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
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

        {/* Finalize */}
        <button
          type="button"
          onClick={handleFinalize}
          disabled={!canFinalize}
          className="w-full rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
        >
          Finalize Session →
        </button>
      </div>
    </SessionShell>
  );
}
