"use client";

import { cn } from "@/lib/utils/cn";
import type { PresentationSlide } from "@/lib/flows/presentationEngine";
import type {
  InteractiveDemoEvent,
  InteractiveDemoState,
} from "@/lib/flows/interactiveDemoEngine";
import { InteractiveProof } from "@/components/presentation/InteractiveProof";

type SlideRendererProps = {
  slide: PresentationSlide;
  interactiveProofState: InteractiveDemoState;
  onInteractiveProofDispatch: (event: InteractiveDemoEvent) => void;
  interactiveProofCompleted: boolean;
  /** Buyer-safe: skip the simulated walkthrough and advance the deck. */
  onSkipWalkthrough?: () => void;
};

export function SlideRenderer({
  slide,
  interactiveProofState,
  onInteractiveProofDispatch,
  interactiveProofCompleted,
  onSkipWalkthrough,
}: SlideRendererProps) {
  if (slide.type === "interactive-proof") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-border/60 bg-surface/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            What we&apos;ll simulate
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/95">
            {slide.prompt}
          </p>
        </div>

        <InteractiveProof state={interactiveProofState} onDispatch={onInteractiveProofDispatch} />

        {interactiveProofCompleted && (
          <div className="rounded-xl border border-signal-green/25 bg-signal-green/5 px-4 py-3 text-sm text-foreground/90">
            Walkthrough complete — continue when you&apos;re ready.
          </div>
        )}

        {onSkipWalkthrough && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={onSkipWalkthrough}
              className="text-[11px] font-medium text-muted underline-offset-4 transition hover:text-foreground hover:underline"
            >
              Skip walkthrough
            </button>
          </div>
        )}
      </div>
    );
  }

  if (slide.type === "close-open-account") {
    return (
      <div className="space-y-3">
        {slide.bullets && slide.bullets.length > 0 && (
          <ul className="space-y-3">
            {slide.bullets.map((b, i) => (
              <li
                key={b}
                className="flex gap-3 rounded-xl border border-border/40 bg-card/30 px-3 py-2.5 text-sm leading-relaxed text-foreground/90"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/12 text-[11px] font-semibold text-accent">
                  {i + 1}
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {slide.disclaimer && (
          <div className="text-xs leading-relaxed text-muted">{slide.disclaimer}</div>
        )}
      </div>
    );
  }

  if ("bullets" in slide && slide.bullets && slide.bullets.length > 0) {
    return (
      <ul className="space-y-3">
        {slide.bullets.map((b, i) => (
          <li
            key={b}
            className="flex gap-3 rounded-xl border border-border/40 bg-card/30 px-3 py-2.5 text-sm leading-relaxed text-foreground/90"
          >
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/12 text-[11px] font-semibold text-accent">
              {i + 1}
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn("rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted")}>
      No additional content for this slide.
    </div>
  );
}
