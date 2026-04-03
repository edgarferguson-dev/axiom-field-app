"use client";

import { DemoPublicStage } from "@/components/demo/DemoPublicStage";
import type { DemoPresentationSurfaceProps } from "@/components/demo/DemoPresentationSurface";

/**
 * DaNI buyer-facing entry — delegates to `DemoPublicStage` (premium canvas).
 */
export function PublicScreen(props: DemoPresentationSurfaceProps) {
  return <DemoPublicStage {...props} />;
}
