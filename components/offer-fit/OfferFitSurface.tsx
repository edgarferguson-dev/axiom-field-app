"use client";

import { cn } from "@/lib/utils/cn";
import { AxiomCard } from "@/components/ui/AxiomCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
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

/**
 * Post-demo package fit — framed as forward motion toward commitment capture, not another admin screen.
 */
export function OfferFitSurface({
  businessName,
  constraints,
  fit,
  onProceed,
  onBack,
}: OfferFitSurfaceProps) {
  const tierStyle = OFFER_FIT_TIER_STYLES[fit.tier];

  return (
    <div className="mx-auto max-w-6xl space-y-12 animate-slide-up">
      <div className="space-y-6">
        <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 rounded-full bg-accent/80" aria-hidden />
        </div>
        <div>
          <p className="ax-label">Same visit · Package fit · Step 1 of 2</p>
          <h1 className="ax-h1 mt-3 text-balance">Here&apos;s what fits {businessName}</h1>
          <p className="mt-2 max-w-2xl text-base text-muted">
            You opened the account path — now anchor the recommendation before you record the decision.
          </p>
        </div>
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
                className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", severityColor)}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      <AxiomCard className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <p className="ax-label">Recommended package</p>
            <h2 className="ax-h2 mt-2">{fit.tierLabel}</h2>
          </div>
          <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", tierStyle.badge)}>
            {fit.tier.toUpperCase()}
          </span>
        </div>

        <p className="text-base leading-relaxed text-foreground">{fit.rationale}</p>

        <div className="rounded-lg border border-accent/20 bg-accent/[0.04] px-5 py-4">
          <p className="ax-label">Expected result</p>
          <p className="mt-2 text-base text-foreground">{fit.businessEffect}</p>
        </div>
      </AxiomCard>

      {fit.components.length > 0 && (
        <AxiomCard>
          <p className="ax-label mb-4">What&apos;s included</p>
          <div className="space-y-4">
            {fit.components.map((comp) => (
              <div key={comp.id} className="flex items-start gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                <div className={cn("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", tierStyle.dot)} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-foreground">{comp.name}</p>
                    {comp.impact === "high" && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                        High impact
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{comp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </AxiomCard>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SecondaryButton type="button" onClick={onBack} className="order-2 sm:order-1">
          Back
        </SecondaryButton>
        <PrimaryButton type="button" onClick={onProceed} className="order-1 w-full sm:order-2 sm:min-w-[280px]">
          Continue to commitment
        </PrimaryButton>
      </div>
    </div>
  );
}
