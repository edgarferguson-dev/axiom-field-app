import { anthropic, parseAIJSON } from "./client";
import type { PreCallIntel, BusinessProfile } from "@/types/session";
import { normalizePreCallIntel } from "@/lib/utils/preCallIntel";

export { normalizePreCallIntel } from "@/lib/utils/preCallIntel";

const SYSTEM_PROMPT = `You write first-90-seconds field intelligence for Axiom Field reps selling an AI lead-response and follow-up system to local business owners.

Voice: confident, plain-spoken, no corporate filler. No "leverage," "synergy," "solutions," or "it's important to note." Write like a sharp field manager texting a rep before they walk in.

Output only valid JSON. No markdown, no preamble.`;

export async function generatePreCallIntel(business: BusinessProfile): Promise<PreCallIntel> {
  const lookupBlock = [
    business.website && `Website (rep-entered): ${business.website}`,
    business.rating && `Rating hint: ${business.rating}`,
    business.reviewCount && `Review count hint: ${business.reviewCount}`,
    business.address && `Address/area: ${business.address}`,
    business.social && `Social: ${business.social}`,
    business.ownerName && `Owner/contact name hint: ${business.ownerName}`,
    business.contactPhone && `Phone hint: ${business.contactPhone}`,
  ]
    .filter(Boolean)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Account snapshot — turn this into walk-in intelligence.

Business: ${business.name}
Type: ${business.type}
How they track leads today: ${business.currentSystem}
Where leads actually come from: ${business.leadSource}
Constraints / floor signals (rep taps): ${
  business.capturedConstraintLabels?.length
    ? business.capturedConstraintLabels.join("; ")
    : business.notes?.trim()
      ? business.notes.trim()
      : "None listed — infer from type + lead path only."
}

Optional context (may be empty):
${lookupBlock || "None"}

Return JSON with exactly these keys:

{
  "painPattern": "1–2 short sentences. Name the leak in their words (missed calls, slow text-back, no-show follow-up, etc.). No lecture.",
  "riskBand": "high" | "medium" | "low",
  "missedValueEstimate": "One line, specific. Example shape: ~$X–Yk/mo in dead air on [calls/DMs/bookings] — not a disclaimer paragraph.",
  "keyOpportunities": ["string1", "string2", "string3"],
  "recommendedAngle": "Single sentence the rep can say cold. Sounds human, not salesy. No quotes inside the string.",
  "likelyObjection": "What they'll throw at you in the first two minutes. One sentence + half-sentence on how to stand your ground (no essay).",
  "approachTiming": "EXACTLY this pattern on ONE line or two short lines: First 90s: [rapport beat → one discovery question → when to name the leak]. Avoid leading with: [one concrete mistake, e.g. pitching AI, price, or a full tour before pain is confirmed].",
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
- tablet-first: they ask to see it or think in screens.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  const parsed = parseAIJSON<Partial<PreCallIntel>>(text);
  const normalized = normalizePreCallIntel(parsed);
  if (!normalized) {
    throw new Error("Invalid pre-call intel shape");
  }
  return normalized;
}
