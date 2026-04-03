import { anthropic, parseAIJSON } from "./client";
import type { CoachingPrompt, BusinessProfile, PreCallIntel } from "@/types/session";

const SYSTEM_PROMPT = `Field manager: one-line tactical cues only. Blunt, calm. No filler, no long scripts.
JSON only. Each string readable in under 3 seconds.`;

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
    max_tokens: 380,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Business: ${ctx.business.name} (${ctx.business.type})
Pain: ${ctx.preCallIntel.painPattern}
Angle: ${ctx.preCallIntel.recommendedAngle}
Likely objection: ${ctx.preCallIntel.likelyObjection}
Constraints: ${ctx.business.capturedConstraintLabels?.join("; ") || "—"}
Rep notes: ${ctx.repNotes || "—"}
Prior prompts: ${ctx.previousPromptCount}

Return JSON ONLY:
{
  "signal": "green" | "yellow" | "red",
  "openWith": "optional: 5–10 words",
  "avoidLead": "optional: what not to lead with",
  "device": "now" | "later",
  "audioCue": "one sentence, max 18 words",
  "nextMove": "one move, max 15 words",
  "buySignal": "optional: max 12 words"
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  return parseAIJSON<Omit<CoachingPrompt, "id" | "timestamp">>(text);
}
