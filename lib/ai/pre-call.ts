/**
 * AI pre-call intel generation (RFC 6A).
 *
 * Retries before failing; deterministic fallback is applied by the API route.
 */

import { anthropic } from "./client";
import type { PreCallIntel } from "@/types/pre-call";
import type { BusinessProfile, FieldEngagementDecision } from "@/types/session";
import { buildPreCallPrompt } from "@/lib/pre-call/promptBuilder";
import { parseAndNormalizePreCallIntel } from "@/lib/pre-call/normalizer";

export { normalizePreCallIntel } from "@/lib/pre-call/normalizer";
export { buildFallbackPreCallIntel } from "@/lib/pre-call/fallback";

const PRECALL_AI_ATTEMPTS = 3;
const PRECALL_MAX_TOKENS = 650;

function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export async function generatePreCallIntel(
  business: BusinessProfile,
  gate?: FieldEngagementDecision | null
): Promise<PreCallIntel> {
  if (!hasAnthropicKey()) {
    throw new Error("ANTHROPIC_API_KEY is not configured — cannot run pre-call AI");
  }

  const { system, user } = buildPreCallPrompt(business, gate);
  let lastError: unknown;

  for (let attempt = 0; attempt < PRECALL_AI_ATTEMPTS; attempt += 1) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: PRECALL_MAX_TOKENS,
        temperature: 0.25,
        system,
        messages: [{ role: "user", content: user }],
      });

      const text =
        message.content[0].type === "text" ? message.content[0].text : "{}";

      const normalized = parseAndNormalizePreCallIntel(text);
      if (normalized) {
        return normalized;
      }
      lastError = new Error(`Invalid pre-call intel shape (attempt ${attempt + 1}/${PRECALL_AI_ATTEMPTS})`);
    } catch (err) {
      lastError = err;
      if (attempt === PRECALL_AI_ATTEMPTS - 1) break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Pre-call AI failed after retries — invalid or unparseable output");
}
