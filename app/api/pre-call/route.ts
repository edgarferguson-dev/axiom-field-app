import { NextRequest, NextResponse } from "next/server";
import { generatePreCallIntel } from "@/lib/ai/pre-call";
import { buildFallbackPreCallIntel } from "@/lib/pre-call/fallback";
import type {
  BusinessProfile,
  FieldEngagementDecision,
  BusinessConstraint,
  FieldSnapshotKey,
} from "@/types/session";
import type { PreCallSource } from "@/types/pre-call";

type PreCallBody = BusinessProfile & {
  fieldEngagementDecision?: FieldEngagementDecision | null;
  /** Passed so the fallback can produce context-aware intel without an AI call. */
  constraints?: BusinessConstraint[];
  fieldSnapshot?: FieldSnapshotKey[];
};

export async function POST(request: NextRequest) {
  let body: PreCallBody;
  try {
    body = (await request.json()) as PreCallBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.name || !body.type) {
    return NextResponse.json(
      { error: "business.name and business.type are required" },
      { status: 400 }
    );
  }

  const gate = body.fieldEngagementDecision ?? null;
  const constraints = body.constraints ?? [];
  const fieldSnapshot = body.fieldSnapshot ?? [];

  let source: PreCallSource;
  let intel;

  try {
    intel = await generatePreCallIntel(body, gate);
    source = "ai";
  } catch (err) {
    console.warn("[pre-call] AI generation failed — using deterministic fallback:", err);
    intel = buildFallbackPreCallIntel(body, constraints, gate, fieldSnapshot);
    source = "deterministic";
  }

  // `source` is additive — existing consumers reading only PreCallIntel fields are unaffected.
  return NextResponse.json({ ...intel, source });
}
