import { anthropic } from "./client";
import type { PreCallIntel, BusinessProfile } from "@/types/session";

const SYSTEM_PROMPT = `You are a sales intelligence AI embedded in Axiom Field — a premium field sales tool.
Your job is to generate sharp, specific pre-call intelligence for a sales rep who is about to pitch
an AI-powered lead response and follow-up system to a local business owner.

Be direct, specific, and confident. Output only valid JSON — no markdown, no preamble.`;

export async function generatePreCallIntel(
  business: BusinessProfile
): Promise<PreCallIntel> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze this business and produce pre-call intelligence:

Business Name: ${business.name}
Business Type: ${business.type}
Current Lead System: ${business.currentSystem}
Primary Lead Source: ${business.leadSource}
Rep's Door Observation: ${business.notes || "None provided"}

Return a JSON object matching this exact shape:
{
  "painPattern": "2-3 sentence description of the core pain this business is experiencing with leads",
  "riskBand": "high" | "medium" | "low",
  "missedValueEstimate": "e.g. $2,000–6,000/month in uncontacted leads",
  "keyOpportunities": ["talking point 1", "talking point 2", "talking point 3"],
  "recommendedAngle": "The exact opening line or angle the rep should use to start the conversation"
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  return JSON.parse(text) as PreCallIntel;
}
