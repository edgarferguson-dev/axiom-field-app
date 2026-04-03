/**
 * RFC 7 — Asset keys resolve to lightweight render patterns (no binary payloads in Zustand).
 * Optional future: map keys to files under /public/presentation/*
 */

export type PresentationVisualPattern =
  | "response-grid"
  | "flow-three"
  | "split-compare"
  | "stat-hero"
  | "pipeline-strip";

/** Registry: pack templates reference these keys only. */
export const PRESENTATION_ASSET_PATTERNS: Record<string, PresentationVisualPattern> = {
  "svc-response-grid": "response-grid",
  "svc-automation-3": "flow-three",
  "svc-before-after": "split-compare",
  "svc-leak-stat": "stat-hero",
  "b2b-pipeline-strip": "pipeline-strip",
  "b2b-flow-3": "flow-three",
  "b2b-compare": "split-compare",
  "b2b-stat": "stat-hero",
};

export function resolvePresentationVisualPattern(assetKey: string): PresentationVisualPattern {
  return PRESENTATION_ASSET_PATTERNS[assetKey] ?? "response-grid";
}
