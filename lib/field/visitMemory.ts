import type { PostRunCapture, PostRunResult } from "@/types/postRunCapture";

/** Normalize business name for matching visit logs (local only). */
export function normalizeVisitBusinessKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export const POST_RUN_RESULT_LABEL: Record<PostRunResult, string> = {
  no_interest: "No interest",
  interested: "Interested",
  follow_up: "Follow-up",
  soft_commit: "Soft commit",
  hard_commit: "Hard commit",
};

export function formatVisitDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function lastVisitForBusiness(
  captures: PostRunCapture[],
  businessName: string
): PostRunCapture | null {
  const key = normalizeVisitBusinessKey(businessName);
  if (!key) return null;
  for (const c of captures) {
    if (normalizeVisitBusinessKey(c.businessNameSnapshot) === key) return c;
  }
  return null;
}

/** Deterministic next-visit cues from one capture — no scoring engine. */
export function nextVisitGuidanceLines(c: PostRunCapture): string[] {
  const lines: string[] = [];

  if (c.reuseSameRun === "yes") {
    lines.push("Same proof run worked last time — repeat unless the room clearly changed.");
  } else if (c.reuseSameRun === "no") {
    lines.push("Try a different pack or opening order than last visit.");
  } else {
    lines.push("Same run is optional — watch their first reaction before locking in.");
  }

  if (c.askMade) {
    if (c.askTiming === "too_early") {
      lines.push("Ask felt early — hold one more proof beat before you close.");
    } else if (c.askTiming === "too_late") {
      lines.push("Ask felt late — move once you see real interest.");
    } else if (c.askTiming === "on_time") {
      lines.push("Ask timing was on — keep that pacing.");
    }
  } else {
    lines.push("No ask logged — decide if you close light today or book a clean return.");
  }

  if (c.proofStrength === "weak") {
    lines.push("Proof felt weak — change the first screen or strongest moment.");
  } else if (c.proofStrength === "strong") {
    lines.push("Proof landed — keep evidence central.");
  }

  const obj = c.primaryObjection.trim();
  if (obj && obj !== "—" && obj !== "None") {
    lines.push(`Front-load a calm line on: ${obj}.`);
  }

  const note = c.notes.trim();
  if (note) {
    lines.push(`You said to change: ${note}`);
  }

  return lines.slice(0, 4);
}
