/**
 * Pre-call type contract (RFC 6).
 *
 * Owns all pre-call-specific types. `types/session.ts` re-exports these for
 * backward compatibility — nothing outside this module needs to change its
 * import path unless it wants the richer `PreCallResult` shape.
 */

// ── Primitive literals ─────────────────────────────────────────────────────

export type RiskBand = "high" | "medium" | "low";

/** When to surface the tablet / visual demo during the visit */
export type TabletGuidance = "now" | "later" | "either";

/** Recommended engagement mode for first contact */
export type ChannelMode = "phone-first" | "verbal-first" | "tablet-first";

// ── Core intel shape (normalized, always complete) ─────────────────────────

/**
 * Normalized pre-call intel stored in Session.
 * Every field is required — the normalizer fills gaps with safe defaults so
 * consumers never need to null-check individual fields.
 */
export type PreCallIntel = {
  /** One–two sentences naming the core revenue leak in operator language. */
  painPattern: string;
  riskBand: RiskBand;
  /** Concrete $ range or loss shape (one line). */
  missedValueEstimate: string;
  /**
   * Three-item ordered array:
   * [0] credibility anchor, [1] follow-up probe 1, [2] follow-up probe 2.
   */
  keyOpportunities: [string, string, string] | string[];
  /** Cold opener for the first 60 seconds. */
  recommendedAngle: string;
  /** First likely objection + one-line counter. */
  likelyObjection: string;
  /** First 90s guidance: what to do, what to ask, what to avoid. */
  approachTiming: string;
  tabletGuidance: TabletGuidance;
  channelMode: ChannelMode;
};

// ── Raw AI output shape ────────────────────────────────────────────────────

/**
 * What Claude may return before normalization.
 * All fields are optional so the normalizer can fill gaps without throwing.
 */
export type PreCallAIRaw = Partial<PreCallIntel> & Record<string, unknown>;

// ── Provenance / enriched contract ────────────────────────────────────────

/** How the intel was produced — useful for coaching analytics and tuning. */
export type PreCallSource = "ai" | "deterministic";

/**
 * Enriched pre-call result: normalized intel + provenance metadata.
 * Session stores `PreCallIntel` plus `preCallIntelSource` (RFC 6A) on the aggregate.
 */
export type PreCallResult = PreCallIntel & {
  source: PreCallSource;
  generatedAt: number;
};

// ── Request shape ──────────────────────────────────────────────────────────

/**
 * Everything the pre-call pipeline needs to produce intel.
 * Passed to both the AI path and the deterministic fallback.
 */
export type PreCallRequest = {
  businessName: string;
  businessType: string;
  currentSystem: string;
  leadSource: string;
  capturedConstraintLabels?: string[];
  /** Optional enrichment hints — may all be absent. */
  website?: string;
  rating?: string;
  reviewCount?: string;
  address?: string;
  social?: string;
  ownerName?: string;
  contactPhone?: string;
};
