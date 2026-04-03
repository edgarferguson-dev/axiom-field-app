"use client";

import { cn } from "@/lib/utils/cn";
import { DemoPresentationSurface, type DemoPresentationSurfaceProps } from "@/components/demo/DemoPresentationSurface";

export type DemoPublicStageProps = DemoPresentationSurfaceProps;

/**
 * Buyer-facing demo canvas — matte frame, full-width feel, minimal chrome (deck is the hero).
 */
export function DemoPublicStage(props: DemoPublicStageProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-[100vw]",
        "rounded-2xl sm:rounded-3xl",
        "bg-surface",
        "ring-1 ring-border shadow-soft",
        "p-1.5 sm:p-2 md:p-3",
        "min-h-[min(58svh,640px)] lg:min-h-[min(62svh,780px)]"
      )}
    >
      <DemoPresentationSurface {...props} hideBuyerBadge presentationScale="dani" />
    </div>
  );
}
