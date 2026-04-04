"use client";

import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import type {
  InteractiveDemoEvent,
  InteractiveDemoState,
} from "@/lib/flows/interactiveDemoEngine";
import { InteractiveProof } from "@/components/presentation/InteractiveProof";
import { ProofLedBeat } from "@/components/presentation/ProofLedBeat";
import { HealthReportShareBeat } from "@/components/presentation/HealthReportShareBeat";
import { cn } from "@/lib/utils/cn";

type SlideRendererProps = {
  slide: PresentationSlide;
  tone?: "default" | "dani";
  interactiveProofState: InteractiveDemoState;
  onInteractiveProofDispatch: (event: InteractiveDemoEvent) => void;
  interactiveProofCompleted: boolean;
  /** Buyer-safe: skip the simulated walkthrough and advance the deck. */
  onSkipWalkthrough?: () => void;
};

function visualPlaceholderLabel(type: PresentationSlide["type"]): string {
  switch (type) {
    case "proof":
    case "interactive-proof":
      return "Proof — outcome, review, or before/after.";
    case "proof-snapshot":
    case "comparison-proof":
    case "mock-flow":
    case "impact-stat":
      return "Proof visual — pattern loads from pack registry.";
    case "decision-next":
      return "Decision bridge — short, one motion.";
    case "health-report-share":
      return "Share — one-page recap for the owner.";
    case "cost-roi":
      return "Numbers — simple chart or rough math.";
    case "solution":
      return "Diagram — how it fits their day.";
    case "pricing":
      return "Offer layout — tiers or comparison.";
    case "business-snapshot":
      return "Context — logo, street photo, or site grab.";
    default:
      return "Visual — screenshot, diagram, or image.";
  }
}

export function SlideRenderer({
  slide,
  tone = "default",
  interactiveProofState,
  onInteractiveProofDispatch,
  interactiveProofCompleted,
  onSkipWalkthrough,
}: SlideRendererProps) {
  const dani = tone === "dani";

  if (slide.type === "health-report-share") {
    return <HealthReportShareBeat tone={tone} />;
  }

  if (
    slide.type === "proof-snapshot" ||
    slide.type === "mock-flow" ||
    slide.type === "comparison-proof" ||
    slide.type === "impact-stat" ||
    slide.type === "decision-next"
  ) {
    return <ProofLedBeat slide={slide} tone={tone} />;
  }

  if (slide.type === "interactive-proof") {
    return (
      <div className={cn("space-y-8", dani && "space-y-10")}>
        <div
          className={cn(
            "border-l-2 border-accent/30 pl-5",
            dani && "rounded-2xl border border-border/50 border-l-[3px] border-l-accent/50 bg-card/40 py-5 pl-6 pr-4 sm:pl-8"
          )}
        >
          <p className="ax-label">Evidence</p>
          <p
            className={cn(
              "mt-2 leading-snug text-foreground",
              dani ? "text-lg font-medium sm:text-xl md:text-2xl" : "text-base leading-relaxed"
            )}
          >
            {slide.prompt}
          </p>
        </div>

        <div className={dani ? "rounded-2xl border border-border/45 bg-card/30 p-3 sm:p-4" : undefined}>
          <InteractiveProof state={interactiveProofState} onDispatch={onInteractiveProofDispatch} />
        </div>

        {interactiveProofCompleted && (
          <p className={cn("text-muted", dani ? "text-sm font-medium text-foreground/70" : "text-sm")}>
            Proof complete — advance when the room is ready.
          </p>
        )}

        {onSkipWalkthrough && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onSkipWalkthrough}
              className={cn(
                "font-medium text-muted transition hover:text-foreground",
                dani ? "text-xs uppercase tracking-[0.12em]" : "text-xs"
              )}
            >
              Skip to pricing
            </button>
          </div>
        )}
      </div>
    );
  }

  if (slide.type === "presentation-actions") {
    return null;
  }

  if ("bullets" in slide && slide.bullets && slide.bullets.length > 0) {
    return (
      <div className={cn(dani && "space-y-8")}>
        <ul className={cn("space-y-2", dani && "space-y-4 sm:space-y-5")}>
          {slide.bullets.map((b, i) => (
            <li
              key={b}
              className={cn(
                "flex gap-3 border-b border-border/40 py-2.5 text-foreground last:border-0",
                dani &&
                  "items-start border-border/35 py-4 text-lg font-medium leading-snug last:border-b-0 sm:py-5 sm:text-xl md:text-2xl md:leading-snug"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent",
                  dani && "mt-0.5 h-9 w-9 text-sm md:h-10 md:w-10 md:text-base"
                )}
              >
                {i + 1}
              </span>
              <span className={dani ? "min-w-0 pt-0.5" : undefined}>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border/80 p-6 text-center text-sm text-muted",
        dani &&
          "flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-2xl border-border/50 bg-card/25 px-6 py-10 text-base text-foreground/60 sm:min-h-[14rem]"
      )}
    >
      <span className={cn("max-w-md", dani && "font-medium leading-snug text-foreground/70")}>
        {visualPlaceholderLabel(slide.type)}
      </span>
      {!dani && <span className="text-xs text-muted/80">No additional content for this slide.</span>}
    </div>
  );
}
