import { NextRequest, NextResponse } from "next/server";
import { generatePreCallIntel } from "@/lib/ai/pre-call";
import type { BusinessProfile, FieldEngagementDecision } from "@/types/session";

type PreCallBody = BusinessProfile & {
  fieldEngagementDecision?: FieldEngagementDecision | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PreCallBody;

    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "business.name and business.type are required" },
        { status: 400 }
      );
    }

    const intel = await generatePreCallIntel(body, body.fieldEngagementDecision);
    return NextResponse.json(intel);
  } catch (err) {
    console.error("[pre-call]", err);
    return NextResponse.json(
      { error: "Failed to generate pre-call intelligence" },
      { status: 500 }
    );
  }
}
