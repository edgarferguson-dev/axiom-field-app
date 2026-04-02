"use client";

import type { ConstraintKey, FieldSnapshotKey } from "@/types/session";
import { cn } from "@/lib/utils/cn";
import {
  FIELD_SNAPSHOT_OPTIONS,
  BUSINESS_CONSTRAINT_OPTIONS,
  SEVERITY_CYCLE,
  type ConstraintSeverity,
} from "@/lib/field/constraintsCapture";

const SEVERITY_BADGE: Record<
  ConstraintSeverity,
  { label: string; className: string }
> = {
  high: { label: "High", className: "bg-signal-red/15 text-signal-red border-signal-red/30" },
  medium: {
    label: "Med",
    className: "bg-signal-yellow/15 text-signal-yellow border-signal-yellow/30",
  },
  low: { label: "Low", className: "bg-border text-muted border-border" },
};

type ConstraintsCapturePanelProps = {
  fieldSnapshot: FieldSnapshotKey[];
  onToggleField: (key: FieldSnapshotKey) => void;
  constraintMap: Map<ConstraintKey, ConstraintSeverity>;
  onToggleConstraint: (key: ConstraintKey) => void;
  onCycleConstraintSeverity: (key: ConstraintKey, e: React.SyntheticEvent) => void;
};

export function ConstraintsCapturePanel({
  fieldSnapshot,
  onToggleField,
  constraintMap,
  onToggleConstraint,
  onCycleConstraintSeverity,
}: ConstraintsCapturePanelProps) {
  return (
    <div className="space-y-8 rounded-2xl border border-accent/20 bg-gradient-to-b from-sky-50/90 to-surface p-5 shadow-sm ring-1 ring-slate-900/[0.03] sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Constraints
        </p>
        <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
          What pressure is visible? What&apos;s likely being missed?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Diagnose on-site context and operational leaks — not observations for a log. Tap chips;
          use severity on business constraints when it matters for the close.
        </p>
      </div>

      {/* Field snapshot */}
      <section aria-labelledby="field-snapshot-heading">
        <h4
          id="field-snapshot-heading"
          className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground"
        >
          Field snapshot
        </h4>
        <p className="mb-3 text-xs text-muted">
          Which operational constraints are visible at the door or window — traffic, staffing,
          energy?
        </p>
        <div className="flex flex-wrap gap-2">
          {FIELD_SNAPSHOT_OPTIONS.map(({ key, label, hint }) => {
            const on = fieldSnapshot.includes(key);
            return (
              <button
                key={key}
                type="button"
                title={hint}
                onClick={() => onToggleField(key)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all duration-150 sm:text-sm",
                  on
                    ? "border-accent/50 bg-accent/10 text-foreground shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                    : "border-border bg-surface text-foreground/90 hover:border-accent/35 hover:bg-slate-50"
                )}
              >
                <span className="block leading-snug">{label}</span>
                <span className="mt-0.5 block text-[10px] font-normal text-muted sm:text-xs">
                  {hint}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Business constraints */}
      <section aria-labelledby="business-constraints-heading">
        <h4
          id="business-constraints-heading"
          className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground"
        >
          Business constraints
        </h4>
        <p className="mb-3 text-xs text-muted">
          What is blocking revenue — follow-up, trust, nurture, pipeline, proof, or lead handling?
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BUSINESS_CONSTRAINT_OPTIONS.map(({ key, label, hint }) => {
            const on = constraintMap.has(key);
            const sev = constraintMap.get(key);
            const badge = sev ? SEVERITY_BADGE[sev] : null;

            return (
              <div key={key} className="relative">
                <button
                  type="button"
                  onClick={() => onToggleConstraint(key)}
                  className={cn(
                    "relative w-full rounded-xl border px-3 py-3 text-left transition-all duration-150",
                    on
                      ? "border-accent/40 bg-accent/8"
                      : "border-border bg-card hover:border-accent/25 hover:bg-surface"
                  )}
                >
                {on && badge && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => onCycleConstraintSeverity(key, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onCycleConstraintSeverity(key, e);
                      }
                    }}
                    className={cn(
                      "absolute right-2 top-2 cursor-pointer rounded-full border px-1.5 py-0.5 text-[9px] font-semibold",
                      badge.className
                    )}
                  >
                    {badge.label}
                  </span>
                )}
                  <span className="block text-xs font-semibold leading-snug text-foreground">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-muted">{hint}</span>
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] text-muted sm:text-xs">
          Selected: tap the High / Med / Low pill to cycle severity (defaults to High when you
          select).
        </p>
      </section>
    </div>
  );
}

/** Default severity when toggling a business constraint on */
export function defaultConstraintSeverity(): ConstraintSeverity {
  return SEVERITY_CYCLE[0];
}
