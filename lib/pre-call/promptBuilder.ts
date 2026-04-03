/**
 * Pre-call prompt builder (RFC 6).
 *
 * Pure function — no side effects, no API calls.
 * Extracted from lib/ai/pre-call.ts so it can be tested and adjusted
 * independently of the Anthropic client.
 */

import type { BusinessProfile, FieldEngagementDecision } from "@/types/session";

export type PreCallPromptMessages = {
  system: string;
  user: string;
};

export function buildPreCallPrompt(
  business: BusinessProfile,
  gate?: FieldEngagementDecision | null
): PreCallPromptMessages {
  const system = `Tight walk-in intel for SMB field reps. Blunt, plain. No fluff. JSON only.`;

  const lookupLines = [
    business.website && `Website (rep-entered): ${business.website}`,
    business.rating && `Rating hint: ${business.rating}`,
    business.reviewCount && `Review count hint: ${business.reviewCount}`,
    business.address && `Address/area: ${business.address}`,
    business.social && `Social: ${business.social}`,
    business.ownerName && `Owner/contact name hint: ${business.ownerName}`,
    business.contactPhone && `Phone hint: ${business.contactPhone}`,
  ].filter(Boolean);

  const lookupBlock = lookupLines.length > 0 ? lookupLines.join("\n") : "None";

  const gateBlock =
    gate && gate.decision !== "WALK"
      ? `
Engagement gate (deterministic — honor this; do not contradict):
- Decision: ${gate.decision} (GO = strong floor; SOFT_GO = mixed; do not treat as a laydown)
- Confidence: ${gate.confidence}%
- Primary angle to anchor the brief: ${gate.primaryAngle}
- Reason: ${gate.reason}

Rules: Align recommendedAngle and keyOpportunities[0] with the primary angle. If SOFT_GO, stay measured — no hype. If GO, be direct. Never recommend walking away; the rep already chose to generate a brief.`
      : "";

  const constraintLine = business.capturedConstraintLabels?.length
    ? business.capturedConstraintLabels.join("; ")
    : business.notes?.trim()
      ? business.notes.trim()
      : "None listed — infer from type + lead path only.";

  const user = `Snapshot for walk-in (not marketing).

Business: ${business.name}
Type: ${business.type}
How they track leads today: ${business.currentSystem}
Where leads actually come from: ${business.leadSource}
Constraints / floor signals (rep taps): ${constraintLine}

Optional context (may be empty):
${lookupBlock}
${gateBlock}

Return JSON with exactly these keys (keep strings tight):

{
  "painPattern": "Max 2 sentences. Name the leak in operator language.",
  "riskBand": "high" | "medium" | "low",
  "missedValueEstimate": "One line with a number range or concrete loss shape.",
  "keyOpportunities": ["string1", "string2", "string3"],
  "recommendedAngle": "One cold sentence. No quotes inside the string.",
  "likelyObjection": "First objection + one-line counter (no essay).",
  "approachTiming": "Line 1: First 90s — what to do, then what to ask. Line 2: what not to lead with.",
  "tabletGuidance": "now" | "later" | "either",
  "channelMode": "phone-first" | "verbal-first" | "tablet-first"
}

Rules for keyOpportunities (3 items, order matters):
- [0] = The one credibility anchor to establish first (fact, pattern, or observation tied to THIS business type—not generic "build rapport").
- [1] and [2] = Tight follow-up probes or proof hooks if the conversation opens up.

tabletGuidance:
- now: chaotic or visual learner energy; a fast screen pass helps.
- later: skeptical, slammed, or trust not earned—conversation before device.
- either: genuinely unclear.

channelMode:
- phone-first: they live on callbacks/voicemail.
- verbal-first: default for most in-person drop-ins.
- tablet-first: they ask to see it or think in screens.`;

  return { system, user };
}
