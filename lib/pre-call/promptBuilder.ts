/**
 * Pre-call prompt builder (RFC 6 / 6A).
 *
 * Pure function — no side effects, no API calls.
 */

import type { BusinessProfile, FieldEngagementDecision } from "@/types/session";
import { PRECALL_FIELD_LIMITS } from "@/lib/pre-call/normalizer";

export type PreCallPromptMessages = {
  system: string;
  user: string;
};

export function buildPreCallPrompt(
  business: BusinessProfile,
  gate?: FieldEngagementDecision | null
): PreCallPromptMessages {
  const system = `You are the pre-call intelligence engine for Axiom Field — in-person B2B field reps (SMB, walk-in / lobby context).
Your job: produce ONE JSON object only. No markdown fences, no commentary before or after the JSON, no trailing text.
Voice: tactical, plain English, industry-aware using the given business type — not generic SaaS platitudes.
Every string must stay within the character budgets in the user message — shorter is better.`;

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

  const L = PRECALL_FIELD_LIMITS;

  const user = `Return a single JSON object with EXACTLY these keys and types (no extra keys):

{
  "painPattern": string,
  "riskBand": "high" | "medium" | "low",
  "missedValueEstimate": string,
  "keyOpportunities": [string, string, string],
  "recommendedAngle": string,
  "likelyObjection": string,
  "approachTiming": string,
  "tabletGuidance": "now" | "later" | "either",
  "channelMode": "phone-first" | "verbal-first" | "tablet-first"
}

Character budgets (hard — stay at or under):
- painPattern: max ${L.painPattern} chars (1–2 short sentences; name the revenue leak in operator terms for THIS industry type)
- missedValueEstimate: max ${L.missedValueEstimate} chars (one line; number range or concrete loss shape)
- each keyOpportunities[i]: max ${L.keyOpportunity} chars
- recommendedAngle: max ${L.recommendedAngle} chars (one cold-opener sentence; no nested quotes)
- likelyObjection: max ${L.likelyObjection} chars (objection + one-line counter)
- approachTiming: max ${L.approachTiming} chars (two short lines: first 90s do/ask; what not to lead with)

Context snapshot (walk-in, not marketing copy):

Business name: ${business.name}
Business type (use for industry-specific language): ${business.type}
How they track leads today: ${business.currentSystem}
Where leads actually come from: ${business.leadSource}
Constraints / floor signals (rep-selected): ${constraintLine}

Optional enrichment (may be empty):
${lookupBlock}
${gateBlock}

keyOpportunities order (exactly 3 strings):
- [0] One credibility anchor tied to "${business.type}" — specific, not generic rapport fluff.
- [1] Follow-up probe if they open up.
- [2] Proof or next-step hook if momentum appears.

tabletGuidance:
- now: chaotic floor or visual learner; quick screen pass helps.
- later: skeptical or slammed — conversation before device.
- either: unclear.

channelMode:
- phone-first: callbacks/voicemail culture.
- verbal-first: default most lobby drop-ins.
- tablet-first: they invite screen or think in UI.`;

  return { system, user };
}
