"use client";

import { cn } from "@/lib/utils/cn";
import { DemoPresentationSurface, type DemoPresentationSurfaceProps } from "@/components/demo/DemoPresentationSurface";

export type DemoPublicStageProps = DemoPresentationSurfaceProps;

/**
 * Buyer-facing Proof Run canvas — matte frame, full-width, minimal chrome.
 */
export function DemoPublicStage(props: DemoPublicStageProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-[100vw]",
        "rounded-2xl sm:rounded-3xl",
        "bg-gradient-to-b from-surface via-surface to-background/40",
        "ring-1 ring-border/90 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.18)]",
        "p-1.5 sm:p-2.5 md:p-3",
        "min-h-[min(52svh,560px)] sm:min-h-[min(58svh,640px)] lg:min-h-[min(62svh,780px)]"
      )}
    >
      <DemoPresentationSurface {...props} hideBuyerBadge presentationScale="dani" />
    </div>
  );
}
