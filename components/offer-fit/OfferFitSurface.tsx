"use client";

import { cn } from "@/lib/utils/cn";
import { OFFER_FIT_TIER_STYLES } from "@/lib/offer-fit/tierStyles";
import { formatConstraintKey } from "@/lib/field/formatConstraintKey";
import type { BusinessConstraint } from "@/types/session";
import type { OfferFitResult } from "@/lib/flows/offerFitEngine";

export type OfferFitSurfaceProps = {
  businessName: string;
  constraints: BusinessConstraint[];
  fit: OfferFitResult;
  onProceed: () => void;
  onBack: () => void;
};

export function OfferFitSurface({
  businessName,
  constraints,
  fit,
  onProceed,
  onBack,
}: OfferFitSurfaceProps) {
  const tierStyle = OFFER_FIT_TIER_STYLES[fit.tier];

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-up">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Phase 4 · Offer Fit</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Here&apos;s what fits.</h2>
        <p className="mt-1 text-sm text-muted">
          {businessName} · Based on {constraints.length || "no"} identified constraint
          {constraints.length !== 1 ? "s" : ""}
        </p>
      </div>

      {constraints.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {constraints.map((c) => {
            const severityColor =
              c.severity === "high"
                ? "border-signal-red/30 bg-signal-red/10 text-signal-red"
                : c.severity === "medium"
                  ? "border-signal-yellow/30 bg-signal-yellow/10 text-signal-yellow"
                  : "border-border bg-surface text-muted";
            const label = formatConstraintKey(c.key);
            return (
              <span
                key={c.key}
                className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold", severityColor)}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Recommended Package</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight">{fit.tierLabel}</h3>
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", tierStyle.badge)}>
            {fit.tier.toUpperCase()}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/85">{fit.rationale}</p>

        <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Expected Result</p>
          <p className="mt-1 text-sm text-foreground">{fit.businessEffect}</p>
        </div>
      </div>

      {fit.components.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">What&apos;s Included</p>
          <div className="space-y-3">
            {fit.components.map((comp) => (
              <div key={comp.id} className="flex items-start gap-3">
                <div className={cn("mt-1 h-2 w-2 flex-shrink-0 rounded-full", tierStyle.dot)} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{comp.name}</p>
                    {comp.impact === "high" && (
                      <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-semibold text-accent">
                        HIGH IMPACT
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{comp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onProceed}
          className="flex-1 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Move to Close →
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-border px-4 py-3 text-sm text-muted transition hover:border-accent/30 hover:text-foreground"
        >
          Back
        </button>
      </div>
    </div>
  );
}
