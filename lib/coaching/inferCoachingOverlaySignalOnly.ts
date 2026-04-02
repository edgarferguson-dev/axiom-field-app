import type { SessionPhase } from "@/types/session";

const SESSION_DEMO_ROUTE = /\/session\/[^/]+\/demo(?:\/|$)/;

/**
 * When true, the floating overlay should stay a **signal** layer (no script/next-move
 * duplication). Tactical lines belong in `DemoCoachingPanel` on the demo stage.
 */
export function inferCoachingOverlaySignalOnly(
  pathname: string | null | undefined,
  phase: SessionPhase | undefined
): boolean {
  if (phase === "live-demo") return true;
  if (pathname != null && SESSION_DEMO_ROUTE.test(pathname)) return true;
  return false;
}
