import { anthropic, parseAIJSON } from "./client";
import type { PerformanceScore, Session } from "@/types/session";

const SYSTEM_PROMPT = `You are a sales performance analyst for Axiom Field — a premium field sales coaching platform.
You evaluate sales rep performance based on session data and assign scores across four dimensions.
Be honest, specific, and constructive. Output only valid JSON — no markdown, no preamble.`;

export async function generatePerformanceScore(
  session: Session
): Promise<PerformanceScore> {
  const durationMs = session.completedAt && session.startedAt
    ? session.completedAt - session.startedAt
    : 0;
  const durationMin = Math.round(durationMs / 60000);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Score this sales session:

Rep: ${session.repName}
Business: ${session.business?.name ?? "Unknown"} (${session.business?.type ?? "Unknown"})
Session Duration: ${durationMin} minutes
Coaching Prompts Used: ${session.coachingPrompts?.length ?? 0}
Rep's Notes: ${session.repNotes || "No notes taken"}
Scout diagnosis (labels): ${session.business?.capturedConstraintLabels?.join("; ") || "None captured"}
Field snapshot keys: ${session.fieldSnapshot?.length ? session.fieldSnapshot.join(", ") : "None"}
Operational constraints: ${session.constraints?.map((c) => `${c.key}:${c.severity}`).join("; ") || "None"}
Pre-Call Intel Was Generated: ${session.preCallIntel ? "Yes" : "No"}
Coaching Signal History: ${session.coachingPrompts.map((p) => p.signal).join(", ") || "None"}

Score this session from 0–100 across four dimensions. Each sub-score is 0–100.
Return a JSON object:
{
  "overall": <weighted average, 0-100>,
  "breakdown": {
    "discovery": <0-100, how well the rep uncovered the prospect's needs>,
    "positioning": <0-100, how well the rep presented the solution>,
    "objectionHandling": <0-100, how well the rep addressed concerns>,
    "closing": <0-100, how effectively the rep moved toward commitment>
  },
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "summary": "2-3 sentence overall performance assessment"
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "{}";

  return parseAIJSON<PerformanceScore>(text);
}
