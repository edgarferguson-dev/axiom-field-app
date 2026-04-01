import { anthropic, parseAIJSON } from "./client";
import type { CoachingPrompt, BusinessProfile, PreCallIntel } from "@/types/session";

const SYSTEM_PROMPT = `You are a real-time sales coach embedded in Axiom Field — a premium in-field sales tool.
The rep is live in a demo with a business owner. Your coaching prompts appear privately on the rep's screen.
Be concise, tactical, and decisive. Never be vague. Output only valid JSON — no markdown, no preamble.`;

export type CoachingContext = {
  business: BusinessProfile;
  preCallIntel: PreCallIntel;
  repNotes: string;
  previousPromptCount: number;
};

export async function generateCoachingPrompt(
  ctx: CoachingContext
): Promise<Omit<CoachingPrompt, "id" | "timestamp">> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `The rep is live with this business:

Business: ${ctx.business.name} (${ctx.business.type})
Pre-Call Pain: ${ctx.preCallIntel.painPattern}
Recommended Angle: ${ctx.preCallIntel.recommendedAngle}
Rep's Notes So Far: ${ctx.repNotes || "None yet"}
Coaching Prompts Given: ${ctx.previousPromptCount}

Generate the next coaching prompt. Return a JSON object:
{
  "signal": "green" | "yellow" | "red",
  "audioCue": "Exact phrase the rep should say right now (1 sentence max)",
  "nextMove": "Tactical action to take in the next 30 seconds",
  "buySignal": "Optional: a positive signal detected from the context, or omit the field"
}

signal meanings: green = momentum building, yellow = need to redirect, red = objection or disengagement detected.`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  return parseAIJSON<Omit<CoachingPrompt, "id" | "timestamp">>(text);
}
