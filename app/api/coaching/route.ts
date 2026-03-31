import { NextRequest, NextResponse } from "next/server";
import { generateCoachingPrompt } from "@/lib/ai/coaching";
import type { CoachingContext } from "@/lib/ai/coaching";

export async function POST(request: NextRequest) {
  try {
    const ctx = (await request.json()) as CoachingContext;

    if (!ctx.business || !ctx.preCallIntel) {
      return NextResponse.json(
        { error: "business and preCallIntel are required" },
        { status: 400 }
      );
    }

    const prompt = await generateCoachingPrompt(ctx);
    return NextResponse.json(prompt);
  } catch (err) {
    console.error("[coaching]", err);
    return NextResponse.json(
      { error: "Failed to generate coaching prompt" },
      { status: 500 }
    );
  }
}
