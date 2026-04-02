import type { BusinessProfile, CoachingPrompt, PreCallIntel } from "@/types/session";

export type RequestCoachingPromptInput = {
  business: BusinessProfile;
  preCallIntel: PreCallIntel;
  repNotes: string;
  previousPromptCount: number;
};

/**
 * POST /api/coaching — returns a full `CoachingPrompt` (id + timestamp applied here).
 */
export async function requestCoachingPrompt(
  input: RequestCoachingPromptInput
): Promise<CoachingPrompt> {
  const res = await fetch("/api/coaching", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      business: input.business,
      preCallIntel: input.preCallIntel,
      repNotes: input.repNotes,
      previousPromptCount: input.previousPromptCount,
    }),
  });

  if (!res.ok) throw new Error("API error");

  const data = await res.json();
  const prompt: CoachingPrompt = {
    id: `p-${Date.now()}`,
    timestamp: Date.now(),
    ...data,
  };

  return prompt;
}
