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
};

export function SlideRenderer({
  slide,
  interactiveProofState,
  onInteractiveProofDispatch,
  interactiveProofCompleted,
}: SlideRendererProps) {
  if (slide.type === "interactive-proof") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Overview
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {slide.prompt}
          </p>
        </div>

        <InteractiveProof state={interactiveProofState} onDispatch={onInteractiveProofDispatch} />

        {interactiveProofCompleted && (
          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            Ready to continue.
          </div>
        )}
      </div>
    );
  }

  if (slide.type === "close-open-account") {
    return (
      <div className="space-y-3">
        {slide.bullets && slide.bullets.length > 0 && (
          <ul className="space-y-2">
            {slide.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {slide.disclaimer && (
          <div className="text-xs text-muted">{slide.disclaimer}</div>
        )}
      </div>
    );
  }

  if ("bullets" in slide && slide.bullets && slide.bullets.length > 0) {
    return (
      <ul className="space-y-2">
        {slide.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/90">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            <span className="leading-relaxed">{b}</span>
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
