import { NextRequest, NextResponse } from "next/server";
import { generatePreCallIntel } from "@/lib/ai/pre-call";
import type { BusinessProfile } from "@/types/session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BusinessProfile;

    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "business.name and business.type are required" },
        { status: 400 }
      );
    }

    const intel = await generatePreCallIntel(body);
    return NextResponse.json(intel);
  } catch (err) {
    console.error("[pre-call]", err);
    return NextResponse.json(
      { error: "Failed to generate pre-call intelligence" },
      { status: 500 }
    );
  }
}
