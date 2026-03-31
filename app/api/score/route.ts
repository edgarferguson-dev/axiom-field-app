import { NextRequest, NextResponse } from "next/server";
import { generatePerformanceScore } from "@/lib/ai/scoring";
import type { Session } from "@/types/session";

export async function POST(request: NextRequest) {
  try {
    const session = (await request.json()) as Session;

    if (!session.id || !session.repName) {
      return NextResponse.json(
        { error: "session.id and session.repName are required" },
        { status: 400 }
      );
    }

    const score = await generatePerformanceScore(session);
    return NextResponse.json(score);
  } catch (err) {
    console.error("[score]", err);
    return NextResponse.json(
      { error: "Failed to generate performance score" },
      { status: 500 }
    );
  }
}
