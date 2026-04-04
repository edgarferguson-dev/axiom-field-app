"use client";

import { useEffect, useState } from "react";
import { PresentationEngine, type PresentationEndAction } from "@/components/presentation/PresentationEngine";
import { ProofPublicCard } from "@/components/proof/ProofPublicCard";
import { AxiomFieldLogo } from "@/components/branding/AxiomFieldLogo";
import { cn } from "@/lib/utils/cn";
import type { BusinessProfile } from "@/types/session";
import { ProofRunShell } from "@/components/proof/ProofRunShell";
import { ProofRunEntryGate } from "@/components/proof/ProofRunEntryGate";

export type DemoPresentationHandlers = {
  onInteractiveProofMilestone?: () => void;
  onPricingAccept?: () => void;
  onHesitate?: () => void;
  onReject?: () => void;
};

export type DemoPresentationSurfaceProps = {
  business: BusinessProfile | null | undefined;
  started: boolean;
  onStart: () => void;
  proceedToPricingSignal: number;
  presentationHandlers: DemoPresentationHandlers;
  onPresentationAction: (action: PresentationEndAction) => void;
  /** Hide redundant “Buyer view” chip when parent shows mode (e.g. public/private toggle). */
  hideBuyerBadge?: boolean;
  /** DaNI public: full-width deck, large type, minimal chrome. */
  presentationScale?: "default" | "dani";
  /** Session id for proof-run shell links + entry gate. */
  sessionId: string;
  /** When false, scout minimums are not met — block start and show gate. */
  canStartProofRun: boolean;
};

/**
 * Buyer-facing column: Proof Run sequence (rep tactics stay private).
 */
export function DemoPresentationSurface({
  business,
  started,
  onStart,
  proceedToPricingSignal,
  presentationHandlers,
  onPresentationAction,
  hideBuyerBadge = false,
  presentationScale = "default",
  sessionId,
  canStartProofRun,
}: DemoPresentationSurfaceProps) {
  const dani = presentationScale === "dani";
  const [buyerFullscreen, setBuyerFullscreen] = useState(false);

  useEffect(() => {
    if (!buyerFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuyerFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [buyerFullscreen]);

  return (
    <div
      className={cn(
        "relative",
        buyerFullscreen && "fixed inset-0 z-[90] overflow-auto bg-background p-6 sm:p-10"
      )}
    >
      <div className={cn("relative", dani ? "space-y-5 sm:space-y-6" : "space-y-10")}>
        <header
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
            dani ? "border-b border-border/35 pb-3 sm:pb-4" : "gap-6 border-b border-border/60 pb-8"
          )}
        >
          <div className={cn("min-w-0", dani ? "space-y-1" : "space-y-2")}>
            {dani && (
              <div className="mb-1 opacity-90 sm:mb-0">
                <AxiomFieldLogo size="sm" className="max-w-full" />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {!hideBuyerBadge && !dani && (
                <span className="ax-label rounded-full border border-border bg-background px-2 py-0.5">
                  Owner view
                </span>
              )}
              {started && (
                <button
                  type="button"
                  onClick={() => setBuyerFullscreen((f) => !f)}
                  className={cn(
                    "rounded-full border border-border/80 text-foreground transition hover:border-accent/40",
                    dani
                      ? "px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted"
                      : "ax-label px-2 py-0.5"
                  )}
                >
                  {buyerFullscreen ? "Exit" : "Fill screen"}
                </button>
              )}
            </div>
            <h2
              className={cn(
                "text-balance font-bold tracking-tight text-foreground",
                dani ? "text-2xl sm:text-3xl md:text-4xl" : "ax-h2"
              )}
            >
              {business?.name?.trim() ? business.name : "Proof Run"}
            </h2>
            {dani && started && (
              <p className="mt-2 max-w-xl text-sm font-medium leading-snug text-muted sm:text-base">
                Evidence → ask → leave-behind report. One controlled sequence.
              </p>
            )}
            {!dani && (
              <p className="max-w-xl text-base text-muted">
                {started
                  ? "Advance the run in order — question, evidence, probe, then one clear ask."
                  : "Start when the room is ready — tight questions, strong evidence, minimal talking."}
              </p>
            )}
            {business && !dani && (
              <p className="text-sm text-muted">
                {business.type} · {business.leadSource}
              </p>
            )}
          </div>
          {!started && (
            <button
              type="button"
              onClick={onStart}
              disabled={!canStartProofRun}
              className={cn(
                "shrink-0 rounded-xl bg-accent font-semibold text-white transition hover:opacity-90",
                dani ? "min-h-[52px] px-8 py-3.5 text-base shadow-sm" : "min-h-[48px] px-6 py-3 text-sm",
                !canStartProofRun && "cursor-not-allowed opacity-40 hover:opacity-40"
              )}
            >
              Start
            </button>
          )}
        </header>

        {!canStartProofRun ? <ProofRunEntryGate sessionId={sessionId} /> : null}

        {started && <ProofPublicCard started={started} />}

        {started && canStartProofRun ? <ProofRunShell sessionId={sessionId} /> : null}

        <PresentationEngine
          variant="continuous"
          daniSurface={dani}
          proofRunControlled={started && canStartProofRun}
          proceedToPricingSignal={proceedToPricingSignal}
          onInteractiveProofMilestone={presentationHandlers.onInteractiveProofMilestone}
          onPricingAccept={presentationHandlers.onPricingAccept}
          onPresentationAction={onPresentationAction}
          onHesitate={presentationHandlers.onHesitate}
          onReject={presentationHandlers.onReject}
        />
      </div>
    </div>
  );
}
