"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionShell } from "@/components/layout/session-shell";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils/cn";
import type { ConstraintKey, ConstraintSeverity, BusinessConstraint } from "@/types/session";

// ── Constraint catalog ─────────────────────────────────────────────────────

const CONSTRAINTS: { key: ConstraintKey; label: string; sub: string }[] = [
  { key: "missed-calls",          label: "Missed Calls",          sub: "Calls going unanswered" },
  { key: "no-booking",            label: "No Booking System",     sub: "Manual scheduling only" },
  { key: "weak-reviews",          label: "Weak Reviews",          sub: "Low Google rating / few reviews" },
  { key: "slow-follow-up",        label: "Slow Follow-Up",        sub: "Leads going cold" },
  { key: "weak-online-presence",  label: "Weak Online Presence",  sub: "Hard to find / low visibility" },
  { key: "no-automation",         label: "No Automation",         sub: "Everything is manual" },
  { key: "poor-retention",        label: "Poor Retention",        sub: "Customers don't come back" },
  { key: "no-reactivation",       label: "No Reactivation",       sub: "Lost customers never contacted again" },
  { key: "inconsistent-pipeline", label: "Inconsistent Pipeline", sub: "No clear sales tracking" },
  { key: "no-nurture",            label: "No Lead Nurture",       sub: "Leads go cold with no follow-up" },
  { key: "owner-too-busy",        label: "Owner Too Busy",        sub: "No time to follow up or market" },
  { key: "no-clear-offer",        label: "No Clear Offer",        sub: "Value proposition is unclear" },
  { key: "low-trust",             label: "Low Trust / Proof",     sub: "Prospects can't verify credibility" },
  { key: "poor-lead-handling",    label: "Poor Lead Handling",    sub: "Leads mismanaged or lost" },
];

const SEVERITY_OPTIONS: { value: ConstraintSeverity; label: string; color: string }[] = [
  { value: "high",   label: "High",   color: "bg-signal-red/15 text-signal-red border-signal-red/30" },
  { value: "medium", label: "Med",    color: "bg-signal-yellow/15 text-signal-yellow border-signal-yellow/30" },
  { value: "low",    label: "Low",    color: "bg-border text-muted border-border" },
];

export default function ConstraintsPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setConstraints = useSessionStore((s) => s.setConstraints);
  const setPhase = useSessionStore((s) => s.setPhase);

  // local map: key → severity (undefined = not selected)
  const [selected, setSelected] = useState<Map<ConstraintKey, ConstraintSeverity>>(new Map());

  useEffect(() => {
    if (!session) return;
    setPhase("constraints");
    // Restore any previously saved constraints
    if (session.constraints?.length) {
      const m = new Map<ConstraintKey, ConstraintSeverity>();
      session.constraints.forEach((c) => m.set(c.key, c.severity));
      setSelected(m);
    }
  }, [session?.id, setPhase]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function toggleConstraint(key: ConstraintKey) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, "high");
      }
      return next;
    });
  }

  function cycleSeverity(key: ConstraintKey, e: React.MouseEvent) {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Map(prev);
      const cur = next.get(key);
      if (!cur) return next;
      const order: ConstraintSeverity[] = ["high", "medium", "low"];
      const idx = order.indexOf(cur);
      next.set(key, order[(idx + 1) % order.length]);
      return next;
    });
  }

  function handleContinue() {
    const constraints: BusinessConstraint[] = Array.from(selected.entries()).map(
      ([key, severity]) => ({ key, severity })
    );
    setConstraints(constraints);
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  function handleSkip() {
    setConstraints([]);
    setPhase("live-demo");
    router.push(`/session/${params.sessionId}/demo`);
  }

  const selectedCount = selected.size;

  return (
    <SessionShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Phase 2 · Constraints
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            What&apos;s blocking this business?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Select the constraints you see. Tap a selected item to cycle severity.
          </p>
        </div>

        {/* Constraint grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONSTRAINTS.map(({ key, label, sub }) => {
            const isSelected = selected.has(key);
            const severity = selected.get(key);
            const sevConfig = SEVERITY_OPTIONS.find((s) => s.value === severity);

            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleConstraint(key)}
                className={cn(
                  "relative rounded-xl border px-3 py-3 text-left transition-all duration-150",
                  isSelected
                    ? "border-accent/40 bg-accent/8 shadow-sm"
                    : "border-border bg-card hover:border-accent/25 hover:bg-surface"
                )}
              >
                {isSelected && sevConfig && (
                  <button
                    type="button"
                    onClick={(e) => cycleSeverity(key, e)}
                    className={cn(
                      "absolute right-2 top-2 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold",
                      sevConfig.color
                    )}
                  >
                    {sevConfig.label}
                  </button>
                )}
                <p
                  className={cn(
                    "text-xs font-semibold leading-snug",
                    isSelected ? "text-foreground" : "text-foreground/80"
                  )}
                >
                  {label}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted">{sub}</p>
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        {selectedCount > 0 && (
          <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
            <p className="text-xs text-muted">
              <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
              constraint{selectedCount !== 1 ? "s" : ""} identified
              {Array.from(selected.values()).filter((v) => v === "high").length > 0 && (
                <>
                  {" · "}
                  <span className="text-signal-red font-medium">
                    {Array.from(selected.values()).filter((v) => v === "high").length} high severity
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedCount === 0}
            className="flex-1 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:opacity-40"
          >
            Continue to Demo →
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition hover:border-accent/30 hover:text-foreground"
          >
            Skip
          </button>
        </div>
      </div>
    </SessionShell>
  );
}
