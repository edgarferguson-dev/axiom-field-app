import type { PreCallIntel, TabletGuidance, ChannelMode } from "@/types/session";

/** Merge partial / legacy stored intel into a full `PreCallIntel` for UI and downstream use */
export function normalizePreCallIntel(raw: Partial<PreCallIntel> | null): PreCallIntel | null {
  if (!raw || typeof raw.painPattern !== "string") return null;

  const tablet: TabletGuidance =
    raw.tabletGuidance === "now" || raw.tabletGuidance === "later" || raw.tabletGuidance === "either"
      ? raw.tabletGuidance
      : "either";

  const channel: ChannelMode =
    raw.channelMode === "phone-first" ||
    raw.channelMode === "verbal-first" ||
    raw.channelMode === "tablet-first"
      ? raw.channelMode
      : "verbal-first";

  return {
    painPattern: raw.painPattern,
    riskBand: raw.riskBand === "high" || raw.riskBand === "medium" || raw.riskBand === "low" ? raw.riskBand : "medium",
    missedValueEstimate: raw.missedValueEstimate ?? "",
    keyOpportunities: Array.isArray(raw.keyOpportunities) ? raw.keyOpportunities : [],
    recommendedAngle: raw.recommendedAngle ?? "",
    likelyObjection:
      raw.likelyObjection ??
      "Time, trust, or “we already have something”—prepare a crisp reframing.",
    approachTiming:
      raw.approachTiming ??
      "First 90s: Lock who owns the phone/DM, ask what breaks when three leads hit at once. Avoid leading with: AI pitch or pricing before they name the leak.",
    tabletGuidance: tablet,
    channelMode: channel,
  };
}
