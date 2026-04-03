/**
 * AI pre-call intel generation.
 *
 * Thin orchestration layer: delegates prompt construction to promptBuilder,
 * JSON parsing + normalization to normalizer, and exports the fallback builder
 * for callers that want deterministic intel without an API call.
 */

import { anthropic } from "./client";
import type { PreCallIntel } from "@/types/pre-call";
import type { BusinessProfile, FieldEngagementDecision } from "@/types/session";
import { buildPreCallPrompt } from "@/lib/pre-call/promptBuilder";
import { parseAndNormalizePreCallIntel } from "@/lib/pre-call/normalizer";

// Re-export normalizer + fallback so callers import from one place.
export { normalizePreCallIntel } from "@/lib/pre-call/normalizer";
export { buildFallbackPreCallIntel } from "@/lib/pre-call/fallback";

export async function generatePreCallIntel(
  business: BusinessProfile,
  gate?: FieldEngagementDecision | null
): Promise<PreCallIntel> {
  const { system, user } = buildPreCallPrompt(business, gate);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 900,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  const normalized = parseAndNormalizePreCallIntel(text);
  if (!normalized) {
    throw new Error("Invalid pre-call intel shape returned from AI");
  }
  return normalized;
}
