"use client";

import { PresentationEngine } from "@/components/presentation/PresentationEngine";
import type { BusinessProfile } from "@/types/session";

export type DemoPresentationHandlers = {
  onInteractiveProofMilestone?: () => void;
  onPricingAccept?: () => void;
  onOpenAccount?: () => void;
  onHesitate?: () => void;
  onReject?: () => void;
};

export type DemoPresentationSurfaceProps = {
  business: BusinessProfile | null | undefined;
  started: boolean;
  onStart: () => void;
  proceedToPricingSignal: number;
  presentationHandlers: DemoPresentationHandlers;
};

/**
 * Buyer-facing column: structured presentation only (no rep tactics — those stay private).
 */
export function DemoPresentationSurface({
  business,
  started,
  onStart,
  proceedToPricingSignal,
  presentationHandlers,
}: DemoPresentationSurfaceProps) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-44 rounded-t-2xl bg-gradient-to-b from-accent/[0.09] via-accent/[0.02] to-transparent"
        aria-hidden
      />
      <div className="relative space-y-10">
        <header className="flex flex-col gap-4 border-b border-border/25 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/50 bg-background/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Buyer view
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted/70">
                Main screen
              </span>
            </div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {business?.name ?? "Presentation"}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              {started
                ? "Walk the story in order — context, problem, proof, value, then offer."
                : "Start when the room is ready. The deck follows a clear arc from scout context into the offer."}
            </p>
            {business && (
              <p className="text-xs font-medium text-muted/90">
                {business.type} · {business.leadSource}
              </p>
            )}
          </div>
          {!started && (
            <button
              type="button"
              onClick={onStart}
              className="shrink-0 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(59,130,246,0.55)] transition hover:opacity-95"
            >
              Start presentation
            </button>
          )}
        </header>

        <PresentationEngine
          variant="continuous"
          proceedToPricingSignal={proceedToPricingSignal}
          onInteractiveProofMilestone={presentationHandlers.onInteractiveProofMilestone}
          onPricingAccept={presentationHandlers.onPricingAccept}
          onOpenAccount={presentationHandlers.onOpenAccount}
          onHesitate={presentationHandlers.onHesitate}
          onReject={presentationHandlers.onReject}
        />
      </div>
    </div>
  );
}
