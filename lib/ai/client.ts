import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("[Axiom] ANTHROPIC_API_KEY is not set. AI features will be unavailable.");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

/** Strip markdown code fences Claude sometimes adds despite "no markdown" instructions */
export function parseAIJSON<T>(text: string): T {
  const stripped = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  return JSON.parse(stripped) as T;
}
