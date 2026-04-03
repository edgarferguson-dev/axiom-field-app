/**
 * Pre-call normalizer + parser (RFC 6).
 *
 * Single place that converts raw AI output (or partial stored data) into a
 * complete, safe `PreCallIntel`. Also exposes a combined parse+normalize path
 * so the AI route never handles raw strings directly.
 */

import type { PreCallAIRaw, PreCallIntel, TabletGuidance, ChannelMode, RiskBand } from "@/types/pre-call";

// ── Per-field safe defaults ────────────────────────────────────────────────
//    Used when the AI omits a field or the deterministic fallback runs.

const DEFAULT_RISK_BAND: RiskBand = "medium";
const DEFAULT_TABLET_GUIDANCE: TabletGuidance = "either";
const DEFAULT_CHANNEL_MODE: ChannelMode = "verbal-first";

const DEFAULT_LIKELY_OBJECTION =
  `Time, trust, or "we already have something" — prep a crisp reframing before you pitch.`;

const DEFAULT_APPROACH_TIMING =
  `First 90s: confirm who owns the phone/DM, ask what breaks when three leads hit at once. ` +
  `Avoid leading with: AI pitch or pricing before they name the leak.`;

// ── Validators ────────────────────────────────────────────────────────────

function isRiskBand(v: unknown): v is RiskBand {
  return v === "high" || v === "medium" || v === "low";
}

function isTabletGuidance(v: unknown): v is TabletGuidance {
  return v === "now" || v === "later" || v === "either";
}

function isChannelMode(v: unknown): v is ChannelMode {
  return v === "phone-first" || v === "verbal-first" || v === "tablet-first";
}

function safeString(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
}

function safeStringArray(v: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(v)) return fallback;
  const filtered = v.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return filtered.length > 0 ? filtered : fallback;
}

// ── Core normalizer ────────────────────────────────────────────────────────

/**
 * Converts partial/raw pre-call data into a complete `PreCallIntel`.
 *
 * Returns `null` only if `painPattern` is missing — that field is the minimum
 * viable signal that the intel is real. All other fields fall back gracefully.
 */
export function normalizePreCallIntel(raw: Partial<PreCallIntel> | null | undefined): PreCallIntel | null {
  if (!raw || typeof raw.painPattern !== "string" || raw.painPattern.trim().length === 0) {
    return null;
  }

  return {
    painPattern: raw.painPattern.trim(),
    riskBand: isRiskBand(raw.riskBand) ? raw.riskBand : DEFAULT_RISK_BAND,
    missedValueEstimate: safeString(raw.missedValueEstimate),
    keyOpportunities: safeStringArray(raw.keyOpportunities),
    recommendedAngle: safeString(raw.recommendedAngle),
    likelyObjection: safeString(raw.likelyObjection, DEFAULT_LIKELY_OBJECTION),
    approachTiming: safeString(raw.approachTiming, DEFAULT_APPROACH_TIMING),
    tabletGuidance: isTabletGuidance(raw.tabletGuidance) ? raw.tabletGuidance : DEFAULT_TABLET_GUIDANCE,
    channelMode: isChannelMode(raw.channelMode) ? raw.channelMode : DEFAULT_CHANNEL_MODE,
  };
}

// ── JSON parse + normalize in one step ────────────────────────────────────

/**
 * Strips markdown code fences, parses JSON, then normalizes.
 * Returns `null` on any parse or normalization failure — callers should
 * fall back to deterministic intel rather than throwing.
 */
export function parseAndNormalizePreCallIntel(text: string): PreCallIntel | null {
  try {
    const stripped = text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();
    const parsed = JSON.parse(stripped) as PreCallAIRaw;
    return normalizePreCallIntel(parsed);
  } catch {
    return null;
  }
}
