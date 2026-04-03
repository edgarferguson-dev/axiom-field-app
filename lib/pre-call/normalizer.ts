/**
 * Pre-call normalizer + parser (RFC 6 / 6A).
 *
 * Single place that converts raw AI output (or partial stored data) into a
 * complete, safe `PreCallIntel`. Also exposes a combined parse+normalize path
 * so the AI route never handles raw strings directly.
 */

import type { PreCallAIRaw, PreCallIntel, TabletGuidance, ChannelMode, RiskBand } from "@/types/pre-call";

// ── Per-field safe defaults ────────────────────────────────────────────────

const DEFAULT_RISK_BAND: RiskBand = "medium";
const DEFAULT_TABLET_GUIDANCE: TabletGuidance = "either";
const DEFAULT_CHANNEL_MODE: ChannelMode = "verbal-first";

const DEFAULT_LIKELY_OBJECTION =
  `Time, trust, or "we already have something" — prep a crisp reframing before you pitch.`;

const DEFAULT_APPROACH_TIMING =
  `First 90s: confirm who owns the phone/DM, ask what breaks when three leads hit at once. ` +
  `Avoid leading with: AI pitch or pricing before they name the leak.`;

/** RFC 6A — keep briefs scannable on a phone; AI prompt mirrors these caps. */
export const PRECALL_FIELD_LIMITS = {
  painPattern: 280,
  missedValueEstimate: 120,
  keyOpportunity: 140,
  recommendedAngle: 160,
  likelyObjection: 200,
  approachTiming: 320,
} as const;

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

function clampStr(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function safeString(v: unknown, fallback = "", max?: number): string {
  const base = typeof v === "string" && v.trim().length > 0 ? v.trim() : fallback;
  return max != null ? clampStr(base, max) : base;
}

function normalizeKeyOpportunities(v: unknown): [string, string, string] {
  const fallback: [string, string, string] = [
    "Anchor on one observable pattern for this vertical.",
    "Ask what breaks on their busiest day.",
    "Offer one proof point if they engage.",
  ];
  if (!Array.isArray(v)) return fallback;
  const filtered = v.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  const a = clampStr(filtered[0] ?? fallback[0], PRECALL_FIELD_LIMITS.keyOpportunity);
  const b = clampStr(filtered[1] ?? fallback[1], PRECALL_FIELD_LIMITS.keyOpportunity);
  const c = clampStr(filtered[2] ?? fallback[2], PRECALL_FIELD_LIMITS.keyOpportunity);
  return [a, b, c];
}

/**
 * Extract first balanced `{ ... }` from model text (handles preamble / stray prose).
 */
export function extractJsonObject(text: string): string {
  const t = text.trim();
  const start = t.indexOf("{");
  if (start < 0) return t;
  let depth = 0;
  for (let i = start; i < t.length; i += 1) {
    const ch = t[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return t.slice(start, i + 1);
    }
  }
  return t.slice(start);
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

  const keyOpportunities = normalizeKeyOpportunities(raw.keyOpportunities);

  return {
    painPattern: clampStr(raw.painPattern.trim(), PRECALL_FIELD_LIMITS.painPattern),
    riskBand: isRiskBand(raw.riskBand) ? raw.riskBand : DEFAULT_RISK_BAND,
    missedValueEstimate: safeString(raw.missedValueEstimate, "", PRECALL_FIELD_LIMITS.missedValueEstimate),
    keyOpportunities,
    recommendedAngle: safeString(raw.recommendedAngle, "", PRECALL_FIELD_LIMITS.recommendedAngle),
    likelyObjection: safeString(raw.likelyObjection, DEFAULT_LIKELY_OBJECTION, PRECALL_FIELD_LIMITS.likelyObjection),
    approachTiming: safeString(raw.approachTiming, DEFAULT_APPROACH_TIMING, PRECALL_FIELD_LIMITS.approachTiming),
    tabletGuidance: isTabletGuidance(raw.tabletGuidance) ? raw.tabletGuidance : DEFAULT_TABLET_GUIDANCE,
    channelMode: isChannelMode(raw.channelMode) ? raw.channelMode : DEFAULT_CHANNEL_MODE,
  };
}

// ── JSON parse + normalize in one step ────────────────────────────────────

/**
 * Strips markdown code fences, extracts JSON object, parses, then normalizes.
 * Returns `null` on any parse or normalization failure — callers should
 * fall back to deterministic intel rather than throwing.
 */
export function parseAndNormalizePreCallIntel(text: string): PreCallIntel | null {
  try {
    const stripped = text
      .replace(/^```(?:json)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();
    const jsonSlice = extractJsonObject(stripped);
    const parsed = JSON.parse(jsonSlice) as PreCallAIRaw;
    return normalizePreCallIntel(parsed);
  } catch {
    return null;
  }
}
